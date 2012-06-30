$ ->

  window.BoolExpr = Backbone.Model.extend
      defaults: ->
        LeftTableField: null #''   # TableField
        RightOperand:  '' #''
        Operator: Constants.EQUALS
        isCompoundExpr: false
        deleteOK:false

      set_isCompoundExpr : ->
        # return true if RightOperand is of type TableField
        @set {isCompoundExpr :  (@get('RightOperand') instanceof TableField)},{silent:true}
        
      toString: ->
        #"#{@get('LeftTableField')} #{@get('Operator')} #{@get('RightOperand')} "
        
        if @get 'isCompoundExpr'
          "(#{@get('LeftTableField').toString()} #{@get('Operator')} #{@get('RightOperand').toString()})"
        else
          #"#{@get('LeftTableField')} #{@get('Operator')} #{@get('RightOperand')} "
          op = @get 'Operator'
          rightOp = @get 'RightOperand'
          #enclose in single quotes if used LIKE or rightOp is a string
          #rightOp = "'" + rightOp + "'" if op== Constants.LIKE
          if isNaN(rightOp) or op== Constants.LIKE
            rightOp = "'" + rightOp + "'"
          "(#{@get('LeftTableField')} #{@get('Operator')} #{rightOp})"
    
      getLeftTableField: ->
        @get 'LeftTableField'

      getRightOperand: ->
        @get 'RightOperand'

      clear: ->
        #@destroy()
        #BoolExprs.remove @
        @set deleteOK : true

      isCompound: ->
        return @get 'isCompoundExpr'

      setOperator: (newOp) ->
        @set Operator : newOp

      addBoolExpr: (boolExpr) ->
        ###
          Turns self into CompBoolExpr form BoolExpr
          LeftTableField = clone
          RightOperand = boolExpr
          Operator = AND
        
        ###

        console.log "Inside: addBoolExpr"

        #newLeftTF= @clone() #use BoolExprs.create ?
        newM = @toJSON()
        newLeftTF = BoolExprs.create {
                        LeftTableField : newM.LeftTableField
                        RightOperand: newM.RightOperand
                        Operator: newM.Operator
                        isCompoundExpr: newM.isCompoundExpr

        },{ silent:true}

        try
          @set {
            LeftTableField: newLeftTF
            RightOperand: boolExpr
            Operator: Constants.AND
            }, {silent:true}

        #,{silent:true}
        catch error
          console.log error

        @set {isCompoundExpr : true},{silent: true}
        @trigger()
         

  window.BoolExprView = Backbone.View.extend
        template: _.template($('#bool-expr-template').html())
        events:
          "dragstart ": "setCachedView"
          "click .operator": "changeOperator"
          #"click .operator": "testHnd"
          "blur .right-operand" : "setRightOperand"
          "click .delete" : "clearIfLast"
          "click  .bool.expr.left > .delete" : "clearLeftTableField"
          "click  .bool.expr.right > .delete" : "clearRightTableField"
          
        testHnd:->
           console.log "handled"
        
        setRightOperand:(evt) ->
           #set only if current view is NOT of CompBoolExpr
           #console.log 'arguments'
           #console.log arguments
           #if !@model.isCompound()
           #if $(@el).closest('.expr') == @el
           #handle event only if raised by direct child
           #if @.$('.right-operand').get(0) == evt.srcElement
           if $(@el).children('.right-operand').get(0) == evt.srcElement
             val = @.$('.right-operand').val()
             @model.set RightOperand: val

        className: "expr"
        initialize: ->
           #@model.bind('change:isCompoundExpr', @chgNode, @)
           #@model.bind('change', @render_spcl, this)
           @model.bind('change', @render, this)
           @model.bind('change:isCompoundExpr', @render, this)
           #@model.bind('change', @childExprRemoved, this)
           #@model.bind('remove', @clear, this)

           @model.bind('destroy', @remove, this)
           
           @leftView=null
           @rightView=null

        #clearBoolExpr: ->



        #clear: ->
          #if !@model.isCompound()
            #@model.clear()
            #@remove()

        #childExprRemoved: ->
          ##if both are in place NO OP
          #return 0 if @model.getLeftTableField() and @model.getRightOperand()
          ##not removed one
          ##liveExpr = if @model.getLeftTableField then 
          ##liveExpr if @model.getLeftTableField?
          #liveExpr = @model.getLeftTableField() or @model.getRightOperand()
          ##if @model.getLeftTableField().get 'deleteOK'

          #@model.set {
            #LeftTableField : liveExpr.LeftTableField
            #Operator: liveExpr.Operator
            #RightOperand: liveExpr.RightOperand
            #isCompoundExpr: liveExpr.isCompoundExpr
          #},{silent:true}
          ##@model.set {isCompoundExpr : false},{silent:true}
          #@model.trigger()


        render: ->
          #$(@el).html(@template(@model.toJSON()))
          #@model.set_isCompoundExpr()
          if(@model.get('isCompoundExpr'))
            console.log 'rendering CompBoolExpr...'
            console.log @model.toString()

            #@leftView.render()
            #@rightView.render()
            
            #explicitly trigger change to force rendering
            @model.get('LeftTableField').trigger('change')
            @model.get('RightOperand').trigger('change')
            #@renderOperator()
          else
            $(@el).html(@template(@model.toJSON()))
            SQLPaneView.render()
          @

        renderOperator: ->
          #renders everything but left and right operand
          #$(@el).html(@template(@model.toJSON()))
          #@.$('.operator').html(@template(@model.toJSON()))
          #@.$('.operator').html(@template(@model.toJSON())
          $(@el).children('.operator').html(@template(@model.toJSON()))
          @

        convertView2CompExpr: ->
          #renders 
          $(@el).html(@template(@model.toJSON()))
          #@.$('.operator')
          #$(@el).closest('.operator')
          $(@el).children('.operator')
            .before($(@leftView.el))  #detach from existing DOM parent
            .after(@rightView.el)
          @renderOperator()

        setCachedView: ->
          WhereExprMgr.cachedView= @

        addBoolExpr:(boolExpr, boolExprView) ->
          @bool2compound(boolExpr, boolExprView)

        bool2compound:(boolExpr, boolExprView) ->
          ###
              cache existing el.html
              create new view with this.model
              set view.el.html = cache.html
              view.el.addClass 'left'
              @leftView = view
              @rightView = boolExprView
              @rightView.addClass 'right'

          ###
          @model.addBoolExpr(boolExpr)
          #look out if child nodes get deleted
          #@model.getLeftTableField.bind 'remove',@childExprRemoved,@
          #@model.getRightOperand.bind 'remove',@childExprRemoved,@

          #@model.getLeftTableField.bind 'change:deleteOK',@childExprRemoved,@
          #@model.getRightOperand.bind 'change:deleteOK',@childExprRemoved,@

          @leftView = new BoolExprView(
                    model: @model.get('LeftTableField')
                    #className: 'bool expr left'
                    el: $(@el).clone().addClass('bool expr left')
                    ) #.render()
                    #model for the new view will be the new LeftTableField

          $(boolExprView.el).addClass 'bool expr right'
          @rightView = boolExprView.render()
          @convertView2CompExpr()
          #@render()

        changeOperator: (evt)->
            return 0 if $(@el).children('.operator').get(0) != evt.srcElement
            #@model.setOperator @.$('.operator').val()
            @model.setOperator $(evt.srcElement).val()

        clearLeftTableField: (evt)->
          #return 0 if $(@el).children('.delete').get(0) != evt.srcElement
          #@model.set LeftTableField : null
          #BoolExprs.remove @model.getLeftTableField()  #remove old expr
          #@model.getLeftTableField().destroy()
          deadExpr = @model.getLeftTableField()
          return 0 if deadExpr instanceof TableField
          liveExpr = @model.getRightOperand().toJSON()
          @model.set {
            LeftTableField : liveExpr.LeftTableField
            Operator: liveExpr.Operator
            RightOperand: liveExpr.RightOperand
            #isCompoundExpr: liveExpr.isCompoundExpr
            isCompoundExpr:false
          }
          #,{silent:true}
          #@initialize()
          #@model.set {isCompoundExpr : false},{silent:true}
          #@model.trigger('change')
          

        clearRightTableField: (evt)->
          deadExpr = @model.getRightOperand()
          return 0 if deadExpr instanceof TableField
          liveExpr = @model.getLeftTableField().toJSON()
          @model.set {
            LeftTableField : liveExpr.LeftTableField
            Operator: liveExpr.Operator
            RightOperand: liveExpr.RightOperand
            #isCompoundExpr: liveExpr.isCompoundExpr
            isCompoundExpr:false
          }
        
        clearIfLast: ->
          if WhereExprMgr.el.find('.expr').size() ==  1
            @resetWhereExpr()

        resetWhereExpr: ->
          #BoolExprs.reset()
          BoolExprs.each (m)->
            m.destroy()
          WhereExprMgr.rootBoolExprView = null
          SQLPaneView.render()




  window.BoolExprList = Backbone.Collection.extend
      model: BoolExpr
      localStorage: new Store("BoolExprs")
      initialize: ->
        @bind("add",@createView,@)

      createView: (boolExpr)->
        view = new BoolExprView( model: boolExpr )
        WhereExprMgr.addAtRootLevel boolExpr, view
        SQLPaneView.render()

  window.BoolExprs = new BoolExprList()
    
  #manages Where exprs
  window.WhereExprMgr = {

    ###
    WhereExprMgr: ->
      BoolExprs.bind "add"
    ###
    addNewBoolExpr : (tableFld)->
      console.log tableFld
      BoolExprs.create( LeftTableField: tableFld )

    rootBoolExprView: null    #stores the root node

    el: $('#pane-where')

    addAtRootLevel: (boolExpr,view) ->
      # sets rootBoolExprView OR Compounds with root
        if @rootBoolExprView is null
          @el.append(view.render().el)
          @rootBoolExprView=view
        else
          @rootBoolExprView.addBoolExpr(boolExpr,view)
          @rootBoolExprView.render()

  }

  ###
  WhereExprMgr.addNewBoolExpr TableFields.first()
  WhereExprMgr.addNewBoolExpr TableFields.last()
  ###
  #this must be moved in WhereExprMgr's constructor
  #BoolExprs.bind "add", WhereExprMgr.addOne,  WhereExprMgr
  #BoolExprs.bind "change:LeftTableField", WhereExprMgr.addOne,  WhereExprMgr

  #WhereExpr is a view for the root node of BoolExpr
