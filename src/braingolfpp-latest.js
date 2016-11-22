(function(global){

// The current verion of braingolfpp.
var version = "1.00.00.00",

//-----------------------------------------------------------------------------
// Symbol look up.
Symbols = {
  "+": [],
  "-": [],
  ">": [],
  "<": [],
  "[": [],
  "]": [],
  ".": [],
  ",": []
}

//-----------------------------------------------------------------------------
// Commands.
function Command(f) {
  if(typeof f === 'function') {
    this.execute = f;
  } else if(typeof f === 'string') {
    this.execute = function(tkn,prgm) {
      // Replace the 'tkn' literal (essential from start to end)
      // with 'f' in the 'prgm.code'.
    }
  }
  this.tokenize = function(tkn) {
    tkn.branches.push(new Token(tkn.end+1,tkn.code,tkn));
    tkn.branches[0].tokenize();
  }
}

Command.base = {
  "+": function(tkn,prgm) { prgm.current_cell().increment(tkn,prgm) },
  "-": function(tkn,prgm) { prgm.current_cell().decrement(tkn,prgm) },
  ">": function(tkn,prgm) { ++prgm.pos.y },
  "<": function(tkn,prgm) { --prgm.pos.y },
  "[": function(tkn,prgm) {
    tkn.next =
    prgm.current_cell().is_non_zero() ? tkn.branches[0] : tkn.branches[1].branches[1]
  },
  "]": function(tkn,prgm) { },
  ".": function(tkn,prgm) {
    var a = prgm.current_cell().printify();
    for(var i = 0, l = a.length; i < l; ++i) {
      prgm.output.push(a[i]);
    }
  }
}

Symbols["+"].unshift(new Command(Command.base["+"]));
Symbols["-"].unshift(new Command(Command.base["-"]));
Symbols[">"].unshift(new Command(Command.base[">"]));
Symbols["<"].unshift(new Command(Command.base["<"]));
Symbols["["].unshift(new Command(Command.base["["]));
(function() {
  var temp = new Command(Command.base["]"]);
  temp.tokenize = function(tkn) {
    var p = tkn.parent;
    while(!(p.literal === "[" && p.branches.length === 1)) {
      p = p.parent;
    }
    p.branches.push(tkn);
    tkn.branches.push(p);
    tkn.branches.push(new Token(tkn.end+1,tkn.code,tkn));
    tkn.branches[1].tokenize();
  }
  Symbols["]"].unshift(temp);
})()
Symbols["."].unshift(new Command(Command.base["."]));

//-----------------------------------------------------------------------------
// The lexical analyzer.
function Token(start, code, parent) {
  this.parent = parent;
  // Come back and add look ahead for '=' for assigmnent operator.
  this.start = start;
  this.code = code;
  var cmd = "";
  this.literal = "";
  this.inputs = [];
  this.outputs = [];
  for(var i = start; i < code.length; ++i) {
    cmd += code[i];
    if(Symbols[cmd] !== undefined && Symbols[cmd][0]) {
      // Look ahead for possible longer command.
      if(code[i+1] !== undefined) {
        var temp = cmd + code[i+1];
        // Will need to check to see if code[i+1] is '='.
        if(Symbols[temp] !== undefined && Symbols[temp][0]) {
          continue;
        }
      }
      
      this.literal = cmd;
      this.cmd = Symbols[cmd][0];
      break;
    }
  }
  this.end = start + this.literal.length - 1;
  // Collect all of the different branches.
  this.branches = [];
}
Token.prototype.tokenize = function() {
  if(this.cmd !== undefined) {
    this.cmd.tokenize(this);
  }
  this.next = this.branches[0];
}

//-----------------------------------------------------------------------------
function Cell(x,y) {
  this.x = x;
  this.y = y;
  this.value = undefined;
}
Cell.prototype.content = function() {
  if(this.value === undefined) this.value = new Cell.types.BYTE();
  return this.value;
}
Cell.types = {}
Cell.prototype.increment = function(tkn,prgm) {
  this.content().increment(this,tkn,prgm);
}
Cell.prototype.decrement = function(tkn,prgm) {
  this.content().decrement(this,tkn,prgm);
}
Cell.prototype.is_non_zero = function(tkn,prgm) {
  return this.content().is_non_zero(this,tkn,prgm);
}
Cell.prototype.printify = function(tkn,prgm) {
  return this.content().printify(this,tkn,prgm);
}
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
Cell.characters = [
'¡','¢','£','¤','¥','¦','©','¬','®','µ','½','¿','€','Æ','Ç','Ð',
'Ñ','×','Ø','Œ','Þ','ß','æ','ç','ð','ı','ȷ','ñ','÷','ø','œ','þ',
' ','!','"','#','$','%','&',"'",'(',')','*','+',',','-','.','/',
'0','1','2','3','4','5','6','7','8','9',':',';','<','=','>','?',
'@','A','B','C','D','E','F','G','H','I','J','K','L','M','N','O',
'P','Q','R','S','T','U','V','W','X','Y','Z','[','\\',']','^','_',
'`','a','b','c','d','e','f','g','h','i','j','k','l','m','n','o',
'p','q','r','s','t','u','v','w','x','y','z','{','|','}','~','¶',
'°','¹','²','³','⁴','⁵','⁶','⁷','⁸','⁹','⁺','⁻','⁼','⁽','⁾','Ɓ',
'Ƈ','Ɗ','Ƒ','Ɠ','Ƙ','Ɱ','Ɲ','Ƥ','Ƭ','Ʋ','Ȥ','ɓ','ƈ','ɗ','ƒ','ɠ',
'ɦ','ƙ','ɱ','ɲ','ƥ','ʠ','ɼ','ʂ','ƭ','ʋ','ȥ','Ạ','Ḅ','Ḍ','Ẹ','Ḥ',
'Ị','Ḳ','Ḷ','Ṃ','Ṇ','Ọ','Ṛ','Ṣ','Ṭ','Ụ','Ṿ','Ẉ','Ỵ','Ẓ','Ȧ','Ḃ',
'Ċ','Ḋ','Ė','Ḟ','Ġ','Ḣ','İ','Ŀ','Ṁ','Ṅ','Ȯ','Ṗ','Ṙ','Ṡ','Ṫ','Ẇ',
'Ẋ','Ẏ','Ż','ạ','ḅ','ḍ','ẹ','ḥ','ị','ḳ','ḷ','ṃ','ṇ','ọ','ṛ','ṣ',
'ṭ','ụ','ṿ','ẉ','ỵ','ẓ','ȧ','ḃ','ċ','ḋ','ė','ḟ','ġ','ḣ','ŀ','ṁ',
'ṅ','ȯ','ṗ','ṙ','ṡ','ṫ','ẇ','ẋ','ẏ','ż','«','»','‘','’','“','”'
]
Cell.types.BYTE = function() { this.value = 0; this.type = "BYTE" }
Cell.types.BYTE.MAX = 255;
Cell.types.BYTE.MIN = 0;
Cell.types.BYTE.prototype.increment = function(cell,tkn,prgm) {
  if(this.value >= Cell.types.BYTE.MAX) this.value = Cell.types.BYTE.MIN;
  else ++this.value;
}
Cell.types.BYTE.prototype.decrement = function(cell,tkn,prgm) {
  if(this.value <= Cell.types.BYTE.MIN) this.value = Cell.types.BYTE.MAX;
  else --this.value;
}
Cell.types.BYTE.prototype.is_non_zero = function(cell,tkn,prgm) {
  return this.value !== Cell.types.BYTE.MIN;
}
Cell.types.BYTE.prototype.printify = function(cell,tkn,prgm) {
  // Come back and make this return a string class object in the array.
  return [Cell.characters[this.value]];
}
//-----------------------------------------------------------------------------
function Memory() {
  this.__arrays__ = [[new Cell(0,0)]];
}
Memory.prototype.access = function(pos) {
  if(this.__arrays__[pos.x] === undefined) {
    this.__arrays__[pos.x] = [];
  }
  if(this.__arrays__[pos.x][pos.y] === undefined) {
    this.__arrays__[pos.x][pos.y] = new Cell(pos.x, pos.y);
  }
  return this.__arrays__[pos.x][pos.y];
}

//-----------------------------------------------------------------------------
// The main clas for starting the program.
function Program(code) {
  this.memory = new Memory();
  this.code = code;
  this.pos = { x:0, y: 0 };
  this.token = new Token(0, this.code);
  this.token.tokenize();
  this.outputs = [];
  this.inputs = [];
}
Program.prototype.current_cell = function() {
  return this.memory.access(this.pos)
}
Program.prototype.next_token = function() {
  this.token = this.token.next;
}
Program.prototype.step = function() {
  if(this.token.cmd) {
    this.token.cmd.execute(this.token,this);
    this.next_token();
    return true;
  }
  return false;
}

//-----------------------------------------------------------------------------
// The main function for processing and executing the code.
var braingolfpp = function(code) {
  return new Program(code);
}

//-----------------------------------------------------------------------------
// Sets all of the global variables defined earlier.
braingolfpp.Program = Program;
braingolfpp.Command = Command;
braingolfpp.Memory = Memory;
braingolfpp.Token = Token;
braingolfpp.Cell = Cell;
braingolfpp.Symbols = Symbols;
braingolfpp.version = version;
global.braingolfpp = braingolfpp;

})(this)
