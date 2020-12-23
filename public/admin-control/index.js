let loginButton = document.getElementById("login-button");

class LOADER {
  constructor(isLoading) {
    this.isLoading = isLoading;
    this.elementLoader = document.createElement("div");
    this.switchLoading(this.isLoading);
  }
  switchLoading(isLoading) {
    if (isLoading) {
      this.elementLoader.classList.add("loader");
    } else {
      this.elementLoader.classList.remove("loader");
    }
  }
}

//loader
const LOADERS = {
  rowTable: new LOADER(false),
};
LOADERS.rowTable.switchLoading(true);
document
  .getElementById("listMemTb")
  .appendChild(LOADERS.rowTable.elementLoader);

loginButton.addEventListener("click", () => {
  setupUI(document.getElementById("pass").value);
});

const setupUI = (input) => {
  if (input === "123456788") {
    document.getElementById("login_div").style.display = "none";
    document.getElementById("sectionAddMem").style.display = "block";
    document.getElementById("reset-database").style.display = "block";
    renderCurrentMember();
  }
};

//Render current thi sinh
function renderCurrentMember() {
  db.ref("users/").on("value", (snapshot) => {
    let totalAttending = 0;
    let docs = snapshot.val();
    let data = [];
    let count = 0;
    document.getElementById("listMemTb").innerHTML = "";
    for (let doc in docs) {
      let u = docs[doc]["members"];
      let tenDonVi = docs[doc]["tenDonVi"];
      for (let m in u) {
        count++;
        data.push({
          ...u[m],
          tenDonVi,
        });
        if (u[m].checkin == 1) totalAttending++;
      }
    }
    //Sorting data by msdb ascending
    data.sort((a, b) => Number(a.msdb) - Number(b.msdb));

    //render data's row
    data.forEach((e) => {
      addingCardMem(e);
    });

    document.getElementById(
      "totalAttending"
    ).innerText = `${totalAttending} / ${count}`;
    //End of all loader
    LOADERS.rowTable.switchLoading(false);
  });
}
function addingCardMem(data) {
  let aMem = `<td class='msdb'>${data.msdb}</td>
            <td class='hovaten'>${data.hoVaTen}</td>
            <td class='chucvu'>${
              data.chucVu.length >= 65
                ? data.chucVu.substring(0, 66) + "..."
                : data.chucVu
            }</td>
            <td class='tothaoluan'>${data.toThaoLuan}</td>`;

  let newRow = document.createElement("tr");
  newRow.id = `member_${data.msdb}`;
  newRow.innerHTML = aMem;

  if (data.checkin == 1) {
    newRow.style.backgroundColor = "#FF0000";
  }

  document.getElementById("listMemTb").appendChild(newRow);
}

// Reset Database
document.getElementById("btnResetDB").addEventListener("click", () => {
  if (window.confirm("Bạn có chắc muốn reset lại dữ liệu điểm danh?")) {
    resetCheckin();
  }
});
function resetCheckin() {
  db.ref("users/")
    .once("value", (snapshot) => {
      snapshot.forEach((dv) => {
        dv.child("members").forEach((me) => {
          let updates = {};
          updates[`users/${dv.key}/members/${me.key}/checkin`] = 0;
          db.ref().update(updates);
        });
      });
    })
    .then(() => {
      alert("Thành công!");
    })
    .catch((err) => {
      alert("Reset thất bại! Vui lòng thử lại");
    });
}
