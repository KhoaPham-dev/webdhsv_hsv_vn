const fs = require("fs");
const readline = require("readline");
const { google } = require("googleapis");

//firebase
const firebase = require("firebase");
require("firebase/auth");
require("firebase/database");

var firebaseConfig = {
  apiKey: "AIzaSyDCqNpTFYxF2eQ1XD3HeV6x1y-I8b6al5s",
  authDomain: "dhdb-hsv.firebaseapp.com",
  projectId: "dhdb-hsv",
  storageBucket: "dhdb-hsv.appspot.com",
  messagingSenderId: "1008123776206",
  appId: "1:1008123776206:web:50c2d7a549f79eaabb149f",
  measurementId: "G-Y7H6CVYW48",
  databaseURL: "https://dhdb-hsv-default-rtdb.firebaseio.com",
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
var db = firebase.database();

// If modifying these scopes, delete token.json.
const SCOPES = ["https://www.googleapis.com/auth/spreadsheets.readonly"];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = "token.json";

// Load client secrets from a local file.
fs.readFile("credentials.json", (err, content) => {
  if (err) return console.log("Error loading client secret file:", err);
  // Authorize a client with credentials, then call the Google Sheets API.
  authorize(JSON.parse(content), listMajors);
});

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
  const { client_secret, client_id, redirect_uris } = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0]
  );

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getNewToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client);
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getNewToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
  });
  console.log("Authorize this app by visiting this url:", authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question("Enter the code from that page here: ", (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err)
        return console.error(
          "Error while trying to retrieve access token",
          err
        );
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) return console.error(err);
        console.log("Token stored to", TOKEN_PATH);
      });
      callback(oAuth2Client);
    });
  });
}

/**
 * Prints the names and majors of students in a sample spreadsheet:
 * @see https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit
 * @param {google.auth.OAuth2} auth The authenticated Google OAuth client.
 */
function listMajors(auth) {
  const sheets = google.sheets({ version: "v4", auth });
  sheets.spreadsheets.values.get(
    {
      spreadsheetId: "137rg4uMQ0npPnpTVhTdkjh46e9j-HnvdtH0djE0Yx4s",
      range: "sheet1",
    },
    (err, res) => {
      if (err) return console.log("The API returned an error: " + err);
      const rows = res.data.values;
      console.log(rows);
      if (rows.length) {
        // Print columns A and E, which correspond to indices 0 and 4.
        rows.map((row) => {
          if (row[0] !== "Đơn vị") {
            uploadDataToDatabase(row);
          }
        });
        //console.log(rows);
      } else {
        console.log("No data found.");
      }
    }
  );
}

async function uploadDataToDatabase(row) {
  let updates = {};
  let tenDonVi = row[0];
  let idDonVi = `${stringToASCII(row[0]).split(" ").join("").toLowerCase()}`;
  let idDaiBieu = `${ran()}_${stringToASCII(row[3]).split(" ").join("")}`;
  let msdb = row[1];
  let toThaoLuan = row[2];
  let hoVaTen = row[3];
  let ngaySinh = row[4];
  let chucVu = row[5];

  msdb =
    msdb.length >= 3
      ? msdb
      : ((msdb = "00" + msdb), msdb.substring(msdb.length - 3));
  updates[`users/${idDonVi}/members/${idDaiBieu}/msdb`] = msdb;
  updates[`users/${idDonVi}/members/${idDaiBieu}/toThaoLuan`] = toThaoLuan;
  updates[`users/${idDonVi}/members/${idDaiBieu}/hoVaTen`] = hoVaTen;
  updates[`users/${idDonVi}/members/${idDaiBieu}/ngaySinh`] = ngaySinh;
  updates[`users/${idDonVi}/members/${idDaiBieu}/chucVu`] = chucVu
    ? chucVu
    : "";
  updates[`users/${idDonVi}/members/${idDaiBieu}/checkin`] = 0;

  updates[`users/${idDonVi}/tenDonVi`] = tenDonVi;
  await db.ref().update(updates);
}
function ran() {
  return Math.floor(Math.random() * 100000);
}
function stringToASCII(str) {
  try {
    return str
      .replace(/[àáảãạâầấẩẫậăằắẳẵặ]/g, "a")
      .replace(/[èéẻẽẹêềếểễệ]/g, "e")
      .replace(/[đ]/g, "d")
      .replace(/[ìíỉĩị]/g, "i")
      .replace(/[òóỏõọôồốổỗộơờớởỡợ]/g, "o")
      .replace(/[ùúủũụưừứửữự]/g, "u")
      .replace(/[ỳýỷỹỵ]/g, "y")
      .replace(/[.#$/]/g, " ");
  } catch {
    return "";
  }
}
