<?php
    require_once('../conn.php');
    $Schema = $_COOKIE['schema'];
//$table_name = $_GET['table'];

//$table_name ='mTest';
$table_name = isset($_GET['table']) ? ($_GET['table']) :'mTest' ;

$finalArray = array();

//$query= "SHOW COLUMNS FROM $table_name";
$query= "SHOW COLUMNS FROM $table_name IN $Schema";

$result= mysqli_query($dbc,$query);
$FieldData = array();

$FieldData[] = array(
                        "TableName" => $table_name,
                        "ColumnName" => '*',
                        "IsPrimaryKey" => FALSE
                    );
while($row =  mysqli_fetch_array($result)){
    
    $FieldData[] = array(
                        "TableName" => $table_name,
                        "ColumnName" => $row['Field'],
                        "IsPrimaryKey" => ($row['Key'] == 'PRI'? TRUE:FALSE)
                        //"Selected" => true
                         );
    
}

/*
$finalArray = array(
                "TableName"=> $table_name ,
    "Fields" => $FieldData
 
                    );
 */

$finalArray = $FieldData;

print json_encode($finalArray);

?>
