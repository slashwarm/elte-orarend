<?php
  header('Content-type: application/json; charset=utf-8');
  header("Access-Control-Allow-Origin: *");
  header('Access-Control-Allow-Methods: *');
  header("Access-Control-Allow-Headers: *");

  error_reporting(E_ALL); // TO REMOVE
  ini_set('display_errors', 1); // TO REMOVE

  require "vendor/autoload.php";
  use PHPHtmlParser\Dom;
  use PHPHtmlParser\Options;

  $json = file_get_contents('php://input');
  $requestBody = json_decode($json);

  $url = "https://tanrend.elte.hu/oktatoitanrend.php";

  $curl = curl_init();
  curl_setopt($curl, CURLOPT_URL, $url);
  curl_setopt($curl, CURLOPT_POST, true);
  curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);

  $headers = array(
     "Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
     "Content-Type: application/x-www-form-urlencoded",
     "Origin: https://tanrend.elte.hu",
     "Referer: https://tanrend.elte.hu/oktatoitanrend.php",
     "Cache-Control: max-age=0",
  );
  curl_setopt($curl, CURLOPT_HTTPHEADER, $headers);

  $searchMode = "";

  if ($requestBody->mode === "subjectName") {
    $searchMode = "keresnevre";
  } elseif ($requestBody->mode === "subjectCode") {
    $searchMode = "keres_kod_azon";
  } elseif ($requestBody->mode === "teacherName") {
    $searchMode = "keres_okt";
  } elseif ($requestBody->mode === "teacherCode") {
    $searchMode = "keres_oktnk";
  }

  $data = "mit={$requestBody->name}&felev={$requestBody->year}&darab=1000&submit={$searchMode}&szakkod=BBIO&evfolyam=1";
  curl_setopt($curl, CURLOPT_POSTFIELDS, $data);

  $resp = curl_exec($curl);
  curl_close($curl);

  $dom = new Dom;
  $dom->setOptions(
    (new Options())
        ->setEnforceEncoding("utf-8")
  );

  $dom->loadStr($resp);
  $result = $dom->find('#resulttable')->find('tr');

  $data = array();
  $length = count($result);

  for ($i = 0; $i < $length; $i++) // végigmegyünk a táblázat sorain
  {
    $row = $result[$i];
    $content = $row->find('td');
    $data[$i] = array();

    for ($x = 1; $x < count($content); $x++)
    {
      $index = $x - 1; // valódi index mert az első cella üres
      $cell = $content[$x];
      $data[$i][$index] = $cell->text;
    }
  }

  echo json_encode($data, JSON_UNESCAPED_UNICODE);
?>
