
$(function() {
  /*
      SelectItemView
  */  window.SelectItemView = Backbone.View.extend({
    template: _.template($('#paneLi-select-template').html()),
    events: {
      "blur input": "setAlias",
      "click .delete": "deselectField"
    },
    initialize: function() {
      this.model.bind('change', this.render, this);
      this.model.bind('change:Selected', this.moveToLastInPane, this);
      this.model.bind('destroy', this.remove, this);
      return SelectPaneView.bind('evtRearranged', this.setSelfSelectionOrder, this);
    },
    render: function() {
      $(this.el).html(this.template(this.model.toJSON()));
      return this;
    },
    deselectField: function() {
      return this.model.toggleSelected();
    },
    setSelfSelectionOrder: function() {
      console.log('setSelfSelectionOrder');
      return this.model.set({
        SelectionOrder: $(this.el).index()
      });
    },
    moveToLastInPane: function() {
      var i, par;
      if (this.model.get('Selected') === false) return;
      par = $(this.el).parent();
      i = $(this.el).detach();
      return $(par).append(i);
    },
    setAlias: function() {
      var alias;
      console.log('setting alias');
      alias = $(this.el).find('input').val();
      return this.model.set({
        Alias: alias
      });
    }
  });
  window.SelectPaneView = new (Backbone.View.extend({
    el: $('#pane-select'),
    events: {
      "sortstop div": "SelectionOrder_DOM2model"
    },
    initialize: function() {
      TableFields.bind('add', this.addOne, this);
      return this.el.sortable();
    },
    addOne: function(tf) {
      var view;
      view = new SelectItemView({
        model: tf
      });
      return this.el.append(view.render().el);
    },
    SelectionOrder_DOM2model: function() {
      console.log('SelectionOrder_DOM2model');
      return this.trigger('evtRearranged');
    }
  }));
  window.OrderbyItemView = Backbone.View.extend({
    className: '',
    template: _.template($('#paneLI-orderby-template').html()),
    events: {
      "change select": "changeSortOrder",
      "click .delete": "removeSort"
    },
    initialize: function() {
      this.model.bind('change', this.render, this);
      this.model.bind('destroy', this.remove, this);
      return OrderbyPaneView.bind('evtRearranged', this.setSelfSortOrder, this);
    },
    render: function() {
      $(this.el).html(this.template(this.model.toJSON()));
      return this;
    },
    removeSort: function() {
      return this.model.toggleSort();
    },
    changeSortOrder: function() {
      console.log(this.$('select').val());
      console.log('changeSortOrder');
      this.model.set({
        Sort: this.$('select').val()
      });
    },
    setSelfSortOrder: function() {
      console.log('setSelfSortOrder');
      return this.model.setSortOrder($(this.el).index());
    }
  });
  window.OrderbyPaneView = new (Backbone.View.extend({
    el: $('#pane-order-by'),
    events: {
      "sortstop div": "SelectionOrder_DOM2model"
    },
    initialize: function() {
      TableFields.bind('add', this.addOne, this);
      return this.el.sortable();
    },
    addOne: function(tf) {
      var view;
      view = new OrderbyItemView({
        model: tf
      });
      return this.el.append(view.render().el);
    },
    SelectionOrder_DOM2model: function() {
      console.log('SelectionOrder_DOM2model');
      return this.trigger('evtRearranged');
    }
  }));
  /*
      Joins
  */
  window.JoinItemView = Backbone.View.extend({
    className: '',
    template: _.template($('#paneLI-join-template').html()),
    events: {
      "change select": "changeJoinType"
    },
    initialize: function() {
      this.model.bind('change', this.render, this);
      this.model.bind('change:Selected', this.moveToLastInPane, this);
      this.model.bind('destroy', this.remove, this);
      return JoinPaneView.bind('evtRearranged', this.setSelfSelectionOrder, this);
    },
    render: function() {
      $(this.el).html(this.template(this.model.toJSON()));
      return this;
    },
    changeJoinType: function() {
      console.log(this.$('select').val());
      this.model.set({
        Type: this.$('select').val()
      });
    },
    setSelfSelectionOrder: function() {
      console.log('setSelfSelectionOrder');
      this.model.setSelectionOrder($(this.el).index());
      return Joins.sort();
    },
    moveToLastInPane: function() {
      var i, par;
      if (this.model.get('Selected') === false) return;
      par = $(this.el).parent();
      i = $(this.el).detach();
      return $(par).append(i);
    }
  });
  window.JoinPaneView = new (Backbone.View.extend({
    el: $('#pane-join'),
    events: {
      "sortstop div": "SelectionOrder_DOM2model"
    },
    initialize: function() {
      return Joins.bind('add', this.addOne, this);
    },
    addOne: function(jf) {
      var view;
      view = new JoinItemView({
        model: jf
      });
      return this.el.append(view.render().el);
    },
    SelectionOrder_DOM2model: function() {
      console.log('SelectionOrder_DOM2model:Join');
      return this.trigger('evtRearranged');
    }
  }));
  window.SQLPaneView = new (Backbone.View.extend({
    /*
                template: _.template($('#template').html())
                events:
    */
    el: $('.output > pre'),
    initialize: function() {
      TableFields.bind('change', this.render, this);
      TableFields.bind('remove', this.render, this);
      Joins.bind('change', this.render, this);
      Joins.bind('reset', this.render, this);
      Joins.bind('remove', this.render, this);
      return this.listenEvents = true;
      /*
                     BoolExprs.bind('add', @render, this)
                     BoolExprs.bind('change', @render, this)
                     BoolExprs.bind('remove', @render, this)
      */
    },
    render: function() {
      try {
        if (this.listenEvents) return $(this.el).html(this.getSQL());
      } catch (error) {

      } finally {
        this;
      }
    },
    getFullFieldName: function(Alias) {
      var ret;
      if (Alias == null) Alias = true;
      ret = "" + this.TableName + "." + this.ColumnName + "";
      if (Alias) if (this.Alias !== "") ret += " AS " + this.Alias;
      return ret;
    },
    getOrderbyPart: function() {
      var str;
      switch (this.Sort) {
        case 'ASC':
          str = '';
          break;
        case 'DESC':
          str = 'DESC';
          break;
        default:
          str = '';
      }
      return str;
    },
    getJoinPart: function() {
      var jfm, joinCnt, ret, _i, _len, _ref;
      joinCnt = Joins.length;
      if (joinCnt === 0) return TableFields.first().get('TableName');
      ret = '';
      ret += Array(joinCnt + 1).join('(');
      ret += this.toJoinString.call(Joins.first().toJSON(), true);
      _ref = Joins.toJSON().slice(1, joinCnt + 1 || 9e9);
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        jfm = _ref[_i];
        ret += this.toJoinString.call(jfm);
      }
      return ret;
    },
    toJoinString: function(isFirst) {
      var getJoinName, ret;
      if (isFirst == null) isFirst = false;
      getJoinName = function(constName) {
        switch (constName) {
          case 'INNER_JOIN':
            return ' INNER JOIN ';
          case 'CROSS_JOIN':
            return ' CROSS JOIN ';
          case 'LEFT_OUTER':
            return ' LEFT OUTER JOIN ';
          case 'RIGHT_OUTER':
            return ' RIGHT OUTER JOIN ';
        }
      };
      ret = "" + (isFirst ? this.LeftTable : '\r\n\t\t') + " " + (getJoinName(this.Type)) + " " + this.RightTable + " ";
      if (this.Type !== 'CROSS_JOIN') {
        ret += " ON " + (" " + this.LeftTable + "." + this.LeftField + " = " + this.RightTable + "." + this.RightField);
      }
      return ret + ")";
    },
    getWherePart: function() {
      return $('#pane-where textarea').val();
    },
    getSQL: function() {
      var f, joinPart, m, orderbyFields, orderbyPart, ret, selectPart, selectedFields, wherePart;
      selectedFields = _.sortBy((function() {
        var _i, _len, _ref, _results;
        _ref = TableFields.toJSON();
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          m = _ref[_i];
          if (m.Selected) _results.push(m);
        }
        return _results;
      })(), function(i) {
        return i.SelectionOrder;
      });
      selectPart = ((function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = selectedFields.length; _i < _len; _i++) {
          f = selectedFields[_i];
          _results.push(this.getFullFieldName.apply(f));
        }
        return _results;
      }).call(this)).join(", ");
      joinPart = this.getJoinPart();
      wherePart = this.getWherePart();
      orderbyFields = _.sortBy((function() {
        var _i, _len, _ref, _results;
        _ref = TableFields.toJSON();
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          m = _ref[_i];
          if (m.Sort !== 'UNSORTED') _results.push(m);
        }
        return _results;
      })(), function(i) {
        return i.SortOrder;
      });
      orderbyPart = ((function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = orderbyFields.length; _i < _len; _i++) {
          f = orderbyFields[_i];
          _results.push(this.getFullFieldName.call(f, false) + ' ' + this.getOrderbyPart.apply(f));
        }
        return _results;
      }).call(this)).join(", ");
      ret = "SELECT \n\t" + selectPart + " \n";
      ret += "FROM \n\t" + joinPart + " \n";
      if (wherePart !== "") ret += "WHERE \n\t" + wherePart + " \n";
      if (orderbyPart !== "") {
        ret += "ORDER BY \n\t" + orderbyPart;
      } else {
        ret += "\n\n";
      }
      return ret;
    }
  }));
  _.extend(SelectPaneView, Backbone.Events);
  _.extend(OrderbyPaneView, Backbone.Events);
  return _.extend(JoinPaneView, Backbone.Events);
});
