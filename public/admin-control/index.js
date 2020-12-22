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
    renderCurrentMember();
  }
};

//Render current thi sinh
function renderCurrentMember() {
  let totalAttending = 0;
  db.ref("users/")
    .once("value")
    .then((snapshot) => {
      let docs = snapshot.val();
      let count = 0;

      document.getElementById("listMemTb").innerHTML = "";
      for (let doc in docs) {
        let u = docs[doc]["members"];
        let countGroup = 0;
        let tenDonVi = docs[doc]["tenDonVi"];
        for (let m in u) {
          count++;
          countGroup++;
          addingCardMem(u[m], tenDonVi, count, countGroup);
          if (u[m].checkin == 1) totalAttending++;
        }
      }
      document.getElementById(
        "totalAttending"
      ).innerText = `${totalAttending} / ${count}`;
      //End of all loader
      LOADERS.rowTable.switchLoading(false);
    });
}
function addingCardMem(data, tenDonVi, count, countGroup) {
  let headRow = "";
  if (countGroup === 1) {
    headRow = `
              <td></td>
              <td></td>
              <td></td>
              <h6>${tenDonVi}</h6>
              <td></td>
              <td></td>
            `;
  }
  let aMem = `<td class='stt'>${count}</td>
            <td class='hovaten'>${data.hoVaTen}</td>
            <td class='ngaysinh'>${data.ngaySinh}</td>
            <td class='chucvu'>${
              data.chucVu.length >= 65
                ? data.chucVu.substring(0, 66) + "..."
                : data.chucVu
            }</td>
            <td class='tothaoluan'>${data.toThaoLuan}</td>
            <td class='msdb'>${data.msdb}</td>`;

  if (headRow) {
    let newHeadRow = document.createElement("tr");
    newHeadRow.innerHTML = headRow;
    document.getElementById("listMemTb").appendChild(newHeadRow);
  }

  let newRow = document.createElement("tr");
  newRow.id = `member_${data.msdb}`;
  newRow.innerHTML = aMem;

  if (data.checkin == 1) {
    newRow.style.backgroundColor = "#C1D0DF";
  }

  document.getElementById("listMemTb").appendChild(newRow);
}
