const base = require("./base");
const SassToCss = require("./sassToCss");
const CssToStyles = require("./cssToStyles");
const {ReplaceVariable} = require("./variable");
let options, SassToStyle;






function Transform(path){
  if(!SassToStyle) {
    SassToStyle = require("../index");
    options = SassToStyle.getOptions();
  }

  // 获取sass内容
  let sass = base.GetFileContent(path);
  // console.log("sass文件内容：", sass);

  // 转换变量
  sass = ReplaceVariable(sass);
  // console.log(sass);

  // sass转化为css
  let css = SassToCss(sass);

  // css转化为styles
  let styles = CssToStyles(css);
  // console.log("styles文件内容：", styles);

  // 写入
  path =  path.replace(/\.s?css$/, `${options.postfix}`);
  /*let nativeStyle = base.GetFileContent(path);
  if(!nativeStyle){
    nativeStyle = options.template;
  }*/

  let string = options.template.replace(/let styles += *{[\s\S]*?};/, () => `let styles = {\n${styles}\n};`);


  base.writeFile(path, string);
}


module.exports = Transform;