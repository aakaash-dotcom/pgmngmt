// Google Apps Script Drive Integration Helper for Agam PG

export const GOOGLE_APPS_SCRIPT_TEMPLATE = `// ==========================================
// AGAM MEN'S PG & STAY - GOOGLE DRIVE & SHEETS UPLOADER
// Deploy this as a Web App to store tenant photos & export spreadsheets directly in your Drive!
// ==========================================

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    
    // ACTION 1: CREATE GOOGLE SPREADSHEET (FINANCIALS / TENANTS)
    if (data.action === "createSheet") {
      var title = data.title || ("Agam PG Master Ledger - " + new Date().toLocaleDateString());
      var ss = SpreadsheetApp.create(title);
      var tabs = data.tabs || [];
      
      for (var i = 0; i < tabs.length; i++) {
        var tabData = tabs[i];
        var sheet = (i === 0) ? ss.getActiveSheet() : ss.insertSheet(tabData.title);
        sheet.setName(tabData.title);
        
        var allRows = [tabData.headers].concat(tabData.rows || []);
        if (allRows.length > 0 && allRows[0].length > 0) {
          sheet.getRange(1, 1, allRows.length, allRows[0].length).setValues(allRows);
          sheet.getRange(1, 1, 1, allRows[0].length).setFontWeight("bold").setBackground("#d1e7dd");
          sheet.autoResizeColumns(1, allRows[0].length);
        }
      }

      // Move into target folder
      var ssFile = DriveApp.getFileById(ss.getId());
      var targetFolder = getOrCreateAgamFolder(data.folderName || "Agam PG Documents");
      ssFile.moveTo(targetFolder);
      ssFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        fileId: ss.getId(),
        spreadsheetId: ss.getId(),
        spreadsheetUrl: ss.getUrl(),
        fileUrl: ss.getUrl()
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // ACTION 2: UPLOAD RESIDENT PHOTO / DOCUMENT
    var base64Data = data.base64 || data.base64Data;
    var filename = data.filename || data.fileName || ("Tenant_Doc_" + new Date().getTime() + ".jpg");
    var targetFolderId = data.folderId || "";

    if (!base64Data) {
      return ContentService.createTextOutput(JSON.stringify({
        status: "error",
        message: "No base64 data or action provided"
      })).setMimeType(ContentService.MimeType.JSON);
    }

    var contentType = "image/jpeg";
    var rawBase64 = base64Data;
    if (base64Data.indexOf("data:") === 0) {
      var parts = base64Data.split(",");
      var mimeMatch = parts[0].match(/:(.*?);/);
      if (mimeMatch && mimeMatch[1]) {
        contentType = mimeMatch[1];
      }
      rawBase64 = parts[1];
    }

    var decoded = Utilities.base64Decode(rawBase64);
    var blob = Utilities.newBlob(decoded, contentType, filename);

    var folder;
    if (targetFolderId && targetFolderId.trim() !== "") {
      try {
        folder = DriveApp.getFolderById(targetFolderId.trim());
      } catch (err) {
        folder = getOrCreateAgamFolder(data.folderName || "Agam PG Documents");
      }
    } else {
      folder = getOrCreateAgamFolder(data.folderName || "Agam PG Documents");
    }

    var file = folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    var viewUrl = "https://drive.google.com/file/d/" + file.getId() + "/view?usp=sharing";

    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      fileId: file.getId(),
      fileUrl: viewUrl,
      downloadUrl: file.getDownloadUrl(),
      name: file.getName(),
      folderName: folder.getName()
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function getOrCreateAgamFolder(folderName) {
  var name = folderName || "Agam PG Documents";
  var folders = DriveApp.getFoldersByName(name);
  if (folders.hasNext()) {
    return folders.next();
  }
  return DriveApp.createFolder(name);
}

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: "online",
    service: "Agam PG Drive & Sheets Uploader Service",
    timestamp: new Date().toISOString()
  })).setMimeType(ContentService.MimeType.JSON);
}
`;

