// file sample is here: https://drive.google.com/drive/folders/14gGmDQnrfDH-gAoaS3NxWNgSTQuoyDTV
//
// run_JOBS_(s_tags)
//           ^ 'tag1·tag2': tags, splitted by '·'
//
// Change tag /tags and run the function
// To run more then 1 tag, use semicolon as a delimeter: Clear Ranges·Log Values
function test_Jobs()
{
  // Test Tags:
  //   -----------------------------------------------------------------------------------------
  //   Clear Ranges     = clear values from selected 
  //   Log Values       = run the code and open the log: [Ctrl]+[Enter] 
  //   Create Report    = create a copy of the given report-template
  //   Fill Report      = fill the report with the portion of filtered data
  //   -----------------------------------------------------------------------------------------
  run_JOBS_('Delete Rows');    
}




function run_JOBS_(s_tags)
{ 
  if (!s_tags) { return -1; }
  var t = new Date();
  // use ids = false 
  // to execute all task ids 
  getSettings_();
  var d = CCC_.STR_DELIMEER1;
  var tags = s_tags.split(d);
  var all_tags = CCC_.TAG_JOBS.split(d);
  var all_ids = CCC_.IDS_JOBS.split(d);
  var ids = [], tag = '';
  for (var i = 0; i < all_ids.length; i++)
  {
    tag = all_tags[i];
    if (tags.indexOf(tag) > -1) {ids.push(all_ids[i]); }    
  }
  var s_ids = ids.join(d);  
  var res = runJOBS_(s_ids);
  Logger.log(res);
  Logger.log('Time to run the script [' + s_tags + '] = ' + (new Date() -t) + ' ms.');
}






/*
  ______                    
 |  ____|                   
 | |__ _   _ _ __   ___ ___ 
 |  __| | | | '_ \ / __/ __|
 | |  | |_| | | | | (__\__ \
 |_|   \__,_|_| |_|\___|___/                                                      

*/
var CCC_REM = {};

function clearRangeContents_(options)
{
  var range = options.range;
  range.clearContent();
  return 0;  
}


function rememberValues_(options)
{
  var holder = options.option1;
  var range = options.range;
  var values = range.getValues();
  CCC_REM[holder] = values; 
  return 0;
}

function logValues_(options)
{
  var holder = options.option1;  
  Logger.log(CCC_REM[holder]);
  return 0;  
}

function copyByTemplate_(options)
{
  var r         = options.range;
  var sheet     = r.getSheet();
  var SS        = sheet.getParent(); 
  var id_SS     = SS.getId();
  var file      = DriveApp.getFileById(id_SS);
  
  var sName     = sheet.getName();   // Sets  
  var value     = options.option1;   // Jardine
  var option2   = options.option2;   // 1fqhDJz4ZRkeSphqipOYBTw8lwMifwkW6~Report_~_created by Jobs
  var option3   = options.option3;   // Smith_fileId
  var d2        = options.d2;        // ~
  var options2  = option2.split(d2); // ['1fqhDJz4ZRkeSphqipOYBTw8lwMifwkW6', 'Report_', '_created by Jobs']
  var folderId  = options2[0];       // 1fqhDJz4ZRkeSphqipOYBTw8lwMifwkW6
  var replaceA1 = r.getA1Notation(); // B2
  var prefix    = options2[1];       // Report_
  var postfix   = options2[2];       // _created by Jobs

  // folder
  var folder = DriveApp.getFolderById(folderId);  
  if (!folder) { return -1; } // wrong folder id
   
  // create a copy
  var copy = file.makeCopy(folder);
  // set new name 
  copy.setName(prefix + value + postfix);
  // replace value in range
  var id =copy.getId();
  if (replaceA1 !== '')
  {    
    var ss = SpreadsheetApp.openById(id);
    var s = ss.getSheetByName(sName);
    var range = s.getRange(replaceA1);
    range.setValue(value);    
  }
    
  // remember new created file id
  CCC_REM[option3] = [[id]]; // save as 2d array
  
  return 0;
  
}


function filterByColumn_(options)
{
  var option1   = options.option1;         // data_mastrer
  var option2   = options.option2;         // data_Jardine
  var option3   = options.option3;         // Col3~Jardine
  var d2        = options.d2;              // ~  

  // data in    
  var dataIn = CCC_REM[option1]; 
  if (!dataIn) { return -1; } // no data
  
  var filterum = 
      {
        data: dataIn,
        stringConditions: option3,
        delimeter: d2
      };
  var dataOut =  getFilter_(filterum).dataOut;
  
  CCC_REM[option2] = dataOut;
  return 0;
  
}


