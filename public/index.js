let attended = [];
let total = 0;
let queue = [];
db.ref("users/").once("value", (snapshot) => {
  snapshot.forEach((dv) => {
    dv.child("members").forEach((me) => {
      total++;
      db.ref(`users/${dv.key}/members/${me.key}`).on("value", (a) => {
        let aMem = a.val();
        //If checkin = 1
        //Add this obj to attended if not find
        if (aMem.checkin === 1) {
          if (
            attended.findIndex((e) => {
              return e.msdb === aMem.msdb;
            }) === -1
          ) {
            attended.push(aMem);
          }
          //Display infor

          displayInfor(aMem);
        }
        //If checkin = 0
        //Remove this obj from attended if find
        else {
          let i = attended.findIndex((e) => {
            return e.msdb === aMem.msdb;
          });
          if (i !== -1) {
            attended.splice(i, 1);
          }
        }
        loadChart([total, attended.length]);
      });
    });
  });
});
function displayInfor(aMem) {
  let msdb = aMem.msdb;
  document.getElementById("infor").innerHTML = `<img src="./the_dai_bieu/${
    aMem.msdb.length >= 3
      ? aMem.msdb
      : ((msdb = "00" + aMem.msdb), msdb.substring(msdb.length - 3))
  }.jpg" style="width: ${window.screen.width * 0.3}px;"/>`;
}
function loadChart(rdata) {
  console.log(rdata);
  // Load google charts
  google.charts.load("current", { packages: ["corechart"] });
  google.charts.setOnLoadCallback(drawChart);
  // Draw the chart and set the chart values
  function drawChart() {
    try {
      var data = google.visualization.arrayToDataTable([
        ["status", "num"],
        ["Hiện diện", rdata[1]],
        ["Vắng", rdata[0] - rdata[1]],
      ]);

      // Optional; add a title and set the width and height of the chart
      var options = {
        width: window.screen.width * 0.45,
        height: window.screen.width * 0.25,
      };

      // Display the chart inside the <div> element with id="piechart"
      var chart = new google.visualization.PieChart(
        document.getElementById("piechart")
      );
      chart.draw(data, options);
    } catch (err) {}
  }
}
