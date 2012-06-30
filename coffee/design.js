
$(function() {
  var fillResultData;
  $('#design-results-btns .btn').on("click", function(event) {
    var sqlOut;
    if ($(this).hasClass('selected')) {
      return;
    } else {
      $('#right-pane').toggleClass('design-mode results-mode');
      $('#design-results-btns .selected').removeClass('selected');
      $(this).addClass('selected');
    }
    if ($('#right-pane').hasClass('results-mode')) {
      sqlOut = QueryMaint.getSQL();
      return fillResultData(sqlOut);
    }
  });
  fillResultData = function(sql) {
    return $.ajax({
      url: "query_results.php",
      data: {
        sql: sql
      },
      cache: false
    }).done(function(html) {
      return $('#results-pane').html(html);
    });
  };
  $('#design-results-btns .design-mode').trigger('click');
  $('#btn-save').on("click", function(event) {
    return QueryMaint.save();
  });
  $('#btn-edit-sql').on("click", function(event) {
    var curMode, newSQL, sql;
    console.log('editing sql...');
    curMode = $('#sql-out').hasClass('output-mode') ? 'output' : 'input';
    if (curMode === 'output') {
      sql = $('#sql-text-op').text();
      $('#sql-text-ip').html(sql);
      $(this).html('Done editing');
    } else {
      newSQL = $('#sql-text-ip').val();
      SQLDataRestorer.init(0, newSQL);
      $(this).html('Edit SQL');
    }
    return $('#sql-out').toggleClass('output-mode input-mode');
  });
  $('#pane-where textarea').on('blur', function(event) {
    return SQLPaneView.render();
  });
  $('select[name=schema]').on('blur', function(evt) {
    var schema;
    schema = $(evt.target).val();
    return LoadTableList(schema);
  });
  window.LoadTableList = function(schema) {
    $.cookie('schema', schema);
    return $.ajax({
      url: "ajax/table_list.php",
      data: {
        schema: schema
      },
      cache: false
    }).done(function(html) {
      $('#table-list').html(html);
      return bindAddTableEvts();
    });
  };
  return LoadTableList($('select[name=schema]').val());
});
