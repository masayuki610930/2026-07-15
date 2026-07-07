/**
 * 懇親会用ミニMBTI診断 — 会場集計バックエンド (Google Apps Script)
 * 設計書 DESIGN.md §12 を正本として実装。
 *
 * デプロイ設定:
 *   種類: ウェブアプリ / 次のユーザーとして実行: 自分 / アクセスできるユーザー: 全員
 * スクリプトプロパティ:
 *   READ_TOKEN = 集計閲覧用トークン（推測されない長いランダム文字列）
 */

var SHEET_NAME = "responses";
var MAX_BODY_LENGTH = 500;
var MAX_ROWS = 1000;
var VALID_TYPES = [
  "INTJ","INTP","ENTJ","ENTP",
  "INFJ","INFP","ENFJ","ENFP",
  "ISTJ","ISFJ","ESTJ","ESFJ",
  "ISTP","ISFP","ESTP","ESFP"
];
var UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function jsonOutput(obj){
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function getResponsesSheet(){
  return SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
}

function doPost(e){
  var lock = LockService.getScriptLock();
  try {
    var body = e && e.postData ? e.postData.contents : "";
    if(!body || body.length > MAX_BODY_LENGTH){
      return jsonOutput({ ok:false, error:"invalid_body" });
    }

    var payload;
    try {
      payload = JSON.parse(body);
    } catch(parseErr){
      return jsonOutput({ ok:false, error:"invalid_body" });
    }

    if(!payload || typeof payload.type !== "string" || VALID_TYPES.indexOf(payload.type) === -1){
      return jsonOutput({ ok:false, error:"invalid_type" });
    }
    if(typeof payload.uuid !== "string" || !UUID_RE.test(payload.uuid)){
      return jsonOutput({ ok:false, error:"invalid_uuid" });
    }

    try {
      lock.waitLock(10000);
    } catch(lockErr){
      return jsonOutput({ ok:false, error:"invalid_body" });
    }

    var sheet = getResponsesSheet();
    var lastRow = sheet.getLastRow();

    if(lastRow > 1){
      var existingUuids = sheet.getRange(2, 3, lastRow - 1, 1).getValues();
      for(var i = 0; i < existingUuids.length; i++){
        if(existingUuids[i][0] === payload.uuid){
          return jsonOutput({ ok:true, duplicate:true });
        }
      }
    }

    if(lastRow - 1 >= MAX_ROWS){
      return jsonOutput({ ok:false, error:"capacity_exceeded" });
    }

    sheet.appendRow([new Date().toISOString(), payload.type, payload.uuid]);
    return jsonOutput({ ok:true });
  } finally {
    lock.releaseLock();
  }
}

function doGet(e){
  var params = (e && e.parameter) || {};
  var readToken = PropertiesService.getScriptProperties().getProperty("READ_TOKEN");

  if(params.action !== "summary" || !readToken || params.key !== readToken){
    return jsonOutput({ ok:false, error:"unauthorized" });
  }

  var sheet = getResponsesSheet();
  var lastRow = sheet.getLastRow();
  var counts = {};
  VALID_TYPES.forEach(function(type){ counts[type] = 0; });

  var total = 0;
  if(lastRow > 1){
    var types = sheet.getRange(2, 2, lastRow - 1, 1).getValues();
    for(var i = 0; i < types.length; i++){
      var type = types[i][0];
      if(Object.prototype.hasOwnProperty.call(counts, type)){
        counts[type]++;
        total++;
      }
    }
  }

  return jsonOutput({
    ok: true,
    total: total,
    counts: counts,
    updatedAt: new Date().toISOString()
  });
}
