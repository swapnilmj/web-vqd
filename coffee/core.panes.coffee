$ ->
  #panes

  ###
    SelectItemView
  ###
  window.SelectItemView =  Backbone.View.extend {
    
      template: _.template($('#paneLi-select-template').html())
            
      events:
        "blur input" : "setAlias"
        "click .delete" : "deselectField"
       
      initialize: ->
        @model.bind('change', @render, this)
        @model.bind('change:Selected', @moveToLastInPane, this)
        @model.bind('destroy', @remove, this)
        SelectPaneView.bind 'evtRearranged' , @setSelfSelectionOrder , this


      render: ->
        $(@el).html(@template(@model.toJSON()))
        return this

      deselectField : ->
        @model.toggleSelected()

      setSelfSelectionOrder: ->
        console.log 'setSelfSelectionOrder'
        @model.set {SelectionOrder: $(@el).index()}

      moveToLastInPane: ->
        if(@model.get('Selected')== false)
          # detach and store in el(?) so that SelectionOrder starts from 1
          return
        par = $(@el).parent()
        i = $(@el).detach()
        $(par).append(i)

      setAlias: ->
        console.log('setting alias')
        alias = $(@el).find('input').val()
        @model.set Alias: alias
      }
  

  #SelectPaneView
  window.SelectPaneView =
    new (Backbone.View.extend

          el: $('#pane-select')
          events:
            "sortstop div" : "SelectionOrder_DOM2model"
          
          initialize: ->
            TableFields.bind('add', @addOne, this)
            @el.sortable()

          addOne: (tf) ->
            view= new SelectItemView( model: tf )
            @el.append view.render().el

          SelectionOrder_DOM2model: ->
            console.log 'SelectionOrder_DOM2model'
            @trigger 'evtRearranged'
      )

  window.OrderbyItemView = Backbone.View.extend
      className: ''
      template: _.template($('#paneLI-orderby-template').html())

      events:
        "change select": "changeSortOrder"
        "click .delete" : "removeSort"

      initialize: ->
         @model.bind('change', @render, this)
         @model.bind('destroy', @remove, this)
         OrderbyPaneView.bind 'evtRearranged' , @setSelfSortOrder , this

      render: ->
        $(@el).html(@template(@model.toJSON()))
        @

      removeSort : () ->
        @model.toggleSort()   #sets to UNSORTED

      changeSortOrder: ->
        console.log this.$('select').val()
        console.log 'changeSortOrder'
        @model.set Sort : this.$('select').val()
        return

       setSelfSortOrder: ->
        console.log 'setSelfSortOrder'
        @model.setSortOrder $(@el).index()


  window.OrderbyPaneView =
    new (Backbone.View.extend
          el: $('#pane-order-by')
          events:
            "sortstop div" : "SelectionOrder_DOM2model"
          
          initialize: ->
            TableFields.bind('add', @addOne, this)
            @el.sortable()

          addOne: (tf) ->
            view= new OrderbyItemView( model: tf )
            @el.append view.render().el

          SelectionOrder_DOM2model: ->
            console.log 'SelectionOrder_DOM2model'
            @trigger 'evtRearranged'

      )

  ###
    Joins
  ###

  window.JoinItemView = Backbone.View.extend
      className: ''
      template: _.template($('#paneLI-join-template').html())
      events:
        "change select": "changeJoinType"
        #"click .delete" : "removeItem"

      initialize: ->
         @model.bind('change', @render, this)
         @model.bind('change:Selected', @moveToLastInPane, this)
         @model.bind('destroy', @remove, this)
         JoinPaneView.bind 'evtRearranged' , @setSelfSelectionOrder , this

      render: ->
        $(@el).html(@template(@model.toJSON()))
        @

      changeJoinType: ->
        console.log this.$('select').val()
        @model.set Type :  this.$('select').val()

        return

      setSelfSelectionOrder: ->
        console.log 'setSelfSelectionOrder'
        @model.setSelectionOrder $(@el).index()
        Joins.sort()

      moveToLastInPane: ->
        if(@model.get('Selected')== false) 
          # detach and store in el(?) so that SelectionOrder starts from 1
          return
        par = $(@el).parent()
        i = $(@el).detach()
        $(par).append(i)


  window.JoinPaneView =
    new (Backbone.View.extend
          el: $('#pane-join')
          events:
            "sortstop div" : "SelectionOrder_DOM2model"
          
          initialize: ->
            Joins.bind('add', @addOne, this)
            #@el.sortable handle : '.rearrange'
            #@el.sortable()

          addOne: (jf) ->
            view= new JoinItemView( model: jf )
            @el.append view.render().el

          SelectionOrder_DOM2model: ->
            console.log 'SelectionOrder_DOM2model:Join'
            @trigger 'evtRearranged'
    )

  #
  # SQL generation
  #
  window.SQLPaneView =
      new ( Backbone.View.extend
            ###
            template: _.template($('#template').html())
            events:
            ###
           
            el: $('.output > pre')
            initialize: ->
               TableFields.bind('change', @render, this)
               TableFields.bind('remove', @render, this)
               Joins.bind('change', @render, this)
               Joins.bind('reset', @render, this)
               Joins.bind('remove', @render, this)
               @listenEvents = true
            
            render: ->
              try
                #$(@el).html(@getSQL())
                $(@el).html(@getSQL()) if @listenEvents
              catch error
                #console.log error     #soln. : trigger change event after all models are fetched
              finally
                @

            getFullFieldName : (Alias=true)->
              #ret = "`" + @TableName + "`.`" + @ColumnName + "`"
              ret = "" + @TableName + "." + @ColumnName + ""
              if Alias
                ret += " AS " + @Alias  unless @Alias is ""
              ret

            getOrderbyPart: ->
              switch @Sort
                when 'ASC' then  str= ''
                when 'DESC' then  str= 'DESC'     #the text assigned to str is of SQL syntax
                else str=''   #UNSORTED
              str

            getJoinPart: ->
              joinCnt = Joins.length
              #return just the table name if only single table is added
              if joinCnt == 0
                return TableFields.first().get('TableName')

              ret=''
              ret += Array( joinCnt + 1 ).join '('     #opening brackets for all joins
              ret += @toJoinString.call(Joins.first().toJSON() ,true)
              for jfm in Joins.toJSON()[1..joinCnt ]
                ret += @toJoinString.call(jfm)
              return ret
              
            toJoinString : (isFirst=false) ->
              getJoinName = (constName) ->
                switch constName
                    when 'INNER_JOIN' then return ' INNER JOIN '
                    when 'CROSS_JOIN' then return ' CROSS JOIN '
                    when 'LEFT_OUTER' then return ' LEFT OUTER JOIN '
                    when 'RIGHT_OUTER' then return ' RIGHT OUTER JOIN '

              #ret = "#{ if isFirst then @LeftTable else '\r\n\t\t' } #{@Type} #{@RightTable} "
              ret = "#{ if isFirst then @LeftTable else '\r\n\t\t' } #{getJoinName( @Type) } #{@RightTable} "
              if @Type != 'CROSS_JOIN'
                #ret += " ON " + (" #{@LeftTable}.#{col[0]} = #{@RightTable}.#{col[1]}" for col in  @Fields ).join(' AND ')
                ret += " ON " + (" #{@LeftTable}.#{@LeftField} = #{@RightTable}.#{@RightField}" )
              return ret + ")"
                               
            getWherePart: ->
               #"CustName LIKE 'Prof%'"
               #"1=1"
               
               $('#pane-where textarea').val()

            getSQL: ->
              #Select part
              selectedFields = _.sortBy ( m for m in TableFields.toJSON() when m.Selected ) ,
                        (i) -> i.SelectionOrder
              selectPart = ( @getFullFieldName.apply(f) for f in selectedFields ).join(", ")

              #join
              joinPart = @getJoinPart()

              #where
              wherePart = @getWherePart()
              #order by
              orderbyFields =  _.sortBy ( m for m in TableFields.toJSON() when m.Sort != 'UNSORTED' ) ,
                        (i) -> i.SortOrder
              orderbyPart = (  @getFullFieldName.call(f,false) + ' ' + @getOrderbyPart.apply(f) for f in orderbyFields ).join(", ")

              ret = "SELECT \n\t#{selectPart} \n"
              ret +="FROM \n\t#{joinPart} \n"
              if wherePart != ""
                ret +="WHERE \n\t#{wherePart} \n"
              if orderbyPart != ""
                ret +="ORDER BY \n\t#{orderbyPart}"
              else
                ret += "\n\n"
              return ret
      
      )

  _.extend(SelectPaneView, Backbone.Events)
  _.extend(OrderbyPaneView, Backbone.Events)
  _.extend(JoinPaneView, Backbone.Events)
