###
Web-based Visual Query Designer is an open source software released under the MIT License
###

$ ->
  window.Constants = {
        EQUALS : '='
        LIKE : 'LIKE'
        LESS_THAN : '<'
        GREATER_THAN : '>'
        LESS_EQUAL : '<='
        GREATER_EQUAL : '>='
        NOT_EQUAL : '<>'
        AND : ' AND '
        OR : ' OR '
        }

  Constants.DIAG_CELL_HEIGHT = 18
  Constants.DIAG_UNIQUE_ID = "diag-table-"
  #Models
  window.TableField = Backbone.Model.extend
      defaults: ->
        ColumnName: ""
        Selected: false
        Alias: ""
        Sort: 'UNSORTED'
        SortOrder: 0
        IsPrimaryKey: ""
        SelectionOrder:0
        left: 0
        #top: 0
        setJoinLeft: -1   #value is irrelevant. used only for triggering change
        setJoinRight: -1

      chgJoinLeft: ->
        @set( setJoinLeft : @get('setJoinLeft')*(-1) )

      chgJoinRight: ->
        @set( setJoinRight : @get('setJoinRight')*(-1) )

      toggleSelected: ->
        if @get("Selected")
          @set
            SelectionOrder: 0
            Selected: false
        else
          @set
            SelectionOrder: TableFields.nextSelectionOrderNo( @.get('TableName') )
            Selected: true

      setTop: (top) ->
        @set top:top

      setSortOrder: (newIdx) ->
        #accepts a value and sets only if Sort != UNSORTED
        @set {SortOrder:
          if @get('Sort')=='UNSORTED' then 0 else newIdx}

      changeTopLeft: (dx, dy) ->
        @set top: @get('top')+dy , silent:true 
        @set left: @get('left')+dx , silent:true
        @trigger()

      toggleSort: ->
        if @.get('Sort') == 'UNSORTED'
          @.set Sort : 'ASC'
        else
          @.set Sort : 'UNSORTED'

      toString: ()->
        @get('TableName') + "." + @get("ColumnName")

         
  # boolexpr code moved to bool-expr.coffee
  
  #Collections
  window.TableFieldList = Backbone.Collection.extend
      model: TableField
      localStorage: new Store("TableFields")

      nextSelectionOrderNo: (tableName)->
        myTFs= @getModelsByTableName tableName
        lastSelOrder = _.max myTFs , (m) -> m.get('SelectionOrder')
        lastSelOrder = lastSelOrder.get 'SelectionOrder'
        return lastSelOrder+1

       getModelsByTableName: (tableName) ->
        @filter (m) -> m.get('TableName')== tableName

       getModelByTableCol: (tableName,colName) ->
        @find (m) -> m.get('TableName')== tableName and m.get('ColumnName')== colName

       getNextTF_Top: (tableName) ->
        myTFs = @getModelsByTableName tableName
        lastTFM = _.max myTFs , (m) -> m.get('top')
        if lastTFM?
          return lastTFM.get('top')+ Constants.DIAG_CELL_HEIGHT
        else
          return Constants.DIAG_CELL_HEIGHT
        
  window.TableFields = new TableFieldList()

  #View
  window.TableFieldView = Backbone.View.extend
        className: 'diag-cell'
        template: _.template($('#table-field-template').html())
        events:
          "click input": "toggleSelected",
          "dragstart .cell-dragger": "setJoinLeftTable",
          "drop .cell-dragger": "setJoinRightTable"
          "click .orderby ": "toggleSort"
          #"click .add-condition ": "addToWhere"

        initialize: ->
           @model.bind('change', @render, this)
           @model.bind('change:setJoinLeft', @setJoinLeftTable, this)   #used in MODIFY mode
           @model.bind('change:setJoinRight', @setJoinRightTable, this)   #used in MODIFY mode
           @model.bind('destroy', @clear, this)    #remove view if model is destroyed

           $(@el).draggable
            helper: "clone"
            cursor: "move"
           $(@el).droppable()
           #the model of respective  Table seen at the top
           @options.GroupTable.bind 'change' , @reposition , this
        
        clear: ->
          jsPlumb.detachAllConnections @el
          @remove()

        render: ->
          $(@el)
            .css("top", @model.get("top"))
            .css("left", @model.get("left"))
            .css("position","absolute"  )
          $(@el).html(@template(@model.toJSON()))
          @

        reposition : ->
          #console.log 'repositioning'
          dx = @options.GroupTable.get('chgX')
          dy = @options.GroupTable.get('chgY')
          @model.changeTopLeft dx, dy

        opacify: (what) ->

          $(@el).css  opacity: if what then 0.5 else 1.0

        setJoinLeftTable :  ->
          vqd.setJoinLeftField @el , @model.get('TableName'), @model.get('ColumnName')

        setJoinRightTable: ->
          vqd.completeJoin @el , @model.get('TableName'), @model.get('ColumnName')

        toggleSelected: ->
          @model.toggleSelected()

        toggleSort: ->
          @model.toggleSort()

  window.Table = Backbone.Model.extend
      defaults: ->
        TableName: ''
        left:0
        top:0
        chgX:0
        chgY:0
        NoOfFields:0

      incrFieldCounter: ->
        #increase fieldCounter
        @set NoOfFields: @get('NoOfFields')+1

      set_dx_dy:(dx,dy) ->
        @set {chgX : dx, chgY : dy}
          , silent:true
        @

      changeTopLeft: (dx, dy) ->
        @set {top: @get('top')+dy }
          , silent:true
        @set {left: @get('left')+dx}
          , silent:true
        @

      triggerChanges: ->
        @change()

  window.TableList = Backbone.Collection.extend
      model: Table
      localStorage: new Store("Tables")

      initialize: ->
        @bind('add',@addOne,this)

      addOne: (table) ->
        view = new TableView( model: table )
        $('#design-pane').append(view.render().el)

      getModelByTableName: (tableName) ->
        @find (m) -> m.get('TableName')== tableName

      getLasttableName: ->
        @last(2)[0].get('TableName')    #return last but one element since last element is the new element added

  window.Tables = new TableList()

  #instead of one big view for all TableFields
  #we have TableView(s) working for a group(single Table)
  #model : Table
  window.TableView = Backbone.View.extend
        className: 'diag-cell label'
        template: _.template($('#table-label-template').html())
        events:
          "dragstop .label": "dragStopped"
          "click .close": "removeTable"

        initialize: ->
           TableFields.bind('add', @addOne, this)
           this.model.bind("change", this.render, this)

           $(@el).draggable
                helper: 'clone'
                cursor: 'move'
                #distance: 20

           $(@el)
            .css("position","absolute"  )

        addOne: (tf) ->
          tableName = tf.get('TableName')
          if tableName == @model.get('TableName')
            @model.incrFieldCounter()
            tf.setTop(TableFields.getNextTF_Top(tableName) )
            view =new TableFieldView( model: tf , GroupTable: @model )
            $('#design-pane').append view.render().el

        render: ->
          $(@el).css("top", @model.get('top')).css "left", @model.get('left')
          $(this.el).html(this.template(this.model.toJSON()))
          @
        
        dragStopped: (event, ui) ->
          #console.log "drag Stopped"
          chgTop = ui.position.top - ui.originalPosition.top
          chgLeft = ui.position.left - ui.originalPosition.left
          @model.set_dx_dy chgLeft , chgTop
          @model.changeTopLeft chgLeft , chgTop
          @model.triggerChanges()

          jsPlumb.repaintEverything()


        removeTable: ->
          #console.log "removing table"
          tableName=@model.get('TableName')

          for mTF in TableFields.getModelsByTableName( tableName )
            mTF.destroy()
          @model.destroy()
          @remove()
          Joins.removeJoinByTableName tableName
          removeSelection(tableName)


  window.AddTable= (tableName)->
      #exit if table is already added
      if Tables.find( ((item) ->
                item.get('TableName') == tableName)
                , @)
            #console.log "Table #{tableName} already added"
            return 0
      $.ajax({
          url: 'ajax/table_json.php',
          dataType: 'json',
          data: { table: tableName },
          #async:false
        }).done( (data) ->
              SQLPaneView.listenEvents=false
              Tables.create  TableName: tableName                

              for d in data
                #console.time "creating TF"
                TableFields.create d
                #console.timeEnd "creating TF"
              SQLPaneView.listenEvents=true
              
              TableFields.trigger()
              SQLPaneView.render()
        )
      
        #SQLPaneView.render()

  window.Join = Backbone.Model.extend
      defaults: ->
        Type: 'CROSS_JOIN'
        SelectionOrder: Joins.nextSelectionOrderNo()
        Fields: []
        LeftField:''
        RightField:''
        ###
        LeftTable
        RightTable
        ###
      setSelectionOrder: (newIdx) ->
        @set {SelectionOrder:
           newIdx}

      joinOn : (tblLeft,colLeft,tblRight,colRight,joinType="INNER_JOIN") ->
        @set {Type: joinType} , silent:true

        if @get('LeftTable')== tblLeft
          @set LeftField : colLeft
          @set RightField : colRight
        else
          @set LeftField : colRight
          @set RightField : colLeft
        

  window.JoinView = Backbone.View.extend(
    initialize: ->
      @model.bind "change", @render, this

    render: ->
      jsPlumb.repaintEverything()
  )
  
  window.JoinList = Backbone.Collection.extend
      model: Join
      localStorage: new Store("Joins")

      initialize: ->
        #Tables.bind "remove",@removeJoinByTableName,@
        
      nextSelectionOrderNo: ->
        return 1 if @models.length is 0
        lastSelOrder = _.max @models , (m) -> m.get('SelectionOrder')
        lastSelOrder = lastSelOrder.get 'SelectionOrder'
        return lastSelOrder+1

      comparator: (m) ->
        m.get 'SelectionOrder'

      getJoinsByTableName:  (tableName) ->
        @tableName = tableName
        @.filter (item) =>
            m= item.toJSON()
            m.LeftTable == @tableName || m.RightTable==@tableName

      removeJoinByTableName: (tableName) ->
        #console.log 'removing join'
        for i in @getJoinsByTableName tableName
          i.destroy()

  window.Joins = new JoinList()
         
  ###
    misc. functions
  ###

  window.fetchTableResults = (tableName,qid)->
        #fetches resultset of a table in JSON
        window.resultset = null
        $.ajax({
            url: 'ajax/table_results.php',
            dataType: 'json',
            #data: { table: tableName , where: where },
            data: { table: tableName , qid: qid },
            #context: @
            async:false
        }).done( (data) ->
            window.resultset = data
        )
        window.resultset

  window.vqd = {

    getStringForConst: (constant) ->
      switch constant
        when 'INNER_JOIN' then return ' INNER JOIN '
    setJoinLeftField : (el, tableName, columnName) ->
      @leftJoinEl =  el
      @leftJoinColumn = { TableName: tableName , ColumnName: columnName }

    completeJoin : (el, tableName, columnName) ->
      my = @    #this alias
      #
      return 0 if @leftJoinColumn.TableName == tableName
      newJoinHost = Joins.find (m) ->
              (m.get('LeftTable') ==  vqd.leftJoinColumn.TableName and m.get('RightTable') == tableName) or
              (m.get('RightTable') ==  vqd.leftJoinColumn.TableName and m.get('LeftTable') == tableName)
      if (newJoinHost?)
          newJoinHost.joinOn(@leftJoinColumn.TableName, @leftJoinColumn.ColumnName,tableName, columnName)
      else
          Joins.create {
                  LeftTable  : @leftJoinColumn.TableName
                  LeftField  : @leftJoinColumn.columnName
                  RightTable : tableName
                  RghtField  : columnName
                  }
      ConnectTableFields @leftJoinEl, el
  }

  ###
    Connect
  ###

  jsPlumb.connectorClass = "diag-join"
  window.ConnectTableFields = (elemStart, elemEnd) ->
    connectorPaintStyle =
    lineWidth: 5
    #strokeStyle: "#CC8A1A"
    strokeStyle: "#7794CE"

    common =
    anchor: [ "RightMiddle", "LeftMiddle" ]
    isSource: true
    endpoint: "Blank"
    isTarget: true

    e0 = jsPlumb.addEndpoint(elemStart, common,
    connectorStyle: connectorPaintStyle
    paintStyle:
      fillStyle: "#225588"
      radius: 7

    connector: [ "Flowchart" ]
    )
    e1 = jsPlumb.addEndpoint(elemEnd, common,
    connectorStyle: connectorPaintStyle
    paintStyle:
      fillStyle: "#225588"
      radius: 7
    )
    jsPlumb.connect
      source: e0
      target: e1
      overlays: [ [ "Label",
        label: "-"
        location: 0.5
       ] ]
