const { getSharedKey } = require("./OIC/oic_hmac_authentication.js");

const accountKey = "ACCOUNT_KEY"
const baseURL = "https://ACCOUNTNAME.file.core.windows.net";
const request = {
  list_all_files: {
    account_name: "ACCOUNTNAME",
    account_key: accountKey,
    origin_directory: "",
    destination_directory: "",
    endpoint_url: `${baseURL}/BUCKET/Interface/Upload?comp=list&restype=directory`,
    http_method: "GET",
  },
  read_single_file: {
    account_name: "ACCOUNTNAME",
    account_key: accountKey,
    origin_directory: "",
    destination_directory: "",
    endpoint_url: `${baseURL}/BUCKET/Interface/Upload/Shipping-2025-03-27@02-00-06.shxupl`,
    http_method: "GET",
  },
  copy_file: {
    account_name: "ACCOUNTNAME",
    account_key: accountKey,
    origin_directory: "/BUCKET/Interface/Input/dummy_file.txt",
    destination_directory: "/BUCKET/Interface/Upload/dummy_file.txt",
    endpoint_url: baseURL,
    http_method: "PUT",
  },
  delete_file: {
    account_name: "ACCOUNTNAME",
    account_key: accountKey,
    origin_directory: "/BUCKET/Interface/Input/dummy_file.txt",
    destination_directory: "",
    endpoint_url: baseURL,
    http_method: "DELETE",
  },
};

const currentRequest = request.delete_file;
const rawSharedKey = getSharedKey(...Object.values(currentRequest));
const [date, sharedKey] = rawSharedKey.split("||");
let url = new URL(currentRequest.endpoint_url + currentRequest.destination_directory);
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
  .then((response) => console.log(response.text()))
  .then((result) => console.log(result))
  .catch((error) => console.error(error));