export const DEFAULT_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwX6RqBoKu-7nTJ0PkdvlQosfe2IqsLkZJRQAeeFEceoDRdgjumi8HaO__jDBP8GOMf/exec';

export const getSavedAppsScriptUrl = (): string => {
  return localStorage.getItem('agam_pg_drive_appscript_url') || DEFAULT_APPS_SCRIPT_URL;
};

export const setSavedAppsScriptUrl = (url: string): void => {
  localStorage.setItem('agam_pg_drive_appscript_url', url.trim());
};

export const getSavedDriveFolderId = (): string => {
  return localStorage.getItem('agam_pg_drive_folder_id') || '';
};

export const setSavedDriveFolderId = (folderId: string): void => {
  localStorage.setItem('agam_pg_drive_folder_id', folderId.trim());
};

export interface AppsScriptUploadResult {
  status: 'success' | 'error';
  fileId?: string;
  fileUrl?: string;
  downloadUrl?: string;
  name?: string;
  folderName?: string;
  message?: string;
}

export async function uploadImageViaAppsScript(
  base64: string,
  filename: string,
  scriptUrlOverride?: string,
  folderIdOverride?: string
): Promise<AppsScriptUploadResult> {
  const scriptUrl = (scriptUrlOverride || getSavedAppsScriptUrl()).trim();
  const folderId = (folderIdOverride || getSavedDriveFolderId()).trim();

  if (!scriptUrl) {
    throw new Error('Google Apps Script URL is not configured. Please paste your deployed Web App URL.');
  }

  // Use server-side proxy route to avoid browser CORS / redirect issues with Google Apps Script
  try {
    const res = await fetch('/api/drive/upload-appscript', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        scriptUrl,
        base64,
        base64Data: base64,
        filename,
        fileName: filename,
        folderName: 'Agam PG Documents',
        folderId,
      }),
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.error || `Server responded with ${res.status}`);
    }

    const data: AppsScriptUploadResult = await res.json();
    if (data.status === 'error') {
      throw new Error(data.message || 'Apps script reported an error uploading file');
    }
    return data;
  } catch (serverErr: any) {
    // If backend proxy fails for any reason, try direct fetch
    console.warn('Backend proxy attempt failed, trying direct Apps Script post:', serverErr);
    try {
      const directRes = await fetch(scriptUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({
          base64,
          base64Data: base64,
          filename,
          fileName: filename,
          folderName: 'Agam PG Documents',
          folderId,
        }),
      });
      const directData: AppsScriptUploadResult = await directRes.json();
      return directData;
    } catch {
      throw serverErr;
    }
  }
}

export interface SheetTabPayload {
  title: string;
  headers: string[];
  rows: (string | number)[][];
}

export interface AppsScriptSheetResult {
  status: 'success' | 'error';
  fileId?: string;
  spreadsheetId?: string;
  spreadsheetUrl?: string;
  fileUrl?: string;
  message?: string;
}

export async function exportSheetViaAppsScript(
  title: string,
  tabs: SheetTabPayload[],
  folderName: string = 'Agam PG Documents',
  scriptUrlOverride?: string
): Promise<AppsScriptSheetResult> {
  const scriptUrl = (scriptUrlOverride || getSavedAppsScriptUrl()).trim();

  if (!scriptUrl) {
    throw new Error('Google Apps Script URL is not configured.');
  }

  // First try the server proxy
  try {
    const res = await fetch('/api/drive/export-sheet-appscript', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        scriptUrl,
        title,
        folderName,
        tabs,
      }),
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.error || `Server responded with ${res.status}`);
    }

    const data: AppsScriptSheetResult = await res.json();
    if (data.status === 'error') {
      throw new Error(data.message || 'Google Apps Script reported an error creating sheet');
    }
    return data;
  } catch (proxyErr: any) {
    console.warn('Backend proxy attempt failed for sheet creation, trying direct:', proxyErr);
    try {
      const directRes = await fetch(scriptUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({
          action: 'createSheet',
          title,
          folderName,
          tabs,
        }),
      });
      const directData: AppsScriptSheetResult = await directRes.json();
      return directData;
    } catch {
      throw proxyErr;
    }
  }
}

