<?php
// Här ska du lägga in anslutningsinformation för att kunna ansluta mot din databas:
// Databasservernamn är "medialab" (behöver inte ändras), användarnamn, lösenord samt databasnamn enligt mönstret.
$mysqli = new mysqli('medialab', 'adryanyousef', 'never_stop_learning', 'MTB_VT25_ADRYANYOUSEF');

// Kontrollerar teckentabell
if (!$mysqli->set_charset("utf8")) {
  echo "Fel vid inställning av teckentabell utf8: %s\n" . $mysqli->error;
}

if ($mysqli->connect_errno) {
  echo "Misslyckades att ansluta till MySQL: (" . $mysqli->connect_errno . ") " . $mysqli->connect_error;
}
?>
