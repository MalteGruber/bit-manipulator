
myApp.controller("intFieldController", function ($scope, variableConverter, bitStorageService) {

    $scope.intInput = [0, 0, 0, 0, 0, 0];
    //Checks if integers should be updated or if user is adding minus sign
    function integerShouldUpdate(str) {

        console.log("upd" + str);
        if (str === "")
            return false;
        if (str === "-")
            return false;
        if (str === null)
            return false;
        if (str === undefined)
            return false;
        return true;
    }



    function callback(bits) {
        ww("intbits: " + bits);
    }



    /*This is called when a bit has changed and the views should be udpated..*/
    var updateFoo = function (bits) {

        for (var i = 0; i < 6; i++) {
            $scope.intInput[i] = variableConverter.getStrVariableValue(i);
        }
    };
    bitStorageService.registerBitChangeObserverCallback(updateFoo);
    /*...................*/



    $scope.intInputChanged = function (type) {

        if (integerShouldUpdate($scope.intInput[Number(type)])) {
            variableConverter.commitValue($scope.intInput[Number(type)], type);
			 bitStorageService.updateGUI("i");
        }
    }





});


myApp.controller("endianSelectController", function ($scope, variableConverter, bitStorageService) {
    $scope.isLittleEndian = 1;
    $scope.endiannessChanged = function () {
        variableConverter.setEndian($scope.isLittleEndian === "1");
        ww("endian button "+($scope.isLittleEndian === "1"));
        bitStorageService.updateGUI("E");
    }
});

myApp.controller("floatSelecController", function ($scope, variableConverter, bitStorageService) {

    $scope.commitFloatChange = function () {
        variableConverter.commitValue($scope.floatInput, 6);
        $scope.floatButtonDisable = true;
        bitStorageService.updateGUI("F");
        ww("commt flt");
    }
    $scope.floatButtonDisable = false;
    /*This is called when a bit has changed and the views should be udpated..*/
    var updateFoo = function (bits) {
        $scope.floatInput = variableConverter.getStrVariableValue(6);
        $scope.floatButtonDisable = false;

    };

    bitStorageService.registerBitChangeObserverCallback(updateFoo);
    /*...................*/


});


myApp.controller("binInputController", function ($scope, bitStorageService, messageService) {
    $scope.binInput="0";
    $scope.binInputChanged = function () {

        ww("changed");
        if ($scope.binInput.match(/[^0-1\-_]/)) {
            messageService.notify("A binary number must only contain \"0\":s and \"1\":s!");
            bitStorageService.updateGUI("b");
        }


        bitStorageService.setAllBitsStr($scope.binInput);
        bitStorageService.updateGUI();
    }
    /*This is called when a bit has changed and the views should be udpated..*/
    var updateFoo = function (bits) {
        if(bits==="0"){
            $scope.binInput="0";
             return;
            }
        var skipZeros=0;
        
        for(var i=0;i<bits.length;i++){
            if(bits[i]!=="0")
                break;
            skipZeros++;
        }
        
        $scope.binInput = bits.substring(skipZeros,bits.length);
    };

    bitStorageService.registerBitChangeObserverCallback(updateFoo);
    /*...................*/

});


myApp.controller("decInputController", function ($scope, bitStorageService, messageService) {
    $scope.decInput = 0;
    $scope.decInputChanged = function () {

        if ($scope.decInput.match(/[^0-9\-_]/)) {

            messageService.notify("A decimal number can only contain numbers 0-9 .. :)");
            bitStorageService.updateGUI("d");
        }

        var hex = decToHex("" + $scope.decInput);
        //Intermidiet step and Final step
        bitStorageService.setAllBitsStr(hexStrToBinStr(hex));
        bitStorageService.updateGUI();
    }
    /*This is called when a bit has changed and the views should be udpated..*/
    var updateFoo = function (bits) {
        $scope.decInput = binStrToDecStr(bits);
    };

    bitStorageService.registerBitChangeObserverCallback(updateFoo);
    /*...................*/

});

