
$(function() {
  window.JoinDesc = {
    'INNER': 'INNER_JOIN',
    'LEFT': 'LEFT_OUTER',
    'RIGHT': 'RIGHT_OUTER',
    'CROSS': 'CROSS_JOIN'
  };
  /*
        store SQLText
  
        fetch JSON data from dQuery
        for each table, AddTable
        using this data, create TableField and put in TableFields
          Models
            TableField
            Table
            Join
            BoolExpr
  
        Update 
          TableField
            OffSet X,Y 
            Selected
            SelectionOrder
            SortOrder
  
  
          Table
              NoOfFields
              TableName
              left
              top
  
          Create
            Join
              LeftField: "DCID"
              LeftTable: "mDC"
              RightField: "DCID"
              RightTable: "dDC"
              SelectionOrder: 1
              Type: "INNER_JOIN"
  
            
        
        Parse SQL , create Join
  
       
  
        parse SQLText
          parse SELECT part
              update TableFields
          parse FROM part 
              create Join in Joins
          parse ORDER BY
              update TableFields
          parse WHERE part 
              ?
              create boolexpr objects
  */
  /*
        The role of these objects is very short lived
        Used only in modify mode, for restoring the Models and other stuff
  */
  window.SQLParser = {
    parseSQL: function(sql) {
      if (!sql) sql = this.SQLText;
      this.SQLDataObject.reset();
      this.SQLText = sql;
      this.parseSelectClause();
      this.parseJoinClause();
      this.parseOrderByClause();
      return this.SQLDataObject;
    },
    SQLDataObject: {
      select: [],
      join: [],
      orderBy: [],
      reset: function() {
        this.select = [];
        this.join = [];
        this.singleTable = "";
        return this.orderBy = [];
      }
    },
    SQLText: '',
    trimKeyWords: function(clause) {
      var patt;
      if (!clause) return '';
      patt = /(SELECT|FROM|WHERE|ORDER BY|ORDER|BY)/gi;
      return $.trim(clause.replace(patt, ''));
    },
    getSelectionOrder: function() {
      return ++this.curSelectionOrder;
    },
    resetSelectionOrder: function() {
      return this.curSelectionOrder = 0;
    },
    stripAllQuotes: function(str) {
      return str.replace(/'/g, "");
    },
    getSelectClause: function() {
      var patt, selColsPart, selectPart;
      patt = /SELECT.*FROM/i;
      selectPart = patt.exec(this.SQLText)[0];
      selColsPart = this.trimKeyWords(selectPart);
      return $.trim(selColsPart);
    },
    getJoinClause: function() {
      var joinPart, patt;
      patt = /FROM.*?(WHERE|ORDER)/i;
      patt = /FROM.*/i;
      joinPart = this.SQLText.match(patt)[0];
      joinPart = joinPart.split(/(WHERE|ORDER)/i)[0];
      return this.trimKeyWords(joinPart);
    },
    getOrderByClause: function() {
      var patt;
      patt = /ORDER BY.*/i;
      return this.trimKeyWords((patt.exec(this.SQLText) || [''])[0]);
    },
    getWhereClause: function() {
      var patt, wherePart;
      patt = /WHERE.*/i;
      wherePart = (patt.exec(this.SQLText) || [''])[0];
      if (!wherePart) return 0;
      wherePart = wherePart.split('ORDER BY')[0];
      return this.trimKeyWords(wherePart);
    },
    parseJoinClause: function(joinClause) {
      var str;
      str = this.getJoinClause();
      if (!str.match(/(JOIN)/i)) {
        this.SQLDataObject.singleTable = str;
        return;
      }
      this.resetSelectionOrder();
      return this.parseNestedJoinClause(str);
    },
    parseNestedJoinClause: function(joinClause) {
      var RightTblField, nestedExpr, oJoin, patt;
      joinClause = joinClause.slice(1, (joinClause.length - 1));
      patt = /\(.*\)/gi;
      if (joinClause.match(patt)) {
        nestedExpr = joinClause.match(patt)[0];
        RightTblField = this.parseNestedJoinClause(nestedExpr);
        joinClause = joinClause.replace(patt, RightTblField);
      }
      /*
            oJoin =  @parseJoinCondition(joinClause)
            @SQLDataObject.join.push oJoin
      */
      oJoin = this.parseJoinCondition(joinClause);
      oJoin.SelectionOrder = this.getSelectionOrder();
      this.SQLDataObject.join.push(oJoin);
      return oJoin.RightTable;
    },
    parseJoinCondition: function(joinExpr) {
      var arr, joinOnPart, joinType, patt, ret;
      joinExpr = joinExpr.replace(/\(|\)/g, '');
      patt = /\S* \= \S*/g;
      joinOnPart = joinExpr.match(patt)[0];
      patt = /\w{1,}/g;
      arr = joinOnPart.match(patt);
      ret = {
        LeftField: arr[1],
        LeftTable: arr[0],
        RightField: arr[3],
        RightTable: arr[2]
      };
      patt = /(INNER|LEFT|RIGHT|CROSS)/i;
      joinType = joinExpr.match(patt)[0];
      ret.Type = window.JoinDesc[joinType];
      return ret;
    },
    parseSelectClause: function() {
      var arrTblCol, i, selectPart, _i, _len;
      selectPart = this.getSelectClause();
      arrTblCol = (function() {
        var _i, _len, _ref, _results;
        _ref = selectPart.split(',');
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          i = _ref[_i];
          _results.push($.trim(i));
        }
        return _results;
      })();
      arrTblCol = (function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = arrTblCol.length; _i < _len; _i++) {
          i = arrTblCol[_i];
          _results.push(this.parseSelectUnit(i));
        }
        return _results;
      }).call(this);
      this.resetSelectionOrder();
      for (_i = 0, _len = arrTblCol.length; _i < _len; _i++) {
        i = arrTblCol[_i];
        i.SelectionOrder = this.getSelectionOrder();
      }
      return this.SQLDataObject.select = arrTblCol;
    },
    parseSelectUnit: function(unit) {
      var aliasName, cleanUnit, patt, ret, tableCol;
      patt = /\sAS\s/i;
      if (!unit.match(patt)) {
        return unit.split('.');
      } else {
        cleanUnit = this.stripAllQuotes(unit);
        aliasName = cleanUnit.match(patt)[0];
        aliasName = cleanUnit.split(' AS ')[1];
        tableCol = cleanUnit.split(' AS ')[0];
        aliasName = aliasName.replace(/'/g, "");
        ret = tableCol.split('.');
        ret.aliasName = aliasName;
        return ret;
      }
    },
    parseOrderByClause: function() {
      /*
            res = []
            (( j for j in i.split(/\.\s/g) ) for i in arr )
             for i in arr )
      */
      var i;
      if (this.getOrderByClause() === "") return;
      return this.SQLDataObject.orderBy = (function() {
        var _i, _len, _ref, _results;
        _ref = this.getOrderByClause().split(',');
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          i = _ref[_i];
          _results.push(this.parseOrderByUnit(i));
        }
        return _results;
      }).call(this);
    },
    parseOrderByUnit: function(unit) {
      var patt, ret;
      unit = $.trim(unit);
      ret = {};
      /*
            if unit.match(/(DESC)/)
               ret.SortType = 'DESC'
            else
               ret.SortType = 'ASC'
      */
      ret.SortType = unit.match(/(DESC)/) ? 'DESC' : 'ASC';
      patt = /\w*\./;
      ret.TableName = unit.match(patt)[0].replace('.', '');
      patt = /\.\w*/;
      ret.ColumnName = unit.match(patt)[0].replace('.', '');
      return ret;
    }
  };
  return window.SQLDataRestorer = {
    init: function(QID, sql) {
      this.QID = QID;
      this.mQuery = [];
      this.dQuery = [];
      if (this.QID > 0) {
        this.fetchServerData();
      } else {
        this.mQuery.SQLText = sql;
      }
      this.mQuery.SQLText = this.mQuery.SQLText.replace(/(\r\n|\n|\r)/gm, "");
      SQLParser.parseSQL(this.mQuery.SQLText);
      this.sqlData = SQLParser.SQLDataObject;
      return this.process();
    },
    fetchServerData: function() {
      this.mQuery = null;
      this.dQuery = null;
      this.mQuery = fetchTableResults('mQuery', this.QID)[0];
      return this.dQuery = fetchTableResults('dQuery', this.QID);
    },
    process: function() {
      var allTables, curX, curY, dX, dY, firstTFM, i, jDat, joinData, newX, newY, orderByData, selectData, storedTblData, tbl, tblNames, _i, _j, _k, _len, _len2, _len3;
      console.log("processing...");
      selectData = this.sqlData.select;
      joinData = this.sqlData.join;
      orderByData = this.sqlData.orderBy;
      if (joinData.length > 0) {
        allTables = (function() {
          var _i, _len, _results;
          _results = [];
          for (_i = 0, _len = joinData.length; _i < _len; _i++) {
            i = joinData[_i];
            _results.push([i.LeftTable, i.RightTable]);
          }
          return _results;
        })();
        tblNames = _.uniq(_.flatten(allTables));
      } else {
        tblNames = [this.sqlData.singleTable];
      }
      for (_i = 0, _len = tblNames.length; _i < _len; _i++) {
        tbl = tblNames[_i];
        AddTable(tbl);
      }
      /*
              for each table
                get x,y of first cell of a table
                get x,y of same cell from dQuery 
                calc dx,dy
                set Table.chgX = dX
                set Table.chgY = dY
      */
      if (this.dQuery.length !== 0) {
        for (_j = 0, _len2 = tblNames.length; _j < _len2; _j++) {
          tbl = tblNames[_j];
          firstTFM = TableFields.getModelsByTableName(tbl)[0].toJSON();
          curX = firstTFM.left;
          curY = firstTFM.top;
          storedTblData = _.find(this.dQuery, function(i) {
            return i.TableName === tbl && i.ColumnName === "*";
          });
          newX = storedTblData.OffSetX;
          newY = storedTblData.OffSetY;
          dX = newX - curX;
          dY = newY - curY;
          Tables.getModelByTableName(tbl).set_dx_dy(dX, dY).changeTopLeft(dX, dY).triggerChanges();
        }
      }
      for (_k = 0, _len3 = joinData.length; _k < _len3; _k++) {
        jDat = joinData[_k];
        console.log(jDat);
        TableFields.getModelByTableCol(jDat.LeftTable, jDat.LeftField).chgJoinLeft();
        TableFields.getModelByTableCol(jDat.RightTable, jDat.RightField).chgJoinRight();
        Joins.last().set({
          Type: jDat.Type
        });
      }
      /*
                select clause
      */
      _.each(selectData, function(item) {
        var mdl;
        mdl = TableFields.getModelByTableCol(item[0], item[1]);
        mdl.toggleSelected();
        if (item.aliasName) {
          return mdl.set({
            Alias: item.aliasName
          });
        }
      });
      SQLParser.resetSelectionOrder();
      _.each(orderByData, function(item) {
        var mdl;
        mdl = TableFields.getModelByTableCol(item.TableName, item.ColumnName);
        mdl.toggleSort();
        mdl.set({
          SortOrder: SQLParser.getSelectionOrder()
        });
        if (item.SortType === 'DESC') {
          return mdl.set({
            Sort: 'DESC'
          });
        }
      });
      return this.parseNestedWhereClause();
    },
    parseNestedWhereClause: function() {
      var wherePart;
      wherePart = SQLParser.getWhereClause();
      if (!wherePart) return 0;
      return this.parseWhereClause(wherePart);
    },
    parseWhereClause: function(whereExpr) {
      var i, patt, _i, _len, _ref, _results;
      whereExpr = whereExpr.slice(1, (whereExpr.length - 1));
      patt = /\(.*?\)/gi;
      if ((whereExpr.match(patt) || [false])[0]) {
        _ref = whereExpr.match(patt);
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          i = _ref[_i];
          _results.push(this.parseWhereClause(i));
        }
        return _results;
      } else {
        return this.parseWhereCondition(whereExpr);
      }
    },
    parseWhereCondition: function(expr) {
      var colName, leftOprnd, optr, patt, rightOprnd, tableFld, tblName, tokens;
      console.log('inside parseWhereCondition...');
      expr = expr.replace(/\(|\)/g, '');
      tokens = expr.split(" ");
      leftOprnd = tokens[0];
      optr = tokens[1];
      if (optr === 'LIKE') {
        patt = /'.*'/;
        rightOprnd = expr.match(patt)[0];
        rightOprnd = rightOprnd.replace(/'/g, "");
      } else {
        rightOprnd = tokens[2];
      }
      tblName = leftOprnd.split(".")[0];
      colName = leftOprnd.split(".")[1];
      tableFld = TableFields.getModelByTableCol(tblName, colName);
      return BoolExprs.create({
        LeftTableField: tableFld,
        Operator: optr,
        RightOperand: rightOprnd
      });
    }
  };
});
