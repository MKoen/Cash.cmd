"use strict";

define(["jquery"], function($){

var TerminalInstance = function() {
    var $terminal = $("#terminal");
    var handleCommands = null;
    var currentUser = "";
    var currentMachine = "";
    var previousInput = "";
    var commandNames = [];
    var intro = null;
    var blinkOn = false;
    var allowedToType = true;
    var self = this;
    var keyCodes = {};
    var load = {};
    var keyCodes = {
        backspace : 8,
        tab : 9,
        enter: 13,
        space: 32,
        upArrow: 38
    };
    var load = {
        loadIntro : function() {
            intro = "<span class='intro'>" + currentUser + "@" + currentMachine + ": </span>";
        },

        loadBlinkingIndicator : function(){
            setInterval(function() {
                if (allowedToType) {
                    handleBlinkingIndicator();
                }
            },500);
        },

        loadDynamicWidth : function(){
            load.helpers.setDynamicWidth();
            $(window).resize(load.helpers.setDynamicWidth());
        },

        loadKeyEvents : function(){
            $(document).keydown(function(event) {
                if (allowedToType){
                    handleNonCharactalKeys(event);
                }
            });

            $(document).keypress(function(event) {
                if (allowedToType){
                    handleCharactalKeys(event);
                }
            });
        },

        helpers : {
            setDynamicWidth : function(){
                var $container = $("#container");
                $('#customStyle').html('.input { width: ' + ($container.width() - $(".intro").width()) + "" + '; }' +
                    ' .output { width: ' + $container.width() + ';} ');
            }

        }
    };

    this.setCommandHandler = function(commandHandler) {
        handleCommands = commandHandler;
    };

    this.setCommandNames = function(arrayOfCommandNames){
        commandNames = arrayOfCommandNames;
    };

    this.setUser = function(user) {
        currentUser = user;
    };

    this.setMachine = function(machine) {
        currentMachine = machine;
    };

    this.init = function() {
        load.loadIntro();
        load.loadKeyEvents();
        load.loadDynamicWidth();
        load.loadBlinkingIndicator();
        this.loadNewLine();
    };

    this.writeLine = function(line) {
        takeNewLineIfNeeded();
        this.write(line);
    };

    this.write = function(line) {
        line = (typeof(line) != "string" || line.length == 0) ? " " : line;
        $terminal.append("<span class='output'>" + line + "</span>");
    };

    this.loadNewLine = function() {
        takeNewLineIfNeeded();
        $("#currentInput").removeAttr("id");
        $terminal.append(intro + "<span class='input' id='currentInput'></span>");
        scrollToBottom();
        focusOnCurrentInput();
    };

    function newLine() {
        $terminal.append("<br />");
        scrollToBottom();
    }

    function focusOnCurrentInput() {
        $("#currentInput").focus();
    }

    function takeNewLineIfNeeded(){
        var lastOutput = $(".output").last().text();

        if (lastOutput.length > 0 || $('#currentInput').is(':last-child')){
            newLine();
        }
    }

     function scrollToBottom() {
        var container = $('#terminal')[0];
        var containerHeight = container.clientHeight;
        var contentHeight = container.scrollHeight;

        container.scrollTop = contentHeight - containerHeight;
    }

    function handleBlinkingIndicator() {
        if (blinkOn){
            removeLastCharacterFromCurrentInput()
        }
        else {
            addCharactersToCurrentInput("█");
        }

        blinkOn = !blinkOn;
    }

    function addCharactersToCurrentInput(character){
        var input = getCurrentInput();
        var newInput = input + character;
        $("#currentInput").text(newInput);
    }

    function handleCharactalKeys(event) {
        var keyProperties = getKeyProperties(event);

        if (keyProperties.code == keyCodes.space) {
            keyProperties.char = "\xa0";
        }

        removeBlinkerFromCurrentInput();
        addCharactersToCurrentInput(keyProperties.char);
    }

     function handleNonCharactalKeys(event) {
         removeBlinkerFromCurrentInput();

        var keyProperties = getKeyProperties(event);

        switch (keyProperties.code){
            case keyCodes.backspace:
                event.preventDefault();
                removeLastCharacterFromCurrentInput();
                break;
            case keyCodes.tab:
                event.preventDefault();
                autoCompleteCurrentInput();
                break;
            case keyCodes.enter:
                event.preventDefault();
                handleCurrentInput();
                break;
            case keyCodes.upArrow:
                event.preventDefault();
                showPreviousCommand();
                break;
        }
    }

    function removeLastCharacterFromCurrentInput(){
        var currentInput = $("#currentInput");
        var newInput = currentInput.text().substring(0, currentInput.text().length - 1);

        currentInput.text(newInput);
    }

    function removeBlinkerFromCurrentInput() {
        if (blinkOn) {
            removeLastCharacterFromCurrentInput();
            blinkOn = !blinkOn;
        }
    }

    function autoCompleteCurrentInput(){
        var input = getCurrentInput(true);
        var restOfCommandName = "";

        if (input.length > 0) {
            commandNames.forEach(function(name) {
                if (name.substring(0, input.length) === input) {
                    restOfCommandName = name.substring(input.length, name.length);
                }
            });
        }

        addCharactersToCurrentInput(restOfCommandName);
    }

    function showPreviousCommand(){
        $("#currentInput").text(previousInput);
    }

    function getCurrentInput(trim){
        var currentInput = $("#currentInput");
        return (trim) ? currentInput.text().trim() : currentInput.text();
    }

    function getKeyProperties(event) {
        var code = event.keyCode || event.which;
        var char = String.fromCharCode(code);

        return {
            code : code,
            char : char
        }
    }

    function handleCurrentInput() {
        var input = getCurrentInput(true);
        var inputArray = input.trim().split("\xa0");
        var command = inputArray[0];
        var parameters;

        previousInput = input;
        inputArray.splice(0, 1);
        parameters = inputArray.join("\xa0");
        handleCommands(command, parameters);
        self.loadNewLine();
    }
};

return TerminalInstance;
});