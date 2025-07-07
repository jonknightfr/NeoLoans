// NatWest Demo
/*
var CONFIG = {
  name: "PingOne",
  authEndPoint: "https://auth.pingone.com",
  apiEndPoint: "https://api.pingone.com/v1",
  envId: "6fa1cf7d-3008-4baa-a835-b8ced178e984",
  scope: "openid",
  client: {
    id: "2fee2098-0d6a-4ed4-9ed6-3ed8c769c208",
    secret: "NJY1SMy_IDMTFEE_B54VrdNNvbd.GbJns0UnH.~bal5E-QOK4uUXSUoTNr4jeQuM",
  },
  davinci: {
    policy: "a95a2ae3e2b4d7cecde8850ed6311849",
    clientid: "30501e29b35ea22f3d3bc36f2793de4a",
  },  
  credentialType: "NatWest Current Account",
  protocol: "NATIVE", // "NATIVE" or "OPENID4VP"
  digitalWalletAppId: "0af0df92-4c7b-4618-9706-6fdbfca496f1"
};
*/


/*
var CONFIG = {
  name: "PingOne",
  authEndPoint: "https://auth.pingone.eu",
  apiEndPoint: "https://api.pingone.eu/v1",
  envId: "8dafdf72-bcb0-4f82-bc52-31b908396cf5",
  scope: "openid",
  client: {
    id: "2dc6ea75-5212-4f50-8bfe-6311d776601d",
    secret: "~kttoT7qC49LL.s3Q9rm55_kPrEvtqoWOAgYrH-1IvhEM8lQw7sRMlGQ50kJQ9.R",
  },
  davinci: {
    policy: "a95a2ae3e2b4d7cecde8850ed6311849",
    clientid: "30501e29b35ea22f3d3bc36f2793de4a",
  },  
  credentialType: "Employee ID Card", // "Your Digital ID from NatWest" or "Driving License"
  protocol: "NATIVE", // "NATIVE" or "OPENID4VP"
  digitalWalletAppId: "5b496a23-179e-4faf-a30b-75e6d4983d68"        
};
*/


var CONFIG = {
    name: "PingOne",
    authEndPoint: "https://auth.pingone.eu",
    apiEndPoint: "https://api.pingone.eu/v1",
    envId: "e50a2778-9c5e-4fdd-93c6-877f68849e25",
    scope: "openid",
    client: {
      id: "58dfbbac-2207-4722-848d-96354cdca521",
      secret: "t0A2Ro1Rkmi0TrX~YyXjlcO.gO_th.RrCI8jw.4xG7n-SrCfmvUC-1KRU_ZaVcTp",
    },
    davinci: {
      policy: "a95a2ae3e2b4d7cecde8850ed6311849",
      clientid: "30501e29b35ea22f3d3bc36f2793de4a",
    },  
    credentialType: "Pet Insurance", // "Your Digital ID from NatWest" or "Driving License"
    protocol: "NATIVE", // "NATIVE" or "OPENID4VP"
    digitalWalletAppId: "706a8b62-33bd-41d5-a288-33a20b6e6a57"       
};   





var attributeMap = {
  "givenName": [ "First Name", "First name", "GIVEN NAME" ],
  "sn": [ "Last Name", "Last name", "Surname", "FAMILY NAME" ],
  "email": [ "Email Address", "EMAIL ADDRESS" ],
  "idNumber": [ "License Number", "IDNumber" ],
  "dob": [ "Date of Birth", "Birthdate" ],
  "telephoneNumber": [ "Mobile Phone" ],
  "city": [ "City" ],
  "street": [ "Street" ],
  "issuer": [ "Issued by" ],
  "risk": [ "risk" ],
  "accountNo": [ "Account Number", "EMPLOYEE NUMBER" ],
  "sortCode" : [ "Sort Code" ]
};


function syntaxHighlight(json) {
  json = json
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  return json.replace(
    /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
    function (match) {
      var cls = "number";
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          cls = "key";
        } else {
          cls = "string";
        }
      } else if (/true|false/.test(match)) {
        cls = "boolean";
      } else if (/null/.test(match)) {
        cls = "null";
      }
      if (match.length > 48) match = match.substring(0, 47) + ' ..."';
      return '<span class="' + cls + '">' + match + "</span>";
    }
  );
}

function verifyCredentials() {
  var at = getAccessToken();
  console.log(at);
  verificationPresentation(at, CONFIG.credentialType);
}

