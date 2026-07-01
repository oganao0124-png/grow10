// 対象のスプレッドシートID
const SPREADSHEET_ID = '1kpcE98hPB1PjgywW5c-K4P9VuwOqunkwiQD82Hun4Ms';

// CORS対応のためのヘッダー作成関数
function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// 指定したシートが存在しなければ作成し、見出し行をセットする
function getOrCreateSheet(sheetName) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    if (sheetName === 'LoginHistory') {
      sheet.appendRow(['squadNumber', 'name', 'timestamp']);
    }
  }
  return sheet;
}

// GETリクエスト（データ取得）
function doGet(e) {
  try {
    const action = e.parameter.action;
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    
    if (action === 'getMembers') {
      const sheet = ss.getSheetByName('members');
      const data = sheet.getDataRange().getValues();
      return createJsonResponse({ status: 'success', data: data });
    }
    
    return createJsonResponse({ status: 'error', message: 'Invalid action' });
  } catch (error) {
    return createJsonResponse({ status: 'error', message: error.toString() });
  }
}

// POSTリクエスト（データ保存）
function doPost(e) {
  try {
    // Content-Type が text/plain で送られてくる想定（CORS回避のため）
    const postData = JSON.parse(e.postData.contents);
    const action = postData.action;

    if (action === 'saveGoal') {
      const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
      const sheet = ss.getSheetByName('members');
      if (!sheet) throw new Error("members sheet not found");
      
      const data = sheet.getDataRange().getValues();
      let foundRow = -1;
      
      // squadNumber は A列 (インデックス0)
      for (let i = 1; i < data.length; i++) {
        if (data[i][0] == postData.squadNumber) {
          foundRow = i + 1; // 1-indexed
          break;
        }
      }
      
      if (foundRow !== -1) {
        // 更新: G列 (7列目) に目標をセット
        sheet.getRange(foundRow, 7).setValue(postData.goalText);
        return createJsonResponse({ status: 'success', message: 'Goal saved to members sheet' });
      } else {
        return createJsonResponse({ status: 'error', message: 'User not found in members sheet' });
      }

    } else if (action === 'saveGrow') {
      const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
      const sheet = ss.getSheetByName('members');
      if (!sheet) throw new Error("members sheet not found");
      
      const data = sheet.getDataRange().getValues();
      let foundRow = -1;
      
      for (let i = 1; i < data.length; i++) {
        if (data[i][0] == postData.squadNumber) {
          foundRow = i + 1;
          break;
        }
      }
      
      if (foundRow !== -1) {
        // 更新: H列(8), I列(9), J列(10) にセット
        sheet.getRange(foundRow, 8).setValue(postData.reality);
        sheet.getRange(foundRow, 9).setValue(postData.options);
        sheet.getRange(foundRow, 10).setValue(postData.will);
        return createJsonResponse({ status: 'success', message: 'GROW saved to members sheet' });
      } else {
        return createJsonResponse({ status: 'error', message: 'User not found in members sheet' });
      }

    } else if (action === 'logLogin') {
      const sheet = getOrCreateSheet('LoginHistory');
      const now = new Date();
      sheet.appendRow([postData.squadNumber, postData.name, now]);
      
      return createJsonResponse({ status: 'success', message: 'Login logged' });
    }
    
    return createJsonResponse({ status: 'error', message: 'Invalid action' });
  } catch (error) {
    return createJsonResponse({ status: 'error', message: error.toString() });
  }
}
