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
    this.start_token = new Token(0, f);
    //this.execute = 
  }
}
Command.execute = function(prgm) {
  // Use start_token and prgm to figure out the command string excution.
}

Command.base = {
  "+": function(tkn,prgm) { prgm.current_cell().increment(tkn,prgm); return new Token(tkn.search_next,tkn.code) },
  "-": function(tkn,prgm) { prgm.current_cell().decrement(tkn,prgm); return new Token(tkn.search_next,tkn.code) }
}

Symbols["+"].unshift(new Command(Command.base["+"]));
Symbols["-"].unshift(new Command(Command.base["-"]));
  
//-----------------------------------------------------------------------------
// The lexical analyzer.
function Token(start, code) {
  // Come back and add look ahead for '=' for assigmnent operator.
  this.search_start = start;
  this.code = code;
  var cmd = "";
  for(var i = start; i < code.length; ++i) {
    cmd += code[i];
    if(Symbols[cmd] !== undefined && Symbols[cmd][0]) {
      // Do the look ahead...
      this.cmd = Symbols[cmd][0];
      break;
    }
  }
  this.search_end = i;
  this.search_next = this.search_end+1;
}

//-----------------------------------------------------------------------------
function Cell(x,y) {
  this.x = x;
  this.y = y;
  this.value = undefined;
}
Cell.types = {}
Cell.prototype.increment = function(tkn,prgm) {
  if(this.value === undefined) this.value = new Cell.types.BYTE();
  this.value.increment(this,tkn,prgm);
  return this;
}
Cell.prototype.decrement = function(tkn,prgm) {
  if(this.value === undefined) this.value = new Cell.types.BYTE();
  this.value.decrement(this,tkn,prgm);
  return this;
}
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
Cell.types.BYTE = function() { this.value = 0; this.type = "BYTE" }
Cell.types.BYTE.MAX = 255;
Cell.types.BYTE.MIN = 0;
Cell.types.BYTE.increment = function(cell,tkn,prgm) {
  if(this.value >= Cell.types.BYTE.MAX) this.value = Cell.types.BYTE.MIN;
  else ++this.value;
}
Cell.types.BYTE.decrement = function(cell,tkn,prgm) {
  if(this.value <= Cell.types.BYTE.MIN) this.value = Cell.types.BYTE.MAX;
  else --this.value;
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
  this.pc = 0;
  this.code = code;
  this.pos = { x:0, y: 0 };
  this.cur_token = new Token(this.pc, this.code);
  this.pre_token = undefined;
}
Program.prototype.current_cell = function() {
  return this.memory.access(this.pos)
}
Program.prototype.next_token = function() {
  this.pre_token = this.cur_token;
  this.pc = this.cur_token.search_next;
  this.cur_token = new Token(this.pc, this.code);
  return this.cur_token;
}

//-----------------------------------------------------------------------------
// The main function for processing and executing the code.
braingolfpp = function(code) {
  return new Program(code);
}

//-----------------------------------------------------------------------------
// Sets all of the global variables defined earlier.
braingolfpp.version = version;
global.braingolfpp = braingolfpp;

})(this)
