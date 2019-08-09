

var myApp=angular.module('myApp', []);

function ww(msg){
	console.log("MESSAGE: "+msg);
}

myApp.controller('testController', testController);

function testController($scope, bitStorageService,variableConverter,subBitService){

	console.log("names:");
	bitStorageService.setAllBitsStr("01000000000001100001100100010010");

		for(var i =0 ;i<7;i++){
		ww(variableConverter.getVariableName(i)+"="+variableConverter.getStrVariableValue(i));
	}

	ww("BIG ENDIAN");
	variableConverter.setEndian(false);
		for(var i =0 ;i<7;i++){
		ww(variableConverter.getVariableName(i)+"="+variableConverter.getStrVariableValue(i));
	}
	ww("all bits "+bitStorageService.getStrAllBits());
	ww("all bits "+bitStorageService.getStrAllBits());
	variableConverter.commitValue(255,0);
	ww("all bits "+bitStorageService.getStrAllBits());
	variableConverter.commitValue(128+3,0);
	ww("all bits "+bitStorageService.getStrAllBits());
}




myApp.factory("logSerivce",function($timeout,$http){
	
	function sendMsg(msg){
		;
	}
		
	return{ 
		logEvent:function(msg){
			;
		}
	};
});



myApp.factory("bitStorageService",bitStorageService);
/*Always s*/
function bitStorageService(logSerivce){

	//MUST be little endian!
	var mainBitString="0";

	//Observer pattern to update the views..
  	var observerCallbacks = [];



   var notifyObservers = function(){
    angular.forEach(observerCallbacks, function(callback){
      callback(mainBitString);
    });
  };
        //init system
        notifyObservers();

	//Return the object that is the service
	return{
		getStrAllBits:function(){
			return mainBitString;
		},
		setAllBitsStr:function(bits){
			mainBitString=bits;
			ww("ALL BITS: "+bits);
			notifyObservers ();
		},
		  registerBitChangeObserverCallback : function(callback){
		  	ww("callback registered..");
    		observerCallbacks.push(callback);
  		},
  		updateGUI: function(msg){
  			notifyObservers ();
			if(msg!=null)
				logSerivce.logEvent(msg);
  		}
		

	};
}
myApp.factory("pinnedFieldsService",function(variableConverter,messageService){
	var pinns=[];
	var idCounter=1;
        var typeNames=[{"type":0,"name":"uint8"},
        {"type":1,"name":"int8"},
 
        {"type":2,"name":"uint16"},
        {"type":3,"name":"int16"},   
        
        {"type":4,"name":"uint32"},
        {"type":5,"name":"int32"},    

        {"type":6,"name":"float"},    
    ];
        
        function getName(t){
            return typeNames[t].name;
        }
	return{
		addPin:function(type,name){
			var t={"id":idCounter,
			"type":type,
                        "typeName":getName(type),
			"smEndian":variableConverter.getEndian(),
			"offset":variableConverter.getOffset(),
			"name":	name,
			"dispVal":null
		};
			pinns.push(t);
			idCounter+=1;
                        messageService.success("Field \""+name+"\" was pinned");
		},
		removePin:function(pin){
			for(var i = 0;i<pinns.length;i++){
				if(pinns[i].id==pin){
                                        messageService.success("Field \""+pinns[i].name+"\" was removed!");
					pinns.splice(i, 1);
                                        
                                }
				
			}
			
		},
		getPinns:function(){
			ww("get pinns");
			for(var i = 0;i<pinns.length;i++){
				pinns[i].dispVal=variableConverter.getStrVariableValueAt(pinns[i].type,pinns[i].offset,pinns[i].smEndian);
				ww(i+":"+pinns[i].dispVal);
			}
			return pinns;
		}
	};

});

myApp.factory("subBitService",function(bitStorageService){
	var offset=0;
	function preBits(off,len){
		var strLen= bitStorageService.getStrAllBits().length;
		return bitStorageService.getStrAllBits().substring(strLen - off, strLen);
	}

	function postBits(off,len){
		var strLen= bitStorageService.getStrAllBits().length;
		return bitStorageService.getStrAllBits().substring(0, strLen - off - 32);
	}	

	var serviceObjects ={

		getStrSubBits:function(off,len){
			var strLen=bitStorageService.getStrAllBits().length;
			return bitStorageService.getStrAllBits().substring(strLen-off-len,strLen-off);
		},
		commitSubStrBits:function(off,bits,len){
			bitStorageService.setAllBitsStr(postBits(off,len) + bits + preBits(off,len));
		},
		commitDataView:function(dv,off){		
			serviceObjects.commitSubStrBits(off,padBitToLen(decToBin(dv.getUint32(off,true)),32),32);
		},
		getTargetBits:function(){
			var strLen=bitStorageService.getStrAllBits().length;
                        if(!(strLen>0))
                            return "0";
			return bitStorageService.getStrAllBits().substring(strLen-offset-32,strLen-offset);
		},
		setOffset:function(off){offset=off;},
		getPre:function(){return preBits(offset);},
		getPost:function(){return postBits(offset);},
		getOffset:function(){return offset;},


	};
	return serviceObjects;

});


