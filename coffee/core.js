/*
Web-based Visual Query Designer is an open source software released under the MIT License
*/
$(function() {
  window.Constants = {
    EQUALS: '=',
    LIKE: 'LIKE',
    LESS_THAN: '<',
    GREATER_THAN: '>',
    LESS_EQUAL: '<=',
    GREATER_EQUAL: '>=',
    NOT_EQUAL: '<>',
    AND: ' AND ',
    OR: ' OR '
  };
  Constants.DIAG_CELL_HEIGHT = 18;
  Constants.DIAG_UNIQUE_ID = "diag-table-";
  window.TableField = Backbone.Model.extend({
    defaults: function() {
      return {
        ColumnName: "",
        Selected: false,
        Alias: "",
        Sort: 'UNSORTED',
        SortOrder: 0,
        IsPrimaryKey: "",
        SelectionOrder: 0,
        left: 0,
        setJoinLeft: -1,
        setJoinRight: -1
      };
    },
    chgJoinLeft: function() {
      return this.set({
        setJoinLeft: this.get('setJoinLeft') * (-1)
      });
    },
    chgJoinRight: function() {
      return this.set({
        setJoinRight: this.get('setJoinRight') * (-1)
      });
    },
    toggleSelected: function() {
      if (this.get("Selected")) {
        return this.set({
          SelectionOrder: 0,
          Selected: false
        });
      } else {
        return this.set({
          SelectionOrder: TableFields.nextSelectionOrderNo(this.get('TableName')),
          Selected: true
        });
      }
    },
    setTop: function(top) {
      return this.set({
        top: top
      });
    },
    setSortOrder: function(newIdx) {
      return this.set({
        SortOrder: this.get('Sort') === 'UNSORTED' ? 0 : newIdx
      });
    },
    changeTopLeft: function(dx, dy) {
      this.set({
        top: this.get('top') + dy,
        silent: true
      });
      this.set({
        left: this.get('left') + dx,
        silent: true
      });
      return this.trigger();
    },
    toggleSort: function() {
      if (this.get('Sort') === 'UNSORTED') {
        return this.set({
          Sort: 'ASC'
        });
      } else {
        return this.set({
          Sort: 'UNSORTED'
        });
      }
    },
    toString: function() {
      return this.get('TableName') + "." + this.get("ColumnName");
    }
  });
  window.TableFieldList = Backbone.Collection.extend({
    model: TableField,
    localStorage: new Store("TableFields"),
    nextSelectionOrderNo: function(tableName) {
      var lastSelOrder, myTFs;
      myTFs = this.getModelsByTableName(tableName);
      lastSelOrder = _.max(myTFs, function(m) {
        return m.get('SelectionOrder');
      });
      lastSelOrder = lastSelOrder.get('SelectionOrder');
      return lastSelOrder + 1;
    },
    getModelsByTableName: function(tableName) {
      return this.filter(function(m) {
        return m.get('TableName') === tableName;
      });
    },
    getModelByTableCol: function(tableName, colName) {
      return this.find(function(m) {
        return m.get('TableName') === tableName && m.get('ColumnName') === colName;
      });
    },
    getNextTF_Top: function(tableName) {
      var lastTFM, myTFs;
      myTFs = this.getModelsByTableName(tableName);
      lastTFM = _.max(myTFs, function(m) {
        return m.get('top');
      });
      if (lastTFM != null) {
        return lastTFM.get('top') + Constants.DIAG_CELL_HEIGHT;
      } else {
        return Constants.DIAG_CELL_HEIGHT;
      }
    }
  });
  window.TableFields = new TableFieldList();
  window.TableFieldView = Backbone.View.extend({
    className: 'diag-cell',
    template: _.template($('#table-field-template').html()),
    events: {
      "click input": "toggleSelected",
      "dragstart .cell-dragger": "setJoinLeftTable",
      "drop .cell-dragger": "setJoinRightTable",
      "click .orderby ": "toggleSort"
    },
    initialize: function() {
      this.model.bind('change', this.render, this);
      this.model.bind('change:setJoinLeft', this.setJoinLeftTable, this);
      this.model.bind('change:setJoinRight', this.setJoinRightTable, this);
      this.model.bind('destroy', this.clear, this);
      $(this.el).draggable({
        helper: "clone",
        cursor: "move"
      });
      $(this.el).droppable();
      return this.options.GroupTable.bind('change', this.reposition, this);
    },
    clear: function() {
      jsPlumb.detachAllConnections(this.el);
      return this.remove();
    },
    render: function() {
      $(this.el).css("top", this.model.get("top")).css("left", this.model.get("left")).css("position", "absolute");
      $(this.el).html(this.template(this.model.toJSON()));
      return this;
    },
    reposition: function() {
      var dx, dy;
      dx = this.options.GroupTable.get('chgX');
      dy = this.options.GroupTable.get('chgY');
      return this.model.changeTopLeft(dx, dy);
    },
    opacify: function(what) {
      return $(this.el).css({
        opacity: what ? 0.5 : 1.0
      });
    },
    setJoinLeftTable: function() {
      return vqd.setJoinLeftField(this.el, this.model.get('TableName'), this.model.get('ColumnName'));
    },
    setJoinRightTable: function() {
      return vqd.completeJoin(this.el, this.model.get('TableName'), this.model.get('ColumnName'));
    },
    toggleSelected: function() {
      return this.model.toggleSelected();
    },
    toggleSort: function() {
      return this.model.toggleSort();
    }
  });
  window.Table = Backbone.Model.extend({
    defaults: function() {
      return {
        TableName: '',
        left: 0,
        top: 0,
        chgX: 0,
        chgY: 0,
        NoOfFields: 0
      };
    },
    incrFieldCounter: function() {
      return this.set({
        NoOfFields: this.get('NoOfFields') + 1
      });
    },
    set_dx_dy: function(dx, dy) {
      this.set({
        chgX: dx,
        chgY: dy
      }, {
        silent: true
      });
      return this;
    },
    changeTopLeft: function(dx, dy) {
      this.set({
        top: this.get('top') + dy
      }, {
        silent: true
      });
      this.set({
        left: this.get('left') + dx
      }, {
        silent: true
      });
      return this;
    },
    triggerChanges: function() {
      return this.change();
    }
  });
  window.TableList = Backbone.Collection.extend({
    model: Table,
    localStorage: new Store("Tables"),
    initialize: function() {
      return this.bind('add', this.addOne, this);
    },
    addOne: function(table) {
      var view;
      view = new TableView({
        model: table
      });
      return $('#design-pane').append(view.render().el);
    },
    getModelByTableName: function(tableName) {
      return this.find(function(m) {
        return m.get('TableName') === tableName;
      });
    },
    getLasttableName: function() {
      return this.last(2)[0].get('TableName');
    }
  });
  window.Tables = new TableList();
  window.TableView = Backbone.View.extend({
    className: 'diag-cell label',
    template: _.template($('#table-label-template').html()),
    events: {
      "dragstop .label": "dragStopped",
      "click .close": "removeTable"
    },
    initialize: function() {
      TableFields.bind('add', this.addOne, this);
      this.model.bind("change", this.render, this);
      $(this.el).draggable({
        helper: 'clone',
        cursor: 'move'
      });
      return $(this.el).css("position", "absolute");
    },
    addOne: function(tf) {
      var tableName, view;
      tableName = tf.get('TableName');
      if (tableName === this.model.get('TableName')) {
        this.model.incrFieldCounter();
        tf.setTop(TableFields.getNextTF_Top(tableName));
        view = new TableFieldView({
          model: tf,
          GroupTable: this.model
        });
        return $('#design-pane').append(view.render().el);
      }
    },
    render: function() {
      $(this.el).css("top", this.model.get('top')).css("left", this.model.get('left'));
      $(this.el).html(this.template(this.model.toJSON()));
      return this;
    },
    dragStopped: function(event, ui) {
      var chgLeft, chgTop;
      chgTop = ui.position.top - ui.originalPosition.top;
      chgLeft = ui.position.left - ui.originalPosition.left;
      this.model.set_dx_dy(chgLeft, chgTop);
      this.model.changeTopLeft(chgLeft, chgTop);
      this.model.triggerChanges();
      return jsPlumb.repaintEverything();
    },
    removeTable: function() {
      var mTF, tableName, _i, _len, _ref;
      tableName = this.model.get('TableName');
      _ref = TableFields.getModelsByTableName(tableName);
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        mTF = _ref[_i];
        mTF.destroy();
      }
      this.model.destroy();
      this.remove();
      Joins.removeJoinByTableName(tableName);
      return removeSelection(tableName);
    }
  });
  return window.AddTable = function(tableName) {
    if (Tables.find((function(item) {
      return item.get('TableName') === tableName;
    }), this)) {
      return 0;
    }
    return $.ajax({
      url: 'ajax/table_json.php',
      dataType: 'json',
      data: {
        table: tableName
      }
    }).done(function(data) {
      var d, _i, _len;
      SQLPaneView.listenEvents = false;
      Tables.create({
        TableName: tableName
      });
      for (_i = 0, _len = data.length; _i < _len; _i++) {
        d = data[_i];
        TableFields.create(d);
      }
      SQLPaneView.listenEvents = true;
      TableFields.trigger();
      return SQLPaneView.render();
    });
  };
});