function hideRows_(options)
{
  
  var option1   = options.option1;         // Col2~
  // Col2~ means hide all rows where column 2 value = '' (empty)
  var option2   = options.option2;         // order#1
  // order#1 is a placeholder for the valiable with ranges data
  // filtering a range requires getting the data. The data will be saved
  // to this valiable just in case some other function will need this data
  var r         = options.range;
  var data      = r.getValues();
  var d2        = options.d2;              // ~  
  var sheet     = r.getSheet();
  
   var filterum = 
      {
        data: data,
        stringConditions: option1,
        delimeter: d2,
        rowStart: r.getRow()
      }; 
  
  var rowsHide = getFilter_(filterum).rowNums;
  var rowSets = getRowSets_(rowsHide)
  // rowSets = 
  //  [{howMany=3.0, rowPosition=11.0}, {howMany=7.0, rowPosition=15.0}]
  
  for (var i = 0; i < rowSets.length; i++)
  {
     sheet.hideRows(rowSets[i].rowPosition, rowSets[i].howMany);  
  }
  
  CCC_REM[option2] = data; 
  
  return 0;
  
}

function showRows_(options)
{
  var r         = options.range;
  var sheet     = r.getSheet(); 
  sheet.showRows(r.getRow(), r.getHeight());  
  return 0;  
}


function writeValues_(options)
{
  var range = options.range;
  var option1 = options.option1; // data_Jardine
  
  // data in  
  var dataIn = CCC_REM[option1];
  if (!dataIn) { return -1; } // no data  

  var writer = 
      {
        sheet: range.getSheet(),
        data: dataIn,
        row: range.getRow(),
        column: range.getColumn(),
        clearData: false 
      };
      
  writeDataToSheet_(writer);

  return 0;  
}


function createDataValidation_(options)
{
  var range = options.range;
  var option1 = options.option1; // '_cost-groups_'!E3:E1000
  
  // new validation
  var validation = SpreadsheetApp.newDataValidation();
  
  if (option1)
  {
    // validation from range
    var sheet = range.getSheet();
    var file = sheet.getParent();
    var dvrange = file.getRange(option1);
    validation.requireValueInRange(dvrange);
  }
  else
  {
    return -1; // no range for validation 
  }
  
  // set validation
  range.setDataValidation(validation);
  
  return 0;    
}


function groupRows_(options) {
  var range = options.range; 
  range.shiftRowGroupDepth(1);
  return 0;
}


function ungroupRows_(options) {
  
  var range = options.range; 
  var rowIndex = range.getRow();
  var sheet = range.getSheet();  
  
  // get the first group
  try
  {    
    var group = sheet.getRowGroup(rowIndex, 1);
  }
  catch(e)
  {
    return -1; // no groups were foung    
  }
  
  // loop groups
  while (group) {
    group.remove(); 
    try
    {
      group = sheet.getRowGroup(rowIndex, 1);
    }
    catch(e)
    {
      group = false;
    }    
  }
  
  return 0;
}

function sendGmail_(options)
{
  var range = options.range;
  var Option1 = options.option1;
  var Option2 = options.option2; 
  var Option3 = options.option3;
  
  var emailer = 
      {
        emails: Option1.split(','),
        title: Option2,
        msg: Option3
      }; 
  return runEmailer_(emailer);
}


function deleteRows_(options)
{
  
  var option1   = options.option1;         // Col2~
  // Col2~ means delete all rows where column 2 value = '' (empty)
  var option2   = options.option2;         // order#1
  // order#1 is a placeholder for the valiable with ranges data
  // filtering a range requires getting the data. The data will be saved
  // to this valiable just in case some other function will need this data
  var r         = options.range;
  var data      = r.getValues();
  var d2        = options.d2;              // ~  
  var sheet     = r.getSheet();
  
   var filterum = 
      {
        data: data,
        stringConditions: option1,
        delimeter: d2,
        rowStart: r.getRow()
      }; 
  
  var rowsHide = getFilter_(filterum).rowNums;
  var rowSets = getRowSets_(rowsHide)
  // rowSets = 
  //  [{howMany=3.0, rowPosition=11.0}, {howMany=7.0, rowPosition=15.0}]
  
  for (var i = rowSets.length - 1; i >= 0; i--)
  {
     sheet.deleteRows(rowSets[i].rowPosition, rowSets[i].howMany);  
  }
  
  CCC_REM[option2] = data; 
  
  return 0;
  
}







