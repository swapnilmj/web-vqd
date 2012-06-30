<?php


include_once('conn.php');

function printBtn($Caption,$link='', $className="", $id="") {
    $id= ($id == "") ? "" : "id='$id'";
    ?>
<span <?php echo $id ?> class="btn <?php echo $className; ?>" >
    <a href="<?php echo $link; ?>">        
        <?php echo $Caption; ?>
    </a>
</span>
    <?php
}
?>