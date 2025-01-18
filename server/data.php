<?php
  header("Content-Type: application/json; charset=utf-8");

  header("Access-Control-Allow-Origin: *");
  header('Access-Control-Allow-Methods: POST, OPTIONS');
  header("Access-Control-Allow-Headers: *");

  if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    header('Access-Control-Max-Age: 86400');
    exit;
  }

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
  $searchModes = [];
  $data = [];

  if ($requestBody->mode === "subject") {
    $searchModes = ["keresnevre", "keres_kod_azon"];
  } elseif ($requestBody->mode === "teacher") {
    $searchModes = ["keres_okt", "keres_oktnk"];
  } elseif ($requestBody->mode === "course") {
    $searchModes = ["keres_kod_azon"];
  } else {
    http_response_code(400);
    echo json_encode(["error" => "Hibás paraméterek"]);
    exit;
  }

  $searchFor = $requestBody->name;

  if (is_string($searchFor)) {
    $searchFor = array($searchFor);
  } else if (!is_array($searchFor)) {
    http_response_code(400);
    echo json_encode(["error" => "Hibás paraméterek"]);
    exit;
  }

  if (count($searchFor) === 0 || count($searchFor) > 20) {
    http_response_code(400);
    echo json_encode(["error" => "Hibás paraméterek"]);
    exit;
  }

  foreach ($searchModes as $mode) {
    foreach ($searchFor as $name) {
      $queryParams = [
        "m" => $mode,
        "f" => $requestBody->year,
        "k" => $name,
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
    }

    if (count($data) > 0) {
      break;
    }
  }

  echo json_encode($data, JSON_UNESCAPED_UNICODE);
?>