function verificationPresentation(at, credType) {
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.open(
    "POST",
    `${CONFIG.apiEndPoint}/environments/${CONFIG.envId}/presentationSessions`,
    false
  );
  xmlhttp.setRequestHeader("Content-type", "application/json");
  xmlhttp.setRequestHeader("Authorization", "Bearer " + at);
  var payload = {
    "protocol": CONFIG.protocol,
    "digitalWalletApplication": {
        "id": CONFIG.digitalWalletAppId
    },
    "requestedCredentials": [
        {
            "keys": [],
            "type": CONFIG.credentialType
        }
    ],
    "message": "Please present the requested verifiable credential."
  };
  xmlhttp.send(JSON.stringify(payload));
  console.log(xmlhttp.responseText);

  try {
    var json = JSON.parse(xmlhttp.responseText);
    //var qr = json._links.qr.href;
    //var html = `<br><em>Please scan the QR code to use your wallet</em><br><br><img src="${qr}" />`;
    //document.getElementById("credentialCard").innerHTML = html;
    
    document.getElementById("credentialCard").innerHTML = "<br><em>Please scan the QR code to use your wallet</em><br>";
    var qr = json._links.appOpenUrl.href;
    new QRCode(document.getElementById("credentialCardImage"), qr);
    
    setTimeout(function () {
      pollForCredential(at, json.id);
    }, 4000);
  } catch (e) {
    console.log(
      "Error getting credential presentation: " + xmlhttp.responseText
    );
  }
}

function pollForCredential(at, id) {
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.open(
    "GET",
    `${CONFIG.apiEndPoint}/environments/${CONFIG.envId}/presentationSessions/${id}/credentialData`,
    false
  );
  xmlhttp.setRequestHeader("Content-type", "application/json");
  xmlhttp.setRequestHeader("Authorization", "Bearer " + at);
  xmlhttp.send(null);
  console.log(xmlhttp.responseText);

  var claimsStr = "";
  var userProfile = {};
  try {
    var json = JSON.parse(xmlhttp.responseText);
    if (json.status == "INITIAL" || json.status == "WAITING") {
      setTimeout(function () {
        pollForCredential(at, id);
      }, 4000);
    } else if (json.status == "VERIFICATION_SUCCESSFUL") {
      for (var i = 0; i < json.sessionData.credentialsDataList.length; i++) {
        var cred = json.sessionData.credentialsDataList[i];
        claimsStr = syntaxHighlight(JSON.stringify(cred, null, 2));
        
        userProfile["issuer"] = cred.type;
        for (var j = 0; j < cred.data.length; j++) {
          if (cred.data[j].key == "CardImage") document.getElementById("credentialCardImage").innerHTML = `<div>${cred.data[j].value}</div>`;
          else {
            Object.keys(attributeMap).forEach(function(key) {
              for (var k=0; k < attributeMap[key].length; k++) {
                if (cred.data[j].key == attributeMap[key][k]) {
                  userProfile[key] = cred.data[j].value;
                }
              }
            })          
          }
        }
          
      }
      document.getElementById("credentialCardImage").title = "Verified Claims";
      $('#credentialCardImage').popover({"container":"body", "placement":"left", "html":"true", "content":'<pre style="overflow-y:auto; white-space:pre-wrap; max-height:500px; font-size:10px;">' + claimsStr + "</pre>"} );

      document.getElementById("credentialCard").innerHTML = "<br><em>Thank you. We used this credential card:</em><br>";
      console.log("Profile: " + JSON.stringify(userProfile));
      
      document.getElementById("issuer").style.border = "3px solid lightgreen";
      if (userProfile.hasOwnProperty("accountNo")) userProfile["issuer"] += ` (${userProfile["accountNo"].substr(0,3)}xxxxx)`;
      Object.keys(userProfile).forEach(function(key) {
          if (document.getElementById(key)) {
            document.getElementById(key).value = userProfile[key];
            document.getElementById(key).readOnly = true;
          }
      });      

      if (userProfile.risk != null) {
        document.getElementById("loanRanger").max = String(userProfile.risk * 100);
        document.getElementById("loanRanger").value = String(userProfile.risk * 100);
        document.getElementById("loanRangerLabel").innerText = "£"+String(userProfile.risk * 100);
        document.getElementById("loanRangerMessage").innerText = "Based on your current credit score this is the maxiumum amount that you can borrow today.";
        document.getElementById("loanAmount").innerHTML = "£" + numberWithCommas(userProfile.risk * 100);        
      }
      
    } else console.log("Verification failed: " + xmlhttp.responseText);
  } catch (e) {
    console.log("Error polling credential data: " + xmlhttp.responseText);
  }
}

function getAccessToken() {
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.open(
    "POST",
    `${CONFIG.authEndPoint}/${CONFIG.envId}/as/token`,
    false
  );
  xmlhttp.setRequestHeader(
    "Content-type",
    "application/x-www-form-urlencoded"
  );
  xmlhttp.send(
    `grant_type=client_credentials&client_id=${CONFIG.client.id}&client_secret=${CONFIG.client.secret}&scope=${CONFIG.scope}`
  );
  try {
    var json = JSON.parse(xmlhttp.responseText);
    return json.access_token;
  } catch (e) {
    console.log("Error getting access token: " + xmlhttp.responseText);
  }
  return null;
}