myApp.controller("hexInputController", function ($scope, bitStorageService, messageService) {

    $scope.hexInput = "0"
    $scope.hexInputChanged = function () {
        if ($scope.hexInput.match(/[^0-9A-Fa-f\-_]/)) {

            messageService.notify("A hexadecimal number can only contain numbers 0-9, A-F | a-f.. :)");
            bitStorageService.updateGUI("h");
        }

        bitStorageService.setAllBitsStr(hexStrToBinStr($scope.hexInput));
        bitStorageService.updateGUI();
    }

    /*This is called when a bit has changed and the views should be udpated..*/
    var updateFoo = function (bits) {
        //TODO can be better? :)
        $scope.hexInput = decToHex(binStrToDecStr(bits));
        if ($scope.hexInput === null)
            $scope.hexInput = "0";
    };

    bitStorageService.registerBitChangeObserverCallback(updateFoo);
    /*...................*/

});
/*
 myApp.controller("base64InputController", function ($scope, bitStorageService, messageService) {
 
 
 
 function bitStrToBase64Str( bits ) {
 
 var len=bits.length;
 var out='';
 var subbits="0";
 for(var i=0;i<len/8;i++){
 
 subbits=(bits.substring(len-i*8-8,len-i*8));
 
 ww(i+": >"+subbits+"< -> "+binStrToDecStr(subbits));
 out+=String.fromCharCode(Number(binStrToDecStr(subbits)));
 }
 
 return btoa(out);
 }
 
 
 function getBitsStrFromBase64(base64){
 ww(">"+base64+"<");
 var decodedAsii=window.atob(base64);
 var outBitStr="0";
 for(var i=0;i<decodedAsii.length-1;i++){
 outBitStr=padBitToLen(decToBin(""+decodedAsii.charCodeAt(i)),8)+outBitStr;
 }
 //Final 0->8 possible bits without padding.. 
 outBitStr=(decToBin(""+decodedAsii.charCodeAt(i)))+outBitStr;
 alert(outBitStr);
 return outBitStr;
 }
 $scope.inputChanged = function () {
 ww("BASE64"+btoa($scope.input));
 bitStorageService.setAllBitsStr(getBitsStrFromBase64($scope.input));
 bitStorageService.updateGUI();
 }
 
 This is called when a bit has changed and the views should be udpated..
 var updateFoo = function (bits) {
 $scope.input=bitStrToBase64Str(bits);
 };
 
 bitStorageService.registerBitChangeObserverCallback(updateFoo);
 
 
 });
 
 myApp.controller("asciiInputController", function ($scope, bitStorageService, messageService) {
 
 
 $scope.inputChanged = function () {
 alert($scope.input);
 bitStorageService.updateGUI();
 }
 
 var updateFoo = function (bits) {
 };
 
 bitStorageService.registerBitChangeObserverCallback(updateFoo);
 
 });
 */

myApp.controller("bitInfoController", function ($scope, bitStorageService, subBitService) {
$scope.targetBitsDisp ="0";
    function groupBitsByBytes(bits) {
        var str = "";
        for (var i = 0; i < bits.length; i++) {
            if ((i % 8) === 0) {
                str += " ";
            }
            str += bits[i];
        }
        return str;

    }

    /*This is called when a bit has changed and the views should be udpated..*/
    var updateFoo = function (bits) {
        var pre = subBitService.getPre();
        var post = subBitService.getPost();
        var paddingBits = 5;
        //We do not want the target bit indicator to go off screen: 
        if (pre.length > paddingBits) {
            pre = pre.substring(0, paddingBits) + "...(" + (pre.length - paddingBits) + ")";
        }
        if (post.length > paddingBits) {
            post = "(" + (post.length - paddingBits) + ")..." + post.substring(post.length - paddingBits, post.length);
        }
        var targetBits = (subBitService.getTargetBits());

        if(targetBits===null){
            targetBits="0";
        }
        
        
        var prePad = "";
        var postPad = "";
        while (pre.length + prePad.length < post.length) {
            prePad += "X";
        }
        while (post.length + postPad.length < pre.length) {
            postPad += "Y";
        }
        $scope.postPadding = postPad;
        $scope.prePadding = prePad;
        $scope.preBitDisp = pre;
        $scope.targetBitsDisp = " " + targetBits + " ";
        $scope.postBitDisp = post;

    };

    bitStorageService.registerBitChangeObserverCallback(updateFoo);
    /*...................*/

});


myApp.controller("bitOffsetController", function ($scope, bitStorageService, subBitService) {

    $scope.offsetInput = 0;
    $scope.offsetChange = function () {
        var offset = $scope.offsetInput;
        if (offset < 0)
            offset = 0;
        $scope.offsetInput = offset;
        subBitService.setOffset(offset);
        bitStorageService.updateGUI("o");
    }
});



myApp.controller("pinnedFieldsController", function ($scope, bitStorageService, pinnedFieldsService) {

    $scope.pinsForDisp;

    $scope.removePin = function (id) {
        pinnedFieldsService.removePin(id);
    };
    /*This is called when a bit has changed and the views should be udpated..*/
    var updateFoo = function (bits) {
        ww("update");
        $scope.pinsForDisp = pinnedFieldsService.getPinns();
    };

    bitStorageService.registerBitChangeObserverCallback(updateFoo);
    /*...................*/
});


