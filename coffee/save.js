
$(function() {
  var QueryMaintClass;
  QueryMaintClass = (function() {

    function QueryMaintClass() {}

    QueryMaintClass.prototype.init = function(qname, qid) {
      if (qname == null) qname = "";
      if (qid == null) qid = 0;
      this.QueryName = qname;
      this.sql = '';
      this.QID = qid;
      if (this.QID > 0) return SQLDataRestorer.init(this.QID);
    };

    QueryMaintClass.prototype.setQueryName = function(qname) {
      this.qname = qname;
    };

    QueryMaintClass.prototype.getSQL = function() {
      return $(SQLPaneView.el).text();
    };

    QueryMaintClass.prototype.getQueryNameFromUser = function() {
      return this.QueryName = prompt("Enter query name");
    };

    QueryMaintClass.prototype.save = function() {
      /*
                mQuery
                  QueryName = this.QueryName
                  SQLText = this.sql
                  SchemaName
      
                dQuery
                  TableName = TableField.TableName
                  ColumnName = TableField.ColumnName
                  OffSetX = left
                  OffSetY = top
      */
      var d, data_dQuery, data_mQuery, _i, _len, _ref;
      console.log('saving...');
      while (this.QueryName === '' || !this.QueryName) {
        this.getQueryNameFromUser();
        if (this.QueryName === '' || !this.QueryName) alert('invalid query name');
      }
      this.sql = this.getSQL();
      data_mQuery = {
        QID: this.QID,
        QueryName: this.QueryName,
        SQLText: this.sql
      };
      data_dQuery = [];
      _ref = TableFields.toJSON();
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        d = _ref[_i];
        data_dQuery.push({
          TableName: d.TableName,
          ColumnName: d.ColumnName,
          OffSetX: d.left,
          OffSetY: d.top
        });
      }
      console.log(data_mQuery);
      console.log(data_dQuery);
      return $.ajax({
        type: "GET",
        url: "ajax/save_query.demo",
        data: {
          mQuery: data_mQuery,
          dQuery: data_dQuery
        },
        dataType: "json",
        context: QueryMaint
      }).done(function(data) {
        /*
                  msg = $.trim msg
                  if msg == 'true'
                    window.save_status = true
                    window.last_saved_at =  new Date()
                    alert "Saved successfully"
        */        console.log(data.query_m);
        console.log(data.query_d);
        if (this.QID === 0) {
          this.QID = data.QID;
          $('#QueryName').html(this.QueryName);
        }
        return alert("Saved successfully");
      });
      /*
            if window.save_status 
              alert "Saved successfully"
      */
    };

    return QueryMaintClass;

  })();
  return window.QueryMaint = new QueryMaintClass();
});
