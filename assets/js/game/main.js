"use strict";

define(["jquery", "game/game", "game/player", "game/terminal"], function($, Game, Player, Terminal){

$(function(){
    var name = "User";
    var machine = "Machine";
    var player;
    var terminal;
    var game;

    player = new Player();
    player.setName(name);
    player.setMachine(machine);
    player.loadGame();

    terminal = new Terminal();
    terminal.setUser(player.getName());
    terminal.setMachine(player.getMachine());

    game = new Game();
    game.setTerminal(terminal);
    game.setPlayer(player);
    terminal.init();
    game.init();
});

});