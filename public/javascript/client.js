var context;
const SERVERHOST = "localhost";
const SERVERPORT = "8080";

var globalMap = {};
var map = {};
var currPath = window.location.pathname;
var totalClickX = new Array();
var totalClickY = new Array();
var totalClickDrag = new Array();

var currClickX, currClickY, currClickDrag;
clearMap();

var paint;


window.onload = function() {
    context = document.getElementById('canvas').getContext("2d");
    context.fillStyle = 'rgba(0,0,0,0.5)';
    context.fillRect(0,0,window.innerWidth,window.innerHeight);
    $('#canvas').mousedown(function(e){
       paint = true;
        addClick(e.clientX - this.offsetLeft, e.clientY - this.offsetTop);
        redraw();
    });
    $('#canvas').mousemove(function(e){
        if(paint){
          addClick(e.clientX - this.offsetLeft, e.clientY - this.offsetTop, true);
          redraw();
        }
    });
    $('#canvas').mouseup(function(e){
        paint = false;
        sendajax(map);
        clearMap();

    });
    $('#canvas').mouseleave(function(e){
        if (paint) {
            sendajax(map);
            clearMap();
        }
        paint = false;
    });
};

function clearMap() {
    currClickX = new Array();
    currClickY = new Array();
    currClickDrag = new Array();
    map['x'] = currClickX;
    map['y'] = currClickY;
    map['drag'] = currClickDrag;
}

function addClick(x, y, dragging) {
  totalClickX.push(x);
  totalClickY.push(y);
  totalClickDrag.push(dragging);

  currClickX.push(x);
  currClickY.push(y);
  currClickDrag.push(dragging);
}

function redraw(){
  context.clearRect(0, 0, context.canvas.width, context.canvas.height); // Clears the canvas
  context.fillStyle = 'rgba(0,0,0,0.5)';
  context.fillRect(0,0,window.innerWidth,window.innerHeight);
  context.strokeStyle = "#df4b26";
  context.lineJoin = "round";
  context.lineWidth = 3;
			
  for(var i=0; i < totalClickX.length; i++) {		
    context.beginPath();
    if(totalClickDrag[i] && i){
        context.moveTo(totalClickX[i-1], totalClickY[i-1]);
    }else{
        context.moveTo(totalClickX[i]-1, totalClickY[i]);
    }
    context.lineTo(totalClickX[i], totalClickY[i]);
    context.closePath();
    context.stroke();
  }
}

function addShapes(xCoordinates, yCoordinates, dragFlags){
    for(var j=0; j<xCoordinates.length; j++){
        totalClickX.push(xCoordinates[j]);
        totalClickY.push(yCoordinates[j]);
        totalClickDrag.push(dragFlags[j]);
    }
    redraw();
}

function sendajax(params) {
    var jsonFlat = JSON.stringify(params);
    $.ajax ({
        url: currPath,
        type: "POST",
        data: {'coordinates' : jsonFlat},
        datatype: JSON,
        success: function(result) {
            console.log(result);
        },
        error: function(error) {
            console.log(`Error ${error}`);
        }
    });
}

$(function () {
    // if user is running mozilla then use it's built-in WebSocket
    window.WebSocket = window.WebSocket || window.MozWebSocket;
    var connection = new WebSocket("ws://" + SERVERHOST + ":" + SERVERPORT);
    connection.onopen = function(message){
        var msg = currPath;
        connection.send(currPath);
    };
    connection.onmessage = function (message) {
      try {
        var json = JSON.parse(message.data);
        addShapes(json.x, json.y, json.drag);
      } catch (e) {
        console.log(message.data);
        return;
      }
    };
  });

