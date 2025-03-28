const { getSharedKey } = require("./OIC/oic_hmac_authentication.js");
require("dotenv").config();

const accountKey = process.env.ACCOUNT_KEY;
const accountName = process.env.ACCOUNT_NAME;
const fileShare = process.env.BUCKET;
console.log(fileShare);

const baseURL = `https://${accountName}.file.core.windows.net`;
const request = {
  list_all_files: {
    account_name: accountName,
    account_key: accountKey,
    origin_directory: "",
    destination_directory: "",
    endpoint_url: `${baseURL}/${fileShare}/Interface/Upload?comp=list&restype=directory`,
    http_method: "GET",
  },
  read_single_file: {
    account_name: accountName,
    account_key: accountKey,
    origin_directory: "",
    destination_directory: "",
    endpoint_url: `${baseURL}/${fileShare}/Interface/Upload/Shipping-2025-03-27@02-00-06.shxupl`,
    http_method: "GET",
  },
  copy_file: {
    account_name: accountName,
    account_key: accountKey,
    origin_directory: `/${fileShare}/Interface/Input/dummy_file.txt`,
    destination_directory: `/${fileShare}/Interface/Upload/dummy_file.txt`,
    endpoint_url: baseURL,
    http_method: "PUT",
  },
  delete_file: {
    account_name: accountName,
    account_key: accountKey,
    origin_directory: `/${fileShare}/Interface/Input/dummy_file.txt`,
    destination_directory: "",
    endpoint_url: baseURL,
    http_method: "DELETE",
  },
};

const currentRequest = request.read_single_file;
const rawSharedKey = getSharedKey(...Object.values(currentRequest));
const [date, sharedKey] = rawSharedKey.split("||");
let url = new URL(
  currentRequest.endpoint_url + currentRequest.destination_directory
);
if (currentRequest.http_method === "DELETE") {
  url = new URL(currentRequest.endpoint_url + currentRequest.origin_directory);
}
console.log(sharedKey);

const myHeaders = new Headers();
myHeaders.append("x-ms-version", "2019-02-02");
myHeaders.append("x-ms-date", date);
if (currentRequest.http_method === "PUT") {
  myHeaders.append(
    "x-ms-copy-source",
    currentRequest.endpoint_url + currentRequest.origin_directory
  );
}
myHeaders.append("Authorization", sharedKey);
myHeaders.append("Host", url.host);
myHeaders.append("Accept", "application/xml");

const requestOptions = {
  method: currentRequest.http_method,
  headers: myHeaders,
  redirect: "follow",
};

fetch(url, requestOptions)
  .then((response) => response.text())
  .then((result) => console.log(result))
  .catch((error) => console.error(error));
