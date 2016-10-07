"use strict";

define(["jquery"], function($){

function Game() {
    this.version = "v0.0.4";
    var player = null;
    var terminal = null;
    var commands = {};
    var self = this;

    this.setTerminal = function(terminalInstance){
        terminal = terminalInstance;
    };

    this.setPlayer = function(currentPlayer){
        player = currentPlayer;
    };

    this.init = function () {
        terminal.setCommandHandler(handleCommand);
        terminal.setCommandNames(Object.keys(commands));
        loadTopBar();
        setInterval(runScripts, 1000);
    };

    function handleCommand(command, parameters) {
        var trimmedCommand = command.trim();
        if (typeof(commands[trimmedCommand]) != "undefined") {
            commands[trimmedCommand].execute(parameters);
        }
        else {
            alertThatCommandIsNotFound(trimmedCommand);
        }
        player.saveGame();
    }

    function loadTopBar() {
        $("#topBar").html(getHtmlForMoneyInTopBar() + getHtmlForScriptsInTopBar());
    }

    function getHtmlForMoneyInTopBar() {
        return "<span id='money'><b>" + player.getName() + "</b>: "+ formatMoney(player.getMoney()) +"</span>";
    }

    function getHtmlForScriptsInTopBar() {
        var scripts = player.getScripts();
        var atLeastOneScript = false;
        var htmlForScriptsInTopBar = "<span id='runningScripts'>| Running scripts: ";

        for (var object in scripts) {
            if(!scripts.hasOwnProperty(object)) continue;
            var script = scripts[object];

            if (script.amount > 0) {
                if (atLeastOneScript) {
                    htmlForScriptsInTopBar += ", ";
                }
                htmlForScriptsInTopBar += script.name + ": " + script.amount;
                atLeastOneScript = true;
            }
        }

        if (!atLeastOneScript) {
            htmlForScriptsInTopBar += " -"
        }

        htmlForScriptsInTopBar += "</span>";

        return htmlForScriptsInTopBar;
    }

    function formatMoney(money){
        var formattedMoney;
        var amountOfNumberBeforeDecimal = (money.toString().split(".")[0].length);

        switch (true){
            case (numberIsBetween(amountOfNumberBeforeDecimal, 0, 3)):
                formattedMoney = "$" + formatMaxOneDecimals(money);
                break;
            case (numberIsBetween(amountOfNumberBeforeDecimal, 4, 6)):
                formattedMoney = "$" + formatMaxOneDecimals(money/1000) + "K";
                break;
            case (numberIsBetween(amountOfNumberBeforeDecimal, 7, 9)):
                formattedMoney = "$" + formatMaxOneDecimals(money/1000) + "M";
                break;
            case (numberIsBetween(amountOfNumberBeforeDecimal, 10, 12)):
                formattedMoney = "$" + formatMaxOneDecimals(money/1000000) + "B";
                break;

            default:
                formattedMoney = "$∞";
                break;
        }
        return formattedMoney;
    }

    function numberIsBetween(number, min, max){
        return (min <= number && number <= max);
    }

    function formatMaxOneDecimals(number){
        return (Math.round(number * 10) / 10)
    }

    function runScripts(){
        var scripts = player.getScripts();
        for (var object in scripts) {
            if(!scripts.hasOwnProperty(object)) continue;
            var script = scripts[object];

            player.addMoney((script.executesPerSecond * script.amount) * player.getSalary());
        }

        loadTopBar();
        player.saveGame();
    }

    function alertThatCommandIsNotFound(command){
        terminal.writeLine("Command \"" + command + "\" not found");
    }

    function showHelpOfCommand(command){
        terminal.writeLine(command.name + ": " + command.info);
        terminal.writeLine("Example(s): " + command.examples);
        terminal.writeLine();
    }

    commands = {
        help : {
            execute : function (parameters){
                if (parameters.length == 0) {
                    terminal.writeLine("You can press tab to autocomplete a command.");
                    terminal.writeLine("You can press up arrow to show your previous input.");
                    terminal.writeLine();
                    terminal.writeLine("Available commands:");
                    terminal.writeLine();
                    for (var object in commands) {
                        if(!commands.hasOwnProperty(object)) continue;
                        var command = commands[object];
                        showHelpOfCommand(command);
                    }
                }
                else {
                    if (typeof(commands[parameters]) == "object"){
                        showHelpOfCommand(commands[parameters]);
                    }
                    else {
                        terminal.writeLine("No help for \"" + parameters + "\" found");
                    }
                }
            },
            name: "help",
            info: "To view info about all available commands.",
            examples: "\"help\", \"help echo\""
        },
        echo : {
            execute : function (parameters) {
                terminal.writeLine(parameters);
            },
            name: "echo",
            info : "To echo given parameters",
            examples: "\"echo This is a phrase\", \"echo test\""
        },
        clear: {
            execute : function(){
                $(".input, .output, .intro, br").remove();
            },
            name: "clear",
            info: "To clear the whole console",
            examples: "\clear\""
        },
        version: {
            execute : function(){
                terminal.writeLine(self.version);
            },
            name: "version",
            info: "To view the current version",
            examples: "\"version\""
        },
        credits : {
            execute : function() {
                terminal.writeLine("Hello there! Thank you for playing my game!");
                terminal.writeLine("This was created solely by me.");
                terminal.writeLine("Kind regards, Koen.");
                terminal.writeLine("For those interested, I'm using jQuery & RequireJS for this.");
            },
            name: "credits",
            info: "To view the credits",
            examples: "\"credits\""
        },
        work : {
            execute : function() {
                player.giveSalary();
                loadTopBar();
                terminal.writeLine("Thank you for working! Here's your salary. (Currently $" + player.getSalary()+")");
            },
            name: "work",
            info: "To do the point of your job.",
            examples: "\"work\""
        },
        scripts : {
            execute: function(parameters){
                var parameterArr = parameters.split("\xa0");
                var firstParameter = parameterArr[0];
                var secondParameter = parameterArr[1];
                var thirdParameter = parseInt(parameterArr[2]) || 1;
                var scripts = player.getScripts();

                if (parameters.length == 0) {
                    for (var object in scripts) {
                        if(!scripts.hasOwnProperty(object)) continue;
                        var script = scripts[object];
                        terminal.writeLine("Name: \"" + script.name + "\"");
                        terminal.writeLine("Executes per second: " + script.executesPerSecond + "");
                        terminal.writeLine("Price: $" + script.price + "");
                        terminal.writeLine();
                    }
                }
                else {
                    switch (firstParameter) {
                        case ("buy"):
                            if (typeof(scripts[secondParameter]) != "undefined") {
                                if (player.getMoney() >= scripts[secondParameter].price * thirdParameter) {
                                    scripts[secondParameter].amount += thirdParameter;
                                    player.removeMoney(scripts[secondParameter].price * thirdParameter);
                                    loadTopBar();
                                    terminal.writeLine("You just bought "+ thirdParameter +" \"" + scripts[secondParameter].name + "\" for $" + (scripts[secondParameter].price * thirdParameter) + "");
                                }
                                else {
                                    terminal.writeLine("You don't have money enough to buy "+ thirdParameter +" \"" + secondParameter + "\"");
                                }
                            }
                            else {
                                terminal.writeLine("Script \"" + secondParameter + "\" not found. ")
                            }
                            break;
                        case ("info"):
                            if (typeof(scripts[secondParameter]) != "undefined") {
                                terminal.writeLine("Name: \"" + scripts[secondParameter].name + "\"");
                                terminal.writeLine("Executes per second: " + scripts[secondParameter].executesPerSecond + "");
                                terminal.writeLine("Price: $" + scripts[secondParameter].price + "");
                            }
                            else {
                                terminal.writeLine("Script \"" + secondParameter + "\" not found. ")
                            }
                            break;
                        default:
                            terminal.writeLine("Parameter \"" + secondParameter + "\" not found.");
                            break;
                    }
                }
            },
            name: "scripts",
            info: "To get info about scripts and to buy them.",
            examples: "\"scripts\", \"scripts info rapido\", \"scripts buy regulax\""
        }
    };
}

return Game;
});