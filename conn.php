<?php 
//$dbc= mysqli_connect("localhost","root","root","VQD");
//$dbc_info_sch= mysqli_connect("localhost","root","root","information_schema");

$username = "root";
$password = "root";

$dbc_info_sch= mysqli_connect("localhost",$username,$password,"information_schema");
$dbc=$dbc_info_sch;
?>

