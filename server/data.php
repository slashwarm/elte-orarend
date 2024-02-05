<?php
  header("Content-type: application/json; charset=utf-8");

  require "vendor/autoload.php";
  use PHPHtmlParser\Dom;
  use PHPHtmlParser\Options;

  $json = file_get_contents("php://input");
  $requestBody = json_decode($json);

  $url = "https://tanrend.elte.hu/tanrendnavigation.php";
  $searchMode = "keresnevre";

  if ($requestBody->mode === "subjectName") {
    $searchMode = "keresnevre";
  } elseif ($requestBody->mode === "subjectCode") {
    $searchMode = "keres_kod_azon";
  } elseif ($requestBody->mode === "teacherName") {
    $searchMode = "keres_okt";
  } elseif ($requestBody->mode === "teacherCode") {
    $searchMode = "keres_oktnk";
  }

  $queryParams = [
    "m" => $searchMode,
    "f" => $requestBody->year,
    "k" => $requestBody->name
  ];
  $url .= "?" . http_build_query($queryParams);

  $curl = curl_init();

  curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
  curl_setopt($curl, CURLOPT_URL, $url);
  curl_setopt($curl, CURLOPT_FOLLOWLOCATION, false);

  $resp = curl_exec($curl);
  curl_close($curl);

  $dom = new Dom;
  $dom->setOptions(
    (new Options())
        ->setEnforceEncoding("utf-8")
  );

  $dom->loadStr($resp);
  $result = $dom->find("tbody")->find("tr");

  $data = [];

  foreach ($result as $row) {
    $content = $row->find("td");
    $rowData = [];

    foreach ($content as $cell) {
      $rowData[] = $cell->text;
    }

    $data[] = $rowData;
  }

  echo json_encode($data, JSON_UNESCAPED_UNICODE);
?>
