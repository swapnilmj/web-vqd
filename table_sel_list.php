<?php
include_once('lib.php');
//$Schema = "VQD";
$Schema = $_COOKIE['schema'];


?>
<div id="table-selection">
	<div id="">
        Add tables
    </div>
	<div id="table-list">
    <?php
    $query = "SELECT * 
    FROM  `TABLES` 
    WHERE TABLE_SCHEMA =  '$Schema'";
    $result= mysqli_query($dbc_info_sch,$query);
    //echo($query);
    while($row =  mysqli_fetch_array($result)){
        $tableName = $row['TABLE_NAME'];
    ?>
        <div class="item"><?php echo $tableName; ?></div>
    <?php
    }
    ?>
	</div>	
	<div id="table-btns">
		<span class="butn ok">
			Select
		</span>
		<span class="butn cancel">
			Cancel
		</span>
		
	</div>
</div>
