
$(function() {
  window.BoolExpr = Backbone.Model.extend({
    defaults: function() {
      return {
        LeftTableField: null,
        RightOperand: '',
        Operator: Constants.EQUALS,
        isCompoundExpr: false,
        deleteOK: false
      };
    },
    set_isCompoundExpr: function() {
      return this.set({
        isCompoundExpr: this.get('RightOperand') instanceof TableField
      }, {
        silent: true
      });
    },
    toString: function() {
      var op, rightOp;
      if (this.get('isCompoundExpr')) {
        return "(" + (this.get('LeftTableField').toString()) + " " + (this.get('Operator')) + " " + (this.get('RightOperand').toString()) + ")";
      } else {
        op = this.get('Operator');
        rightOp = this.get('RightOperand');
        if (isNaN(rightOp) || op === Constants.LIKE) rightOp = "'" + rightOp + "'";
        return "(" + (this.get('LeftTableField')) + " " + (this.get('Operator')) + " " + rightOp + ")";
      }
    },
    getLeftTableField: function() {
      return this.get('LeftTableField');
    },
    getRightOperand: function() {
      return this.get('RightOperand');
    },
    clear: function() {
      return this.set({
        deleteOK: true
      });
    },
    isCompound: function() {
      return this.get('isCompoundExpr');
    },
    setOperator: function(newOp) {
      return this.set({
        Operator: newOp
      });
    },
    addBoolExpr: function(boolExpr) {
      /*
                Turns self into CompBoolExpr form BoolExpr
                LeftTableField = clone
                RightOperand = boolExpr
                Operator = AND
      */
      var newLeftTF, newM;
      console.log("Inside: addBoolExpr");
      newM = this.toJSON();
      newLeftTF = BoolExprs.create({
        LeftTableField: newM.LeftTableField,
        RightOperand: newM.RightOperand,
        Operator: newM.Operator,
        isCompoundExpr: newM.isCompoundExpr
      }, {
        silent: true
      });
      try {
        this.set({
          LeftTableField: newLeftTF,
          RightOperand: boolExpr,
          Operator: Constants.AND
        }, {
          silent: true
        });
      } catch (error) {
        console.log(error);
      }
      this.set({
        isCompoundExpr: true
      }, {
        silent: true
      });
      return this.trigger();
    }
  });
  window.BoolExprView = Backbone.View.extend({
    template: _.template($('#bool-expr-template').html()),
    events: {
      "dragstart ": "setCachedView",
      "click .operator": "changeOperator",
      "blur .right-operand": "setRightOperand",
      "click .delete": "clearIfLast",
      "click  .bool.expr.left > .delete": "clearLeftTableField",
      "click  .bool.expr.right > .delete": "clearRightTableField"
    },
    testHnd: function() {
      return console.log("handled");
    },
    setRightOperand: function(evt) {
      var val;
      if ($(this.el).children('.right-operand').get(0) === evt.srcElement) {
        val = this.$('.right-operand').val();
        return this.model.set({
          RightOperand: val
        });
      }
    },
    className: "expr",
    initialize: function() {
      this.model.bind('change', this.render, this);
      this.model.bind('change:isCompoundExpr', this.render, this);
      this.model.bind('destroy', this.remove, this);
      this.leftView = null;
      return this.rightView = null;
    },
    render: function() {
      if (this.model.get('isCompoundExpr')) {
        console.log('rendering CompBoolExpr...');
        console.log(this.model.toString());
        this.model.get('LeftTableField').trigger('change');
        this.model.get('RightOperand').trigger('change');
      } else {
        $(this.el).html(this.template(this.model.toJSON()));
        SQLPaneView.render();
      }
      return this;
    },
    renderOperator: function() {
      $(this.el).children('.operator').html(this.template(this.model.toJSON()));
      return this;
    },
    convertView2CompExpr: function() {
      $(this.el).html(this.template(this.model.toJSON()));
      $(this.el).children('.operator').before($(this.leftView.el)).after(this.rightView.el);
      return this.renderOperator();
    },
    setCachedView: function() {
      return WhereExprMgr.cachedView = this;
    },
    addBoolExpr: function(boolExpr, boolExprView) {
      return this.bool2compound(boolExpr, boolExprView);
    },
    bool2compound: function(boolExpr, boolExprView) {
      /*
                    cache existing el.html
                    create new view with this.model
                    set view.el.html = cache.html
                    view.el.addClass 'left'
                    @leftView = view
                    @rightView = boolExprView
                    @rightView.addClass 'right'
      */      this.model.addBoolExpr(boolExpr);
      this.leftView = new BoolExprView({
        model: this.model.get('LeftTableField'),
        el: $(this.el).clone().addClass('bool expr left')
      });
      $(boolExprView.el).addClass('bool expr right');
      this.rightView = boolExprView.render();
      return this.convertView2CompExpr();
    },
    changeOperator: function(evt) {
      if ($(this.el).children('.operator').get(0) !== evt.srcElement) return 0;
      return this.model.setOperator($(evt.srcElement).val());
    },
    clearLeftTableField: function(evt) {
      var deadExpr, liveExpr;
      deadExpr = this.model.getLeftTableField();
      if (deadExpr instanceof TableField) return 0;
      liveExpr = this.model.getRightOperand().toJSON();
      return this.model.set({
        LeftTableField: liveExpr.LeftTableField,
        Operator: liveExpr.Operator,
        RightOperand: liveExpr.RightOperand,
        isCompoundExpr: false
      });
    },
    clearRightTableField: function(evt) {
      var deadExpr, liveExpr;
      deadExpr = this.model.getRightOperand();
      if (deadExpr instanceof TableField) return 0;
      liveExpr = this.model.getLeftTableField().toJSON();
      return this.model.set({
        LeftTableField: liveExpr.LeftTableField,
        Operator: liveExpr.Operator,
        RightOperand: liveExpr.RightOperand,
        isCompoundExpr: false
      });
    },
    clearIfLast: function() {
      if (WhereExprMgr.el.find('.expr').size() === 1) return this.resetWhereExpr();
    },
    resetWhereExpr: function() {
      BoolExprs.each(function(m) {
        return m.destroy();
      });
      WhereExprMgr.rootBoolExprView = null;
      return SQLPaneView.render();
    }
  });
  window.BoolExprList = Backbone.Collection.extend({
    model: BoolExpr,
    localStorage: new Store("BoolExprs"),
    initialize: function() {
      return this.bind("add", this.createView, this);
    },
    createView: function(boolExpr) {
      var view;
      view = new BoolExprView({
        model: boolExpr
      });
      WhereExprMgr.addAtRootLevel(boolExpr, view);
      return SQLPaneView.render();
    }
  });
  window.BoolExprs = new BoolExprList();
  return window.WhereExprMgr = {
    /*
        WhereExprMgr: ->
          BoolExprs.bind "add"
    */
    addNewBoolExpr: function(tableFld) {
      console.log(tableFld);
      return BoolExprs.create({
        LeftTableField: tableFld
      });
    },
    rootBoolExprView: null,
    el: $('#pane-where'),
    addAtRootLevel: function(boolExpr, view) {
      if (this.rootBoolExprView === null) {
        this.el.append(view.render().el);
        return this.rootBoolExprView = view;
      } else {
        this.rootBoolExprView.addBoolExpr(boolExpr, view);
        return this.rootBoolExprView.render();
      }
    }
  };
  /*
    WhereExprMgr.addNewBoolExpr TableFields.first()
    WhereExprMgr.addNewBoolExpr TableFields.last()
  */
});
