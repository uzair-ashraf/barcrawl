<?php
$proxyURL = "https://www.eventbriteapi.com/v3/events/search";
$acceptableHeaders = ['Authorization'];
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: " . implode(',', $acceptableHeaders));
$params = '';
//get params have decimals in them, php doesn't like that and converts them to _


print($params);
$postparams = '';
foreach ($_POST as $key => $value) {
  $params .= ("&$key=" . urlencode($value));
}

$headers = apache_request_headers();

$curl = curl_init();
$headerParams = [];
foreach ($headers as $key => $value) {
  if (in_array($key, $acceptableHeaders)) {
    $headerParams[] = "$key:$value";
  }
}
curl_setopt_array($curl, array(
  CURLOPT_URL => "$proxyURL?{$_SERVER['QUERY_STRING']}",
  CURLOPT_FOLLOWLOCATION=> true,
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_ENCODING => "",
  CURLOPT_MAXREDIRS => 10,
  CURLOPT_SSL_VERIFYHOST => 0,
  CURLOPT_SSL_VERIFYPEER => 0,
  CURLOPT_TIMEOUT => 30,
  CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
  CURLOPT_CUSTOMREQUEST => "GET",
  CURLOPT_HTTPHEADER => $headerParams
));
$response = curl_exec($curl);
$err = curl_error($curl);
echo $err;
echo $response;
