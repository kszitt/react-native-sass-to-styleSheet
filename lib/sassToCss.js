
// Delete Note， replace #,\t
function deleteNotes(style){
  let space = require("../index").getOptions().space;

  style = style.replace(/\t/g, space);

  style = style.replace(/ *?\/\/[\s\S]+?\n/g, "").replace(/\s*?\/\*[\s\S]+?\*\//g, "");
  return style.replace(/#[\S]+?[ ;{]/g, text => {
    if(/^#[A-z\d]{3,6};$/.test(text)){
      return text;
    }
    return text.replace(/#/, ".");
  });
}

// media
function media(style){
  /*style = style.replace(/@media.+?{[\s\S]+?\n}/g, text => (
    text.replace(/{/g, "start&&media")
      .replace(/}/g, "end&&media")
  ));*/

  style = style.replace(/@media.+?{/g, text => {
    let media = "";
    text.replace(/and\s*\(.+?\)/g, text => {
      text = text.replace(/^and\s*\(\s*/, "")
        .replace(/;?\s*\)$/, "");

      let key = text.match(/[^:]+/)[0],
        value = parseFloat(text.match(/:\s*\d+/)[0].replace(/:\s*/, ""));

      if(media) media += "&&";
      switch(key){
        case "min-width":
          media += "width>="+value;
          break;
        case "max-width":
          media += "width<="+value;
          break;
        case "min-height":
          media += "height>="+value;
          break;
        case "max-height":
          media += "height<="+value;
          break;
      }

      return "";
    });

    if(!media) return text;

    return text.replace(/^@media.+?{/, `.@media${media} {`);
  });

  return style;
}

// replace {}
function replace(style, index){
  if(!/{/.test(style)) return style;

  // Find the innermost {}
  style = style.replace(/\s*\..+{[^{]+?}/, text => {
    // key: className
    let key = text.match(/\..+{/)[0].replace(/\.|\s*{/g, "");

    if(index === undefined) {
      index = 0;
    } else {
      index++;
    }

    // replace className, %7B
    text = text.replace(/[\S]+ *\*\d+%7B/g, s => "." + key + "_" + s.replace(/^\./, ""));

    // replace {}
    return text.replace(/{/, "*"+index+"%7B").replace(/}/, "*"+index+"%7D");
  });

  return replace(style, index);
}

// sort
function port(style, index){
  let key = style.match(/\*\d+%7/);
  if(key){
    key = key[0];
  } else {
    return style;
  }

  if(index === undefined) {
    index = 0;
  } else {
    index++;
  }

  style = style.replace(eval("/\\"+ key +"[BD]/g"), text => {
    return text.replace(/\*\d+%/g, d => "*"+ index + "_%")
  });

  return port(style, index);
}

// extract
function extract(style, i=0, css=""){
  if(!eval("/\\*"+ i +"_%7[BD]/").test(style)) {
    let media = style.match(/.media[\s\S]+?\nend&&media/g),
      i = 0;

    while(media && media[i]){
      css += media[i];
      css += "\n";
      i++;
    }
    return css;
  }

  // Get a complete *\d_%7B  *\d_%7D
  let str = style.match(eval("/ *.+?\\*"+ i +"_%7B[\\s\\S]+?\\*"+ i +"_%7D/"));

  if(str){
    // Outermost Replacement Back to {}
    str = str[0].replace(eval("/\\*"+ i +"_%7B/"), "{").replace(eval("/\\*"+ i +"_%7D/"), "}") + "\n";
    // Delete redundant {}
    str = str.replace(/\s*.+?\*\d+_%7B[\s\S]+\*\d+_%7D/, "");
    // Delete spaces before curly braces (formatting)
    str = str.replace(/\s*.+?{[\s\S]+}/, text => {
      let space = text.match(/^ */)[0];

      text = text.replace(eval("/^"+ space +"/"), "");
      text = text.replace(eval("/\\n"+ space +"/g"), "\n");

      return text;
    });
    css += str;
  }

  i++;
  return extract(style, i, css);
}

module.exports = function SassToCss(sass){
  sass = deleteNotes(sass);
  sass = media(sass);
  sass = replace(sass);
  sass = port(sass);
  sass = extract(sass);

  return sass;
};