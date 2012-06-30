$( function(){
			//window.addingTables=[];
			window.showTableList = function(show){
				if(show){
					$('#table-selection').show(250)
					
				}
				else{
					$('#table-selection').hide(0)

				}
				
			}
      
      window.bindAddTableEvts = function(){
          $('#table-btns .ok').on('click', function(event){
               $('#table-list .selected').each( function(i){
            							 //continue only if it is not added
                             if(! $(this).hasClass('added')){
                                    var tblName = $.trim($(this).html());
                                    AddTable(tblName);
                                    $(this).addClass('added');
                             }
                        } )
                                
                      showTableList(false);
                    })
                    
                  $('#table-btns .cancel').on('click', function(event){
                          showTableList(false);
            
                  })
                  
                  $('#table-list .item').on('click', function(event){
                    $(this).toggleClass('selected');
                  })
            
                  $('#btn-add-table').on('click', function(event){
                              showTableList(true);
                  
                  });
            }

            
window.removeSelection= function(tableName) {
    
    _.each($('#table-list .item.added').get(), 
        function(item){
         if ($.trim($(item).html()) == tableName){
             $(item).removeClass('added');
             $(item).removeClass('selected');
             }

        });

}
		showTableList(false);
})
