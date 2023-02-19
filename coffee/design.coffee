$ ->
  $('#design-results-btns .btn')
            .on "click", (event)->
                            if($(this).hasClass('selected'))
                              #no-op 
                              return
                            else
                              #toggle mode
                              $('#right-pane').toggleClass('design-mode results-mode')
                              $('#design-results-btns .selected').removeClass('selected')
                              $(this).addClass('selected')

                            if $('#right-pane').hasClass('results-mode')
                              sqlOut = QueryMaint.getSQL()
                              fillResultData(sqlOut)

  fillResultData = (sql)->
      $.ajax({
        url:"query_results.demo"
        data:{ sql: sql }
        cache:false

      }).done( (html) ->
        $('#results-pane').html(html)
      )


  #set design-mode as default
  $('#design-results-btns .design-mode').trigger('click')

  $('#btn-save')
            .on "click", (event)->
              #alert('save clicked')
              QueryMaint.save()

  $('#btn-edit-sql')
            .on "click", (event)->
              # toggle output/input mode
              console.log 'editing sql...'
              curMode = if $('#sql-out').hasClass('output-mode') then 'output' else 'input'
              if curMode == 'output'
                #hide output
                #copy text to input textarea
                sql = $('#sql-text-op').text()
                $('#sql-text-ip').html(sql)

                #change btn label to Done editing
                $(this).html('Done editing')
              
              else  #input
                #hide input
                newSQL = $('#sql-text-ip').val()
                SQLDataRestorer.init(0, newSQL)
                #change btn label to Edit SQL
                $(this).html('Edit SQL')
              
              $('#sql-out').toggleClass 'output-mode input-mode'           

  $('select[name=schema]')
      .on 'blur', (evt)->
        schema = $(evt.target).val()
        if $('select[name=schema]').val() == ""
          App.reset()
        
  window.LoadTableList = (schema)->      
        if $.cookie('schema') == schema then return   #no loading required
        $.cookie 'schema', schema
        $.ajax({
          url:"ajax/table_list.demo"
          data:{ schema: schema }
          cache:false
        }).done( (html) ->
          $('#table-list').html(html)
          bindAddTableEvts()
        )
  
  $('#pane-where textarea')
    .on 'keyup', _.debounce(
      (event) -> SQLPaneView.render(),
      500)

  window.App = {
        reset : ->
          $('select[name=schema]').val("")
          if localStorage then localStorage.clear()
          @setAppVisibility()
          SQLPaneView.render()
        
        setAppVisibility : ->
          #sets visibility of all but basic (top) ctrls
          show = $('select[name=schema]').val() != ""
          if show
            $('.pane').fadeIn(500)
          else
            $('.pane').fadeOut(0)

  }
