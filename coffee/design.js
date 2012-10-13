
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
  $('select[name=schema]').on('blur', function(evt) {
    var schema;
    schema = $(evt.target).val();
    if ($('select[name=schema]').val() === "") return App.reset();
  });
  window.LoadTableList = function(schema) {
    if ($.cookie('schema') === schema) return;
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
  $('#pane-where textarea').on('keyup', _.debounce(function(event) {
    return SQLPaneView.render();
  }, 500));
  return window.App = {
    reset: function() {
      $('select[name=schema]').val("");
      if (localStorage) localStorage.clear();
      this.setAppVisibility();
      return SQLPaneView.render();
    },
    setAppVisibility: function() {
      var show;
      show = $('select[name=schema]').val() !== "";
      if (show) {
        return $('.pane').fadeIn(500);
      } else {
        return $('.pane').fadeOut(0);
      }
    }
  };
});