/*
  _____                             
 |  __ \                            
 | |__) |__ _ _ __   __ _  ___ _ __ 
 |  _  // _` | '_ \ / _` |/ _ \ '__|
 | | \ \ (_| | | | | (_| |  __/ |   
 |_|  \_\__,_|_| |_|\__, |\___|_|   
                     __/ |          
                    |___/           
*/
function runJOBS_(ids)
{
  getSettings_();
  
  var d = CCC_.STR_DELIMEER1;
  var d2 = CCC_.STR_DELIMEER2;
  var all_ids = CCC_.IDS_JOBS.split(d);
  var all_fileids = CCC_.FILEIDS_JOBS.split(d);
  var all_sheetname = CCC_.SHEETNAME_JOBS.split(d);
  var all_rangea1 = CCC_.RANGEA1_JOBS.split(d);
  var all_clear_type = CCC_.CLEAR_TYPE_JOBS.split(d);
  var all_operations = CCC_.OPERATION_JOBS.split(d);
  var all_options1 = CCC_.VAR1_JOBS.split(d);
  var all_options2 = CCC_.VAR2_JOBS.split(d);
  var all_options3 = CCC_.VAR3_JOBS.split(d);
  var jobsSheet = CCC_.this_file.getSheetByName(CCC_.JOBSSHEET_JOBS);
  
  if (!ids) { ids = all_ids; }
  else { ids = ids.split(d); }  
  
  var res = [], subres;
  for (var i = 0; i < all_ids.length; i++)
  {
    var id = all_ids[i];
    if (ids.indexOf(id) > -1)
    {
      var ranger = 
          {
            fileId:     all_fileids[i],
            sheetName:   all_sheetname[i],
            rangeA1:     all_rangea1[i],
            rangeType:   all_clear_type[i] 
          };
      var r = getRange_(ranger);
      var options = {
        range: r,
        option1: all_options1[i],
        option2: all_options2[i],
        option3: all_options3[i], 
        d1: d,
        d2: d2,
        jobsSheet: jobsSheet 
      };
      var operation = all_operations[i];
      subres = this[operation](options);
      res.push(subres);
    }    
  }
  return res;
}  


function getRange_(ranger) {
  
  var fileId = ranger.fileId;
  var sheetName = ranger.sheetName;
  var rangeA1 = ranger.rangeA1;
  var rangeType = ranger.rangeType;
  
  // get file > range > sheet
  if (fileId === '') { 
    var file = SpreadsheetApp.getActive();
  }
  else
  {
    if (!fileId) { return -1; } // no file id
    var file = SpreadsheetApp.openById(fileId);
  }
  
  if (!file) { return -2; } // no file  
  if (sheetName)
  {
    var sheet = file.getSheetByName(sheetName);
    if (!sheet) { return -3; } // no sheet  
    if (rangeA1)
    {
      var range = sheet.getRange(rangeA1)      
    }
    else
    {
      var range = sheet.getDataRange();       
    }    
  }
  else if (rangeA1)
  {
    var range = file.getRangeByName(rangeA1);    
  }  
  else
  {
    var sheet = file.getSheets()[0];
    var range = sheet.getDataRange();
  }
  if (!range) { return -5; } // no range
  
  // clear range with condition
  switch (rangeType) {
    case 'range only':
      return range;
    case 'range and columns behind':
      var row = range.getRow();
      var rows = range.getSheet().getMaxRows();
      return range.offset(0, 0, rows - row + 1);
    case 'range up to the end of sheet':
      var sheet = range.getSheet();
      var rows = sheet.getMaxRows();
      var cols = sheet.getMaxColumns();
      var row = range.getRow();
      var col = range.getColumn();
      return range.offset(0, 0, rows - row + 1, cols - col + 1);
    default:
      return range;
  };
 
  
}