//Service that converts between bit string and variable such as int, float.
myApp.factory("variableConverter",function(subBitService){


	var isLittleEndian=true;
	var names=["uint8","int8","uint16","int16","uint32","int32","float32"];


	function getDV(off) {

	 	var farr = new ArrayBuffer(4);
	 	var dv = new DataView(farr, 0);
	 	var bits=subBitService.getStrSubBits(off,32);
	
		var binDec=parseBinary(bits);
		//Read as little endian..
		for (i = 0; i < 4; i++) {
			dv.setUint8(i, ((binDec >> i * 8) & 0xff),true);
		}
		return dv;

		
	}

	function getVar(type,off,endian){
	        ww("integer get endian "+endian+" type "+type);
			var dv=getDV((off));
			switch(Number(type)){
				//uint8
				case 0:
				return dv.getUint8(0,endian);
				break;
				//int8
				case 1:
				return dv.getInt8(0,endian);
				break;
				//uint16
				case 2:
				return dv.getUint16(0,endian);
				break;
				//int16
				case 3:
				return dv.getInt16(0,endian);
				break;

				//uint32
				case 4:
				return dv.getUint32(0,endian);
				break;

				//int32
				case 5:
				return dv.getInt32(0,endian);
				break;

				//float
				case 6:
				return dv.getFloat32(0,endian);

				break;
				default:
				alert("No such type.. :(");

			}	
	}


           
	return{
		setEndian:function(isLittleEndian_){
			isLittleEndian=isLittleEndian_;
		},
		getEndian:function(){return isLittleEndian;},
		getStrVariableValue: function (type){
			return getVar(type,subBitService.getOffset(),isLittleEndian);
		},

		getStrVariableValueAt: function (type,off,endian) {
			return getVar(type,off,endian);
		},
		getOffset:function(){
			return subBitService.getOffset();
		},
		getVariableName:function(type){
			return names[type];
		},
		commitValue:function(val,type){
			var dv=getDV(subBitService.getOffset());
			switch(Number(type)){
				//uint8
				case 0:
					dv.setUint8(0,val,isLittleEndian);
				break;
				//int8
				case 1:
					dv.setInt8(0,val,isLittleEndian);
				break;
				//uint16
				case 2:
					dv.setUint16(0,val,isLittleEndian);
				break;
				//int16
				case 3:
					dv.setInt16(0,val,isLittleEndian);
				break;

				//uint32
				case 4:
					dv.setUint32(0,val,isLittleEndian);
				break;

				//int32
				case 5:
					dv.setInt32(0,val,isLittleEndian);
				break;

				//float
				case 6:
					dv.setFloat32(0,val,isLittleEndian);

				break;
				default:
				alert("No such type.. :(");

			}	
			subBitService.commitDataView(dv,subBitService.getOffset());			
		}
	};	
});


   //Malte   
              function decToBin(bin) {

              	var bits = Math.floor(Math.log(bin)/Math.log(2)) + 1;
			
			//	ww((Math.floor(Math.log2(bin)) + 1)+"log2 vs stupid IE log2 "+bits);
                  ////console.log(bin + "->bits " + bits);
				  
		//		  if((bits)!==(Math.floor(Math.log2(bin)) + 1))
		//			  alert("LOG FAILURE!!! :/");
				  
                  var str = "";

                  for (var i = 0; i < bits; i++) {
                  	if (bin & Math.pow(2, bits - i - 1)) {
                  		str += "1";
                  	} else {
                  		str += "0";
                  	}
                  }
                  return str;
              }



              //Malte
              function parseBinary(text) {
              	var length = text.length;
              	var dec = 0;

              	for (var i = 0; i < length; i++) {
              		var bin = text[i];
              		var magnitude = +Math.pow(2, length - i - 1);
   
                      if (bin === "1") {
                      	dec = dec + magnitude;
                      }
                  }
                  return dec;
              }




		function padBitToLen(str,len) {
			var loops = len - str.length;
			for (i = 0; i < loops; i++) {
				str = "0" + str;
			}
			return str;
		}


		function binStrToDecStr(binStr){
		var n = bigInt("0");
		var two = bigInt("2");
		for(var i =0;i<binStr.length;i++){
			if(binStr[binStr.length-i-1]=='1'){
				n=n.plus(two.pow(i));
			}
		}
		return(n.toString(10));
}




               //Malte
 function hexStrToBinStr(hexStrIn){

 	var binStrOut="";
 	var hexStr=hexStrIn;
        if(hexStr===null){
            ww("hexStrIn is null");
            return "0";            
        }
        
        
	//console.log("no loop");
	//Loop trough hex digits ie groups of four bits
	for(var i =0;i<hexStr.length;i++){
		var num=Number(hexToDec(hexStr[i]));
		//console.log("LOOP "+i);
		var bin = ""+(decToBin(num));

		
		//Do not pad zeros past the last 1.. :).. TODO!!
		//if(i!=hexStr.length-1)
		bin=padBitToLen(bin,4);


		//console.log(i+" "+(hexStr[i])+": "+num+" "+bin);
		binStrOut+=bin;
	}
	return binStrOut;
}



              //Credit to http://www.danvk.org/hex2dec.html --------------------------------------------------------------

              /**
               * A function for converting hex <-> dec w/o loss of precision.
               *
               * The problem is that parseInt("0x12345...") isn't precise enough to convert
               * 64-bit integers correctly.
               *
               * Internally, this uses arrays to encode decimal digits starting with the least
               * significant:
               * 8 = [8]
               * 16 = [6, 1]
               * 1024 = [4, 2, 0, 1]
               */

              // Adds two arrays for the given base (10 or 16), returning the result.
              // This turns out to be the only "primitive" operation we need.
              function add(x, y, base) {
              	var z = [];
              	var n = Math.max(x.length, y.length);
              	var carry = 0;
              	var i = 0;
              	while (i < n || carry) {
              		var xi = i < x.length ? x[i] : 0;
              		var yi = i < y.length ? y[i] : 0;
              		var zi = carry + xi + yi;
              		z.push(zi % base);
              		carry = Math.floor(zi / base);
              		i++;
              	}
              	return z;
              }

              // Returns a*x, where x is an array of decimal digits and a is an ordinary
              // JavaScript number. base is the number base of the array x.
              function multiplyByNumber(num, x, base) {
              	if (num < 0) return null;
              	if (num == 0) return [];

              	var result = [];
              	var power = x;
              	while (true) {
              		if (num & 1) {
              			result = add(result, power, base);
              		}
              		num = num >> 1;
              		if (num === 0) break;
              		power = add(power, power, base);
              	}

              	return result;
              }

              function parseToDigitsArray(str, base) {
              	var digits = str.split('');
              	var ary = [];
              	for (var i = digits.length - 1; i >= 0; i--) {
              		var n = parseInt(digits[i], base);
              		if (isNaN(n)) return null;
              		ary.push(n);
              	}
              	return ary;
              }

              function convertBase(str, fromBase, toBase) {
              	var digits = parseToDigitsArray(str, fromBase);
              	if (digits === null) return null;

              	var outArray = [];
              	var power = [1];
              	for (var i = 0; i < digits.length; i++) {
                      // invariant: at this point, fromBase^i = power
                      if (digits[i]) {
                      	outArray = add(outArray, multiplyByNumber(digits[i], power, toBase), toBase);
                      }
                      power = multiplyByNumber(fromBase, power, toBase);
                  }

                  var out = '';
                  for (var i = outArray.length - 1; i >= 0; i--) {
                  	out += outArray[i].toString(toBase);
                  }
                  return out;
              }

              function decToHex(decStr) {
              	var hex = convertBase(decStr, 10, 16);
              	return hex ? hex : null;
              }

              function hexToDec(hexStr) {
              	if (hexStr.substring(0, 2) === '0x') hexStr = hexStr.substring(2);
              	hexStr = hexStr.toLowerCase();
              	return convertBase(hexStr, 16, 10);
              }
                 //End of credit to http://www.danvk.org/hex2dec.html



