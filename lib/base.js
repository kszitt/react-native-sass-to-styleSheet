const fs = require('fs');


// 获取文件内容
function GetFileContent(path){
  try {
    return fs.readFileSync(path, {
      encoding: "utf8"
    });
  } catch(err) {

  }
}

// 获取文件目录
function getReaddir(path){
  return fs.readdirSync(path, {withFileTypes: true})
}


// 写入文件
function writeFile(path, string){
  try {
    fs.writeFileSync(path, string);

    let date = new Date();
    console.log(`${date.toLocaleDateString()} ${date.toLocaleTimeString()}  编译成功：${path}`);
  } catch(err){
    console.error(err);
  }
}


exports.GetFileContent = GetFileContent;
exports.writeFile = writeFile;
exports.getReaddir = getReaddir;