window.Join = Backbone.Model.extend({
  defaults: function() {
    return {
      Type: 'CROSS_JOIN',
      SelectionOrder: Joins.nextSelectionOrderNo(),
      Fields: [],
      LeftField: '',
      RightField: ''
      /*
              LeftTable
              RightTable
      */
    };
  },
  setSelectionOrder: function(newIdx) {
    return this.set({
      SelectionOrder: newIdx
    });
  },
  joinOn: function(tblLeft, colLeft, tblRight, colRight, joinType) {
    if (joinType == null) joinType = "INNER_JOIN";
    this.set({
      Type: joinType
    }, {
      silent: true
    });
    if (this.get('LeftTable') === tblLeft) {
      this.set({
        LeftField: colLeft
      });
      return this.set({
        RightField: colRight
      });
    } else {
      this.set({
        LeftField: colRight
      });
      return this.set({
        RightField: colLeft
      });
    }
  }
});

window.JoinView = Backbone.View.extend({
  initialize: function() {
    return this.model.bind("change", this.render, this);
  },
  render: function() {
    return jsPlumb.repaintEverything();
  }
});

window.JoinList = Backbone.Collection.extend({
  model: Join,
  localStorage: new Store("Joins"),
  initialize: function() {},
  nextSelectionOrderNo: function() {
    var lastSelOrder;
    if (this.models.length === 0) return 1;
    lastSelOrder = _.max(this.models, function(m) {
      return m.get('SelectionOrder');
    });
    lastSelOrder = lastSelOrder.get('SelectionOrder');
    return lastSelOrder + 1;
  },
  comparator: function(m) {
    return m.get('SelectionOrder');
  },
  getJoinsByTableName: function(tableName) {
    var _this = this;
    this.tableName = tableName;
    return this.filter(function(item) {
      var m;
      m = item.toJSON();
      return m.LeftTable === _this.tableName || m.RightTable === _this.tableName;
    });
  },
  removeJoinByTableName: function(tableName) {
    var i, _i, _len, _ref, _results;
    _ref = this.getJoinsByTableName(tableName);
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      i = _ref[_i];
      _results.push(i.destroy());
    }
    return _results;
  }
});

