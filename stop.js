/* stopwatch.js Start */
(function(){

    if(!Array.prototype.forEach){
      Array.prototype.forEach = function(callback){
        for(var i=0; i<this.length; i++){
          callback(this[i]);
        }      
      }
    }
  
    if(!Array.prototype.map){
      Array.prototype.map = function(callback){
        var items = [];
        for(var i=0; i<this.length; i++){
          items.push(callback(this[i]));
        }
        return items;
      }
    }
  
    var secondInMilliseconds = 1000;
    var minuteInMilliseconds = 60*secondInMilliseconds;
    var hourInMilliseconds = 60*minuteInMilliseconds;
    var floor = Math.floor;
  
    var extractMilliseconds = function(timeInMilliseconds){
      return timeInMilliseconds % 1000;
    }
    var extractSeconds = function(timeInMilliseconds){
      return floor(timeInMilliseconds/secondInMilliseconds);
    }
    var extractMinutes = function(timeInMilliseconds){
      return floor(timeInMilliseconds/minuteInMilliseconds);
    }
    var extractHours = function(timeInMilliseconds){
      return floor(timeInMilliseconds/hourInMilliseconds);
    }
    var pad = function(number){
      if(number < 10){
        return "0"+number;
      }else{
        return number;
      }
    }
    var extractTime = function(timeInMilliseconds){
      var hours = extractHours(timeInMilliseconds);
      timeInMilliseconds -= hours*hourInMilliseconds;
      var minutes = extractMinutes(timeInMilliseconds);
      timeInMilliseconds -= minutes*minuteInMilliseconds;
      var seconds = extractSeconds(timeInMilliseconds);
      timeInMilliseconds -= seconds*secondInMilliseconds;
      var milliseconds = timeInMilliseconds;
      return {hours: hours, minutes: minutes, seconds: seconds, milliseconds: milliseconds};
    }
  
    // Lap object which gives the time elapsed between two given laps
    var round = function(netTime, previousLap){
      this.previousLap = previousLap;
      this.netTime = netTime;
    };
  
    round.prototype = {
      militaryTime: function(timeInMilliseconds){     
        var timeSeparator = ":";
        var time = extractTime(timeInMilliseconds);
        time.milliseconds = time.milliseconds/10;
        return ['hours', 'minutes', 'seconds', 'milliseconds'].map(function(property){
          return pad(time[property]);
        }).join(timeSeparator);
      },
      splitString: function(){
        if(this.previousround != null){
          var timeDifference = this.netTime - this.previousround.netTime;
          return this.militaryTime(timeDifference);
        }else{
          return this.militaryTime(this.netTime);
        }
      }
    }
  
    var StopWatch = window.StopWatch = function(options){
      if(options == null){
        options = {}
      }
      
      var _this = this;
      var callbackProperties = ['callback', 'callbackTarget', 'roundCallback', 'roundCallbackTarget'];
      var netTime = hours = minutes = seconds = milliseconds = 0;
      var running = false;
      var round = [];
      
      // Initializing callbacks & its targets
      callbackProperties.forEach(function(property){
        if(options[property] != null){
          _this[property] = options[property];
        }
      });
  
      // getter methods
      this.running = function(){
        return running;
      };
      this.hours = function(){
        return hours;
      };
      this.minutes = function(){
        return minutes;
      };
      this.seconds = function(){
        return seconds;
      };
      this.milliseconds = function(){
        return milliseconds;
      };
      this.netTime = function(){
        return netTime;
      };
  
      
      this.militaryTime = function(){
        return [pad(hours), pad(minutes), pad(seconds), pad(milliseconds/10)].join(":");
      };
  
     
      this.callbackArgument = this.militaryTime;
  
     
      var timeDidChange = function(){
        var callback = _this.callback
        if(callback != null){
          var callbackTarget = _this.callbackTarget || window;
          if(typeof callback === 'string'){
            callback = callbackTarget[callback];
          }
          if(typeof callback === 'function'){
            callback.call(callbackTarget, _this.callbackArgument.call(_this));
          }
        }
      };
  
     
      var roundDidChange = function(round, isReset){
        if(_this.roundCallback != null){
          var roundCallbackTarget = _this.roundCallbackTarget || window;
          var roundCallback = _this.lapCallback;
          if(typeof roundCallback === "string"){
            roundCallback = roundCallbackTarget[roundCallback];
          }
          if(typeof roundCallback === 'function'){
            roundCallback.call(roundCallbackTarget, (round && round.splitString()), isReset);
          }
        }
      };
  
      var initializeTimer = function(timeInMilliseconds){
        var time = extractTime(timeInMilliseconds);
        hours = time.hours;
        minutes = time.minutes;
        seconds = time.seconds;
        milliseconds = time.milliseconds;
        netTime = timeInMilliseconds;
        timeDidChange();
        return _this;
      };
  

      var incrementByTenMilliseconds = function(){
        if(milliseconds === 990){
          milliseconds = 0;
          if(seconds === 59){
            seconds = 0;
            if(minutes === 59){
              minutes = 0;
              hours += 1;
            }else{
              minutes += 1;
            }
          }else{
            seconds += 1;
          }
        }else{
          milliseconds += 10;
        }
        netTime += 10;
        timeDidChange();
        return _this;
      };
  
      /*
        Kick starts the stopwatch
      */
      this.start = function(){
        running = true;
        this.interval = setInterval(function(){
          incrementByTenMilliseconds();
        }, 10);
      };
  
      /*
        Halts/Pauses the stopwatch
      */
      this.stop = function(){
        if(this.interval != null){
          clearInterval(this.interval);
        }
        running = false;
      };
  
  
      /*
        Captures a lap
      */
      this.addround = function(){
        var previousround = round[round.length - 1];
        var currentround = new round(netTime, previousround);
        round.push(currentround);
        roundDidChange(currentround, false);
      }
  
      
      this.resetround = function(){
        round = [];
        roundDidChange(null, true)
      }
  
      /*
        resets the stopwatch
      */
      this.reset = function(){
        this.stop();
        this.resetround();
        initializeTimer(0);
      };
  
      /* 
        Initializing netTime if provided via options
      */
      if(options.netTime != null){
        netTime = options.netTime;
        initializeTimer(netTime);
      }
    };
  })()
  /* stowatch.js End */
  
  var watch = document.getElementById("watch-dial");
  var roundContainer = document.getElementById('round');
  var roundCount = 0;
  
  
  window.updateWatch = function(militaryTime){
    watch.innerHTML = militaryTime;
  }
  
  
  window.updateround = function(roundSplitString, isReset){
    if(isReset){
      roundContainer.innerHTML = "";
      roundCount = 0;
    }else{
      var li = document.createElement('li');
      roundCount += 1;
      li.innerHTML = "#"+roundCount+" "+roundSplitString;
      li.className = "tile";
      roundContainer.appendChild(li);
    }
  }
  
  //replace's an element's given class with a specified class
  var replaceClass = function(ele, class1, class2){
    if(ele.className.indexOf(class1) > 1){
      ele.className = ele.className.replace(class1, class2);
    }
  }
  
  var stopwatch = new StopWatch({callback: 'updateWatch', roundCallback: 'updateround'});
  var startStopButton = document.getElementById("start-stop");
  var resetroundButton = document.getElementById("reset-round");
  
  var startStopButtonEvent = function(){
    if(!stopwatch.running()){
      replaceClass(startStopButton, 'start-button', 'stop-button');
      replaceClass(resetroundButton, 'reset-button', 'round-button');
      startStopButton.innerHTML = 'Stop';
      resetroundButton.innerHTML = 'round';
      stopwatch.start();
    }else{
      replaceClass(startStopButton, 'stop-button', 'start-button');
      replaceClass(resetroundButton, 'round-button', 'reset-button');
      startStopButton.innerHTML = 'Start';
      resetroundButton.innerHTML = 'Reset';
      stopwatch.stop();
    }
  }
  
  var resetroundButtonEvent = function(){
    if(!stopwatch.running()){
      stopwatch.reset();
    }else{
      stopwatch.addround();
    }
  }
  
  //Adding event listeners to the buttons
  if(!document.addEventListener){
    startStopButton.attachEvent("onclick", startStopButtonEvent); 
    resetroundButton.attachEvent("onclick", resetroundButtonEvent); 
  }else{
    startStopButton.addEventListener("click", startStopButtonEvent);
    resetroundButton.addEventListener('click', resetroundButtonEvent);
  }