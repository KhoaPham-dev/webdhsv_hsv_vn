let msdb = document.getElementById("scannedTextMemo");
let wait = document.getElementById("wait");
let infor = document.getElementById("infor");
jsqrscanner.succeeded = jsqrscanner();

document.getElementById("btn").addEventListener("click", function () {
  if (document.getElementById("password").value === "123456788") {
    document.getElementById("nhappass").style.display = "none";
    document.getElementById("diem-danh").style.display = "block";
  }
});

function submitCheckIn() {
  wait.innerText = "Đang xử lý...";
  wait.style.color = "black";
  wait.style.display = "block";
  if (msdb.value) {
    try {
      db.ref("users/")
        .once("value")
        .then(async (snapshot) => {
          let isFinded = false;
          snapshot = snapshot.val();
          for (let i in snapshot) {
            let dataDonVi = snapshot[i];
            if (dataDonVi.members) {
              for (let j in dataDonVi.members) {
                if (dataDonVi.members[`${j}`].msdb == msdb.value) {
                  let updates = {};
                  updates["/users/" + i + "/members/" + j + "/checkin"] = 1;
                  await db.ref().update(updates);
                  isFinded = true;
                  wait.innerText = "Hoàn thành";
                  wait.style.color = "green";
                  document.getElementById("tendonvi").innerText =
                    dataDonVi.tenDonVi;
                  document.getElementById("chucvu").innerText =
                    dataDonVi.members[`${j}`].hoVaTen;
                }
              }
              if (isFinded) {
                msdb.value = "";
                break;
              }
            }
          }
          if (!isFinded) {
            wait.style.display = "none";
            msdb.value = "";
            alert("Không tìm thấy, vui lòng nhập lại!");
          }
        });
    } catch (error) {
      msdb.value = "";
      wait.style.display = "none";
      alert(error);
    }
  } else {
    wait.style.display = "none";
    alert("Vui lòng nhập mã đại biểu");
  }
}
// JsQRScanner
function onQRCodeScanned(scannedText) {
  var scannedTextMemo = document.getElementById("scannedTextMemo");
  if (scannedTextMemo) {
    if (scannedTextMemo.value != scannedText) {
      scannedTextMemo.value = scannedText;
      submitCheckIn();
    }
  }
  var scannedTextMemoHist = document.getElementById("scannedTextMemoHist");
  if (scannedTextMemoHist) {
    scannedTextMemoHist.value = scannedTextMemoHist.value + "\n" + scannedText;
  }
}
function btnQRCodeScanned() {
  var scannedTextMemo = document.getElementById("scannedTextMemo");
  if (scannedTextMemo) {
    submitCheckIn();
  }
  var scannedTextMemoHist = document.getElementById("scannedTextMemoHist");
  if (scannedTextMemoHist) {
    scannedTextMemoHist.value = scannedTextMemoHist.value + "\n" + scannedText;
  }
}
function provideVideo() {
  var n = navigator;

  if (n.mediaDevices && n.mediaDevices.getUserMedia) {
    return n.mediaDevices.getUserMedia({
      video: {
        facingMode: "environment",
      },
      audio: false,
    });
  }

  return Promise.reject("Your browser does not support getUserMedia");
}

function provideVideoQQ() {
  return navigator.mediaDevices
    .enumerateDevices()
    .then(function (devices) {
      var exCameras = [];
      devices.forEach(function (device) {
        if (device.kind === "videoinput") {
          exCameras.push(device.deviceId);
        }
      });

      return Promise.resolve(exCameras);
    })
    .then(function (ids) {
      if (ids.length === 0) {
        return Promise.reject("Could not find a webcam");
      }

      return navigator.mediaDevices.getUserMedia({
        video: {
          optional: [
            {
              sourceId: ids.length === 1 ? ids[0] : ids[1], //this way QQ browser opens the rear camera
            },
          ],
        },
      });
    });
}

//this function will be called when JsQRScanner is ready to use
function JsQRScannerReady() {
  //create a new scanner passing to it a callback function that will be invoked when
  //the scanner succesfully scan a QR code
  var jbScanner = new JsQRScanner(onQRCodeScanned);
  //var jbScanner = new JsQRScanner(onQRCodeScanned, provideVideo);
  //reduce the size of analyzed image to increase performance on mobile devices
  jbScanner.setSnapImageMaxSize(300);
  var scannerParentElement = document.getElementById("scanner");
  if (scannerParentElement) {
    //append the jbScanner to an existing DOM element
    jbScanner.appendTo(scannerParentElement);
  }
}
