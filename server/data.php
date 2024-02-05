<?php
  header("Content-type: application/json; charset=utf-8");

  require "vendor/autoload.php";
  use PHPHtmlParser\Dom;
  use PHPHtmlParser\Options;

  $json = file_get_contents("php://input");
  $requestBody = json_decode($json);

  if ($requestBody === null) {
    http_response_code(400);
    echo json_encode(["error" => "Hibás paraméterek"]);
    exit;
  }

  if (!isset($requestBody->mode) || !isset($requestBody->year) || !isset($requestBody->name)) {
    http_response_code(400);
    echo json_encode(["error" => "Hibás paraméterek"]);
    exit;
  }

  $url = "https://tanrend.elte.hu/tanrendnavigation.php";
  $searchModes;
  $data = [];

  if ($requestBody->mode === "subject") {
    $searchModes = ["keresnevre", "keres_kod_azon"];
  } elseif ($requestBody->mode === "teacher") {
    $searchModes = ["keres_okt", "keres_oktnk"];
  }

  foreach ($searchModes as $mode) {
    $queryParams = [
      "m" => $mode,
      "f" => $requestBody->year,
      "k" => $requestBody->name
    ];
    $uri = $url . "?" . http_build_query($queryParams);

    $curl = curl_init();

    curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($curl, CURLOPT_URL, $uri);
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

    foreach ($result as $row) {
      $content = $row->find("td");
      $rowData = [];

      foreach ($content as $cell) {
        $rowData[] = $cell->text;
      }

      $data[] = $rowData;
    }

    if (count($data) > 0) {
      break;
    }
  }

  echo json_encode($data, JSON_UNESCAPED_UNICODE);
?>
