function GameMachine() {
  this.poweredOn = false;
  this.strictMode = false;
  this.started = false;
  this.humanTurn = false;
  this.gameButtonClicks = 0;
  this.pattern = [];
  this.humanResponse = [];
  this.counter;
  this.inputCheckIntervalID = undefined;
  this.gameTimeoutID = undefined;
  this.gameTimeoutTwoID = undefined;
  this.computerPlayIDArray = [];
  
  this.sounds = {
    'GREEN': new Audio('https://s3.amazonaws.com/freecodecamp/simonSound1.mp3'),
    'RED': new Audio('https://s3.amazonaws.com/freecodecamp/simonSound2.mp3'),
    'BLUE': new Audio('https://s3.amazonaws.com/freecodecamp/simonSound3.mp3'),
    'YELLOW': new Audio('https://s3.amazonaws.com/freecodecamp/simonSound4.mp3')
  };
  
  
  this.showPositiveOutcome = function() {
    var $lcd = $('.lcd');
    $lcd.hide();
    $lcd.html(':)');
    $lcd.fadeIn();
  };
  
  this.showNegativeOutcome = function() {
    var $lcd = $('.lcd');
    $lcd.hide();
    $lcd.html(':(');
    $lcd.fadeIn();
  };
  
  this.getPowerState = function() {
    return this.poweredOn;
  };
  
  this.getStrictState = function() {
    return this.strictMode;
  };
  
  this.togglePower = function() {
    if ( this.poweredOn ) {
      this.poweredOn = false;
      this.started = false;
    } else {
      this.poweredOn = true;
    }
    $('.power-button').toggleClass('ctrl-button-active');
  };
  
  this.start = function() {
    if ( this.started === false ) {
      this.started = true;
    }
    $('.label-button:nth-child(2)').toggleClass('ctrl-label-active');
    setTimeout(function() {
      $('.label-button:nth-child(2)').toggleClass('ctrl-label-active');
    }, 500);
    this.showPositiveOutcome();
    this.initialiseGame();
    this.playGame();
  };
  
  this.initialiseCounter = function() {
    this.counter = 1;
  };
  
  this.incrementCounter = function() {
    this.counter++;
  };
  
  this.toggleStrictMode = function() {
    if ( !this.poweredOn ) {
      return;
    }
    $('.label-button:nth-child(3)').toggleClass('ctrl-label-active');
    $('.lcd').toggleClass('lcd-strict');
    if ( this.strictMode ) {
      this.strictMode = false;
    } else {
      this.strictMode = true;
    }
  };
  
  this.clearCtrlIndicators = function() {
    $('.label-button').removeClass('ctrl-label-active');
  };
  
  this.toggleTurn = function() {
    if ( this.humanTurn ) {
      this.humanTurn = false;
    } else {
      this.humanTurn = true;
    }
  }; 
  
  this.createNewPattern = function() {
    
    var colors = ['RED', 'BLUE', 'YELLOW', 'GREEN'];
    var array = [];
    var colorIndex;
    
    for ( var i = 0; i < 20; i++ ) {
      colorIndex = Math.floor(Math.random()*4);
      array.push(colors[colorIndex]);
    }
    return array;
  };
  
  this.animateButton = function(color) {
    switch (color) {
      case 'RED':
        $('.button-red').toggleClass('button-lit', 100).toggleClass('button-lit', 150);
        this.sounds['RED'].play();
        this.sounds['RED'].currentTime = 0;
        break;
      case 'BLUE':
        $('.button-blue').toggleClass('button-lit', 100).toggleClass('button-lit', 150);
        this.sounds['BLUE'].play();
        this.sounds['BLUE'].currentTime = 0;
        break;
      case 'YELLOW':
        $('.button-yellow').toggleClass('button-lit', 100).toggleClass('button-lit', 150);
        this.sounds['YELLOW'].play();
        this.sounds['YELLOW'].currentTime = 0;
        break;
      case 'GREEN':
        $('.button-green').toggleClass('button-lit', 100).toggleClass('button-lit', 150);
        this.sounds['GREEN'].play();
        this.sounds['GREEN'].currentTime = 0;
        break;
    }
  };
  
  this.clearComputerPlayIDArray = function() {
    for (var i = 0; i < this.computerPlayIDArray.length; i++ ) {
      clearInterval(this.computerPlayIDArray[i]);
    }
  };
  
  this.playPattern = function(delay) {
    
    var game = this;
    for ( var i = 0; i < this.counter; i++ ) {
      // create a closure so that timeout will be properly created for each 'i'
      (function(i) {
        var timeout = setTimeout(function() {
          game.animateButton(game.pattern[i]);
        }, delay * i);
        // store timeout ID in array
        game.computerPlayIDArray.push(timeout);
      })(i);
    }
  };
  
  this.setDelay = function() {
    
    function getDelay(counter) {
      var delay;
      if ( counter > 12 ) {
        delay = 450;
      } else if ( counter > 8 ) {
        delay = 600;
      } else if ( counter > 4 ) {
        delay = 850;
      } else {
        delay = 1000;
      }
      return delay;
    }
    
    return getDelay(this.counter);
  };
  
  this.registerGameButtonClick = function() {
    this.gameButtonClicks++;
  };
  
  this.resetGameButtonClicks = function() {
    this.gameButtonClicks = 0;
  };
  
  this.resetHumanResponse = function() {
    this.humanResponse = [];
  };
  
  this.updateTurnNumberDisplay = function() {
    // format the digits so that there is a leading zero
    if ( this.counter < 10 ) {
      $('.lcd').html('0' + this.counter);
    } else {
      $('.lcd').html(this.counter);
    }
  };
  
  this.waitForInput = function(numClicksAllowed) {
    
    this.resetGameButtonClicks();
    this.resetHumanResponse();
    var game = this;
    this.inputCheckIntervalID = setInterval(function() {
      if ( game.gameButtonClicks >= numClicksAllowed ) {
        // evaluate whether it is the correct pattern.
        var result = game.evaluateHumanResponse();
        if ( result === true ) {
          game.showPositiveOutcome();
          game.incrementCounter();
          // if user has won...
          if ( game.counter > 20 ) {
            $('.lcd').hide();
            $('.lcd').html('!!');
            $('.lcd').fadeIn();
            alert('Congratulations, you won!');
            clearTimeout(game.gameTimeoutID);
            clearTimeout(game.gameTimeoutTwoID);
            clearInterval(game.inputCheckIntervalID);
            game.clearComputerPlayIDArray();
            game.resetGameButtonClicks();
            game.humanTurn = false;
            game.start();
          }
        } else {
          game.showNegativeOutcome();
          if ( game.strictMode ) {
            game.initialiseGame();
          }
        }
        game.toggleTurn();
        clearTimeout(game.gameTimeoutID);
        clearTimeout(game.gameTimeoutTwoID);
        $('.game-button').addClass('game-button-disabled');
        game.playGame();
        clearInterval(game.inputCheckIntervalID);
      }
    }, 100);
  };
  
  this.evaluateHumanResponse = function() {
    for ( var i = 0; i < this.counter; i++ ) {
      if ( this.humanResponse[i] !== this.pattern[i] ) {  
        // response is incorrect
        return false;
      }
    }
    // response is correct
    return true;
  };
  
  this.initialiseGame = function() {
    this.pattern = this.createNewPattern();
    this.initialiseCounter();
  };
  
  this.playGame = function() {
    
    var game = this;
    this.gameTimeoutID = setTimeout(function() {
      var delay;
      delay = game.setDelay();
      $('.lcd').hide();
      game.updateTurnNumberDisplay();
      $('.lcd').fadeIn();
      game.playPattern(delay);
      game.resetGameButtonClicks();
      game.toggleTurn();
      game.gameTimeoutTwoID = setTimeout(function() {
        $('.game-button').removeClass('game-button-disabled');
        game.waitForInput(game.counter);
      }, delay * game.counter);
    }, 2000);
  };
};

