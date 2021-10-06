<?php
/* Crea el registro */
$record =(!empty($_SERVER['REQUEST_TIME'])?date('r', $_SERVER['REQUEST_TIME']):date('r')).'|';
$record.=(!empty($_SERVER['REMOTE_ADDR'])?$_SERVER['REMOTE_ADDR']:'-').'|';
$record.=(!empty($_SERVER['HTTP_CF_CONNECTING_IP'])?$_SERVER['HTTP_CF_CONNECTING_IP']:'-').'|';
$record.=(!empty($_SERVER['HTTP_USER_AGENT'])?$_SERVER['HTTP_USER_AGENT']:'-').'|';
$record.=(!empty($_SERVER['REQUEST_URI'])?$_SERVER['REQUEST_URI']:'-').'|';
$record.=(!empty($_SERVER["REDIRECT_STATUS"])?$_SERVER["REDIRECT_STATUS"]:'-').'|';
$record.=(!empty($_SERVER['HTTP_REFERER'])?$_SERVER['HTTP_REFERER']:'-').'|';
$record.=(!empty($_SERVER['HTTP_ACCEPT_LANGUAGE'])?$_SERVER['HTTP_ACCEPT_LANGUAGE']:'-').'|';
$record.=(!empty($_SERVER["HTTP_CF_IPCOUNTRY"])?$_SERVER["HTTP_CF_IPCOUNTRY"]:'-').'|';
$record.=(!empty($_SERVER['REQUEST_METHOD'])?$_SERVER['REQUEST_METHOD']:'-')."\n";
/* Abre el archivo a escribir */
$est = fopen("estadisticas.txt", "a");
/* Escribe el registro */
fwrite($est, $record);
fclose($est);
?>