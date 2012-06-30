<?php
    include_once('../lib.php');
    
    $Schema = $_GET['schema'];
?>
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