$(document).ready(function() {  
    
  function turnOnBoard(game) {
    $('.lcd').html('--');
    $('.label-button:nth-child(1)').addClass('ctrl-label-active');
  };
  
  function turnOffBoard(game) {
    clearTimeout(game.gameTimeoutID);
    clearTimeout(game.gameTimeoutTwoID);
    clearInterval(game.inputCheckIntervalID);
    game.clearComputerPlayIDArray();
    game.resetGameButtonClicks();
    $('.ctrl-button').removeClass('button-lit');
    // turn off lcd and all other indicators
    game.strictMode = false;
    $('.game-button').removeClass('game-button-disabled');
    $('.lcd').removeClass('lcd-strict');
    $('.lcd').html('');
    game.clearCtrlIndicators();
  };
  
  var simonGame = new GameMachine();
  
  $('.power-button').on('click', function() {
    simonGame.togglePower();
    if ( simonGame.poweredOn ) {
      turnOnBoard(simonGame);
    } else {
      turnOffBoard(simonGame);
    }
    $('.power-button').toggleClass('ctrl-button-translated');
    setTimeout(function() {
      $('.power-button').toggleClass('ctrl-button-translated');
    }, 100);
  });
  
  $('.start-button').on('click', function() {
    if ( simonGame.poweredOn ) {
      clearTimeout(simonGame.gameTimeoutID);
      clearTimeout(simonGame.gameTimeoutTwoID);
      clearInterval(simonGame.inputCheckIntervalID);
      simonGame.clearComputerPlayIDArray();
      simonGame.resetGameButtonClicks();
      simonGame.humanTurn = false;
      simonGame.start();
    }
    $('.start-button').toggleClass('ctrl-button-translated');
    setTimeout(function() {
       $('.start-button').toggleClass('ctrl-button-translated');
    }, 100);
  });
  
  $('.strict-mode-button').on('click', function() {
    simonGame.toggleStrictMode();
    $('.strict-mode-button').toggleClass('ctrl-button-translated');
    setTimeout(function() {
       $('.strict-mode-button').toggleClass('ctrl-button-translated');
    }, 100);
  });

  $('.game-button').on('click', function() {
    if ( simonGame.poweredOn && simonGame.started && simonGame.humanTurn && !($('.game-button').hasClass('game-button-disabled')) ) {
      simonGame.registerGameButtonClick();
      var thisButton = $(this);
      var color;
      if ( thisButton.hasClass('button-green') ) {
        color = 'GREEN';
      } else if ( thisButton.hasClass('button-blue') ) {
        color = 'BLUE';
      } else if ( thisButton.hasClass('button-red') ) {
        color = 'RED';
      } else if ( thisButton.hasClass('button-yellow') ) {
        color = 'YELLOW';
      }
      simonGame.humanResponse.push(color);
      simonGame.animateButton(color);
    } 
  }); 
});