myApp.controller("pinController", function ($scope, bitStorageService, pinnedFieldsService) {
    $scope.pinsForDisp = [{"type": 0, "name": "uint8"},
        {"type": 1, "name": "int8"},

        {"type": 2, "name": "uint16"},
        {"type": 3, "name": "int16"},

        {"type": 4, "name": "uint32"},
        {"type": 5, "name": "int32"},

        {"type": 6, "name": "float"},
    ];



    $scope.addPin = function (type) {
        ww("save " + name);
        pinnedFieldsService.addPin(type, prompt("Name of field?", "no name"));
        bitStorageService.updateGUI("P");

    };
});


/*
 myApp.controller("addPinController", function ($scope, bitStorageService, pinnedFieldsService) {
 
 $scope.addPin = function (type) {
 ww("add " + type);
 //var pin={"id":42,"type":5,"smEndian":true,"offset":,"name":prompt("Name of field?","no name"),"dispVal":null};
 pinnedFieldsService.addPin(type, prompt("Name of field?", "no name"));
 bitStorageService.updateGUI();
 
 };
 });
 */




myApp.controller("byteInfoTableController", function ($scope, bitStorageService, variableConverter) {

    $scope.binStr = [];
    $scope.hexStr = [];
    $scope.decStr = [];
    $scope.isLittleEndian = true;

    //Adds a 0x0 to strings so that output is of format 0xNN
    function decToHex0x02Padded(val) {
        val = val + "";


        if (val.length == 0 | val == "0") {
            val = "0x00";
        } else if (val.length == 1) {
            val = "0x0" + decToHex(val);
        } else {
            val = "0x" + decToHex(val);
        }
        return val;
    }
    /*This is called when a bit has changed and the views should be udpated..*/
    var updateFoo = function (bits) {
        $scope.isLittleEndian = variableConverter.getEndian();
        var offset = variableConverter.getOffset();

        for (var i = 0; i < 4; i++) {
            //Get uint8 or one byte at the time..
            var val = variableConverter.getStrVariableValueAt(0, offset + (24 - 8 * i), true);
            $scope.binStr[i] = padBitToLen(decToBin(val), 8);
            $scope.hexStr[i] = decToHex0x02Padded(val);
            $scope.decStr[i] = val;
        }

    };

    bitStorageService.registerBitChangeObserverCallback(updateFoo);
    /*...................*/
});

myApp.controller("notificationController", function ($scope, messageService, $timeout) {
    $scope.fadeOutGoDanger = false;
    $scope.fadeOutGoSuccess = false;


    var alertTimer;
    var successTimer;
    var alert = function (type, msg) {


        if (type == 0) {
            $scope.msgAlert = msg;
            $timeout.cancel(alertTimer);
            $scope.visibleSuccess = false;
            $scope.visibleDanger = true;
            alertTimer = $timeout(function () {
                $scope.fadeOutGoDanger = true;
                $timeout(function () {
                    $scope.fadeOutGoDanger = false;
                    $scope.visibleDanger = false;
                }, 1888);
            }, 1888);
        }
        if (type == 1) {
            $scope.fadeOutGoSuccess = false;
            $scope.msgSuccess = msg;
            $timeout.cancel(successTimer);
            $scope.visibleSuccess = true;
            $scope.visibleDanger = false;
            successTimer = $timeout(function () {
                $scope.fadeOutGoSuccess = true;
                $timeout(function () {
                    $scope.fadeOutSuccess = false;
                    $scope.visibleSuccess = false;
                    ww("succes timeout so to say.. :)");
                }, 1888);
            }, 1888);
        }

    }
    $scope.msg = "Hide Me on start?";

    messageService.registerForNotifications(alert);



});

/*
     FILE ARCHIVED ON 06:01:25 Aug 15, 2018 AND RETRIEVED FROM THE
     INTERNET ARCHIVE ON 11:28:13 Aug 09, 2019.
     JAVASCRIPT APPENDED BY WAYBACK MACHINE, COPYRIGHT INTERNET ARCHIVE.

     ALL OTHER CONTENT MAY ALSO BE PROTECTED BY COPYRIGHT (17 U.S.C.
     SECTION 108(a)(3)).
*/
/*
playback timings (ms):
  PetaboxLoader3.resolve: 59.268
  load_resource: 96.207
  exclusion.robots.policy: 0.165
  RedisCDXSource: 0.622
  esindex: 0.009
  LoadShardBlock: 77.743 (3)
  PetaboxLoader3.datanode: 88.795 (4)
  captures_list: 95.119
  exclusion.robots: 0.176
  CDXLines.iter: 13.343 (3)
*/