window.Joins = new JoinList();

/*
    misc. functions
*/

window.fetchTableResults = function(tableName, qid) {
  window.resultset = null;
  $.ajax({
    url: 'ajax/table_results.php',
    dataType: 'json',
    data: {
      table: tableName,
      qid: qid
    },
    async: false
  }).done(function(data) {
    return window.resultset = data;
  });
  return window.resultset;
};

window.vqd = {
  getStringForConst: function(constant) {
    switch (constant) {
      case 'INNER_JOIN':
        return ' INNER JOIN ';
    }
  },
  setJoinLeftField: function(el, tableName, columnName) {
    this.leftJoinEl = el;
    return this.leftJoinColumn = {
      TableName: tableName,
      ColumnName: columnName
    };
  },
  completeJoin: function(el, tableName, columnName) {
    var my, newJoinHost;
    my = this;
    if (this.leftJoinColumn.TableName === tableName) return 0;
    newJoinHost = Joins.find(function(m) {
      return (m.get('LeftTable') === vqd.leftJoinColumn.TableName && m.get('RightTable') === tableName) || (m.get('RightTable') === vqd.leftJoinColumn.TableName && m.get('LeftTable') === tableName);
    });
    if ((newJoinHost != null)) {
      newJoinHost.joinOn(this.leftJoinColumn.TableName, this.leftJoinColumn.ColumnName, tableName, columnName);
    } else {
      Joins.create({
        LeftTable: this.leftJoinColumn.TableName,
        LeftField: this.leftJoinColumn.ColumnName,
        RightTable: tableName,
        RightField: columnName,
        Type: 'INNER_JOIN'
      });
    }
    return ConnectTableFields(this.leftJoinEl, el);
  }
};

/*
    Connect
*/

jsPlumb.connectorClass = "diag-join";

window.ConnectTableFields = function(elemStart, elemEnd) {
  var common, connectorPaintStyle, e0, e1;
  connectorPaintStyle = {
    lineWidth: 5,
    strokeStyle: "#7794CE"
  };
  common = {
    anchor: ["RightMiddle", "LeftMiddle"],
    isSource: true,
    endpoint: "Blank",
    isTarget: true
  };
  e0 = jsPlumb.addEndpoint(elemStart, common, {
    connectorStyle: connectorPaintStyle,
    paintStyle: {
      fillStyle: "#225588",
      radius: 7
    },
    connector: ["Flowchart"]
  });
  e1 = jsPlumb.addEndpoint(elemEnd, common, {
    connectorStyle: connectorPaintStyle,
    paintStyle: {
      fillStyle: "#225588",
      radius: 7
    }
  });
  return jsPlumb.connect({
    source: e0,
    target: e1,
    overlays: [
      [
        "Label", {
          label: "-",
          location: 0.5
        }
      ]
    ]
  });
};