myApp.factory("messageService",function (){
    
 	
  var observerCallbacks = [];



   var notifyObservers = function(type,msg){
    angular.forEach(observerCallbacks, function(callback){
      callback(type,msg);
    });
  };
   
    
    return {
        notify:function (msg){
            notifyObservers(0,msg);
        },
        success:function (msg){
            notifyObservers(1,msg);
        },
        registerForNotifications:function(callback){
            observerCallbacks.push(callback);
        }
        
    };
    
    
    
});


/*
     FILE ARCHIVED ON 04:36:48 Aug 15, 2018 AND RETRIEVED FROM THE
     INTERNET ARCHIVE ON 11:28:13 Aug 09, 2019.
     JAVASCRIPT APPENDED BY WAYBACK MACHINE, COPYRIGHT INTERNET ARCHIVE.

     ALL OTHER CONTENT MAY ALSO BE PROTECTED BY COPYRIGHT (17 U.S.C.
     SECTION 108(a)(3)).
*/
/*
playback timings (ms):
  exclusion.robots: 0.201
  PetaboxLoader3.datanode: 44.134 (4)
  exclusion.robots.policy: 0.188
  captures_list: 88.647
  CDXLines.iter: 14.548 (3)
  esindex: 0.009
  LoadShardBlock: 69.702 (3)
  load_resource: 145.713
  PetaboxLoader3.resolve: 126.454 (2)
  RedisCDXSource: 0.88
*/