//function getRowSets_test()
//{
//  var rows = [2,3,4,5,6,50,51,52,49,12,13];
//  Logger.log(getRowSets_(rows)); //  [{howMany=5.0, rowPosition=2.0}, {howMany=2.0, rowPosition=12.0}, {howMany=4.0, rowPosition=49.0}] 
//}
function getRowSets_(rows)
{
  if (rows.length === 0) { return []; }
  var rowsGroups = [];
  function sortNumber_(a,b) {
        return a - b;
    }
  rows.sort(sortNumber_);
  var iniVal = rows[0] - 1;
  var val;
  var start = rows[0];
  var set = { rowPosition: start, howMany: 0 }, sets = [];
  for (var i = 0, l = rows.length; i < l; i++)
  {
    val = rows[i];   
    if ( (val - iniVal) === 1) 
    {
      set.howMany = set.howMany + 1;           
    }
    else
    {
      sets.push(set);
      var set = { rowPosition: (rows[i]), howMany: 1 }      
    }
    iniVal = val;
  }
  sets.push(set);
  
  return sets;  
}



/*
 __          __   _ _            
 \ \        / /  (_) |           
  \ \  /\  / / __ _| |_ ___ _ __ 
   \ \/  \/ / '__| | __/ _ \ '__|
    \  /\  /| |  | | ||  __/ |   
     \/  \/ |_|  |_|\__\___|_|   
                                 
*/

function writeDataToSheet_(writer)
{
  var data = writer.data;
  var fileId = writer.fileId;
  var file = writer.file;
  var sheetName = writer.sheetName;
  var sheet = writer.sheet;
  var row = writer.row || 1;
  var column = writer.column || 1;
  var isFreeRow = writer.isFreeRow;
  var clearData = writer.clearData;  
  
  // get sheet
  if (fileId) { file = SpreadsheetApp.openById(fileId); }
  if (sheetName) { sheet = file.getSheetByName(sheetName); }
  if (!sheet) { return -1; }
  
  // get row
  if (isFreeRow)
  {
    row = sheet.getLastRow() + 1;    
  }
  
  // get numRows, numColumns
  var numRows = data.length;
  var numColumns = data[0].length;  
  
  // get range
  var range = sheet.getRange(row, column, numRows, numColumns);
  
  if (clearData && !isFreeRow)
  {
   // clear old data if needed
    var last = sheet.getMaxRows();    
    var rowsDel = last - row + 1;
    var colsDel = data[0].length;
    var r = sheet.getRange(row, column, rowsDel, colsDel);
    Logger.log('Cleared. Range: [' +  r.getA1Notation() + '], Sheet: [' + sheet.getName() + '], Data: [[' + data[0].join(', ') + '], ...]');
    r.clearContent();    
  }  
   
  // set values
  range.setValues(data);
  
  return 0;
}

function runEmailer_(emailer)
{ 
  if(emailer.msg === '') { return -1; } // not send empty email
  GmailApp.sendEmail(
    emailer.emails[0],               // recipient
    emailer.title,                   // subject 
    'test', {                        // body
      htmlBody: emailer.msg,         // advanced options
      cc:emailer.emails.join(',')    // all recipients 
    }
  );
  return 0;
}



/*                                          
  ______ _ _ _            
 |  ____(_) | |           
 | |__   _| | |_ ___ _ __ 
 |  __| | | | __/ _ \ '__|
 | |    | | | ||  __/ |   
 |_|    |_|_|\__\___|_|   
                                                            
*/
//function test_getFilter()
//{
//  var data = [[1, 'a'],[2, 'a'],[3, 'd'],[4, 'a']]; 
//  var filterum = 
//      {
//        data: data,
//        stringConditions: 'Col2~a',
//        delimeter: '~',
//        rowStart: 10
//      };
//  Logger.log(getFilter_(filterum));
//  // {dataOut=[[1.0, a], [2.0, a], [4.0, a]], rowNums=[10.0, 11.0, 13.0]}
//}
function getFilter_(filterum)
{
  var data = filterum.data;
  var stringConditions = filterum.stringConditions;
  
  // returns all the data if 
  if (!stringConditions) { return data; }
  
  var d = filterum.delimeter;
  var rowStart = filterum.rowStart || 1;
  
  var conditions  = stringConditions.split(d);          // ['Col2', 'a']
  var col         = conditions[0];                      // Col2
  var index       = col.split('Col')[1] - 1;            // 1
  var value       = conditions[1];                      // a  

  var dataOut = [], row = [], rowNums = [];
  for (var i = 0; i < data.length; i++)
  {
    row = data[i];
    if (row[index] == value) { 
      dataOut.push(row); 
      rowNums.push(i + rowStart);
    } 
  }
  
  var res = 
      {    
        dataOut: dataOut,
        rowNums: rowNums
      };  
  return res;
    
}
