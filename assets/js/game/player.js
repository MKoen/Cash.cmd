"use strict";

define(["game/scripts", "game/hardware"], function(Scripts, Hardware){

var Player = function(){
    var name = "";
    var machine = "";
    var level = 1;
    var money = 0;
    var salary = 1;
    var scripts = new Scripts();
    var hardware = new Hardware();

    this.getName = function(){
        return name;
    };

    this.setName = function(newName){
        name = newName;
    };

    this.getMachine = function(){
        return machine;
    };

    this.setMachine = function(newMachine){
        machine = newMachine;
    };

    this.getLevel = function(){
        return level;
    };

    this.levelUp = function(){
        level++;
    };

    this.getMoney = function(){
        return money;
    };

    this.addMoney = function(amount){
        money += amount;
    };

    this.removeMoney = function(amount){
        money -= amount;
    };

    this.giveSalary = function(){
        this.addMoney(salary);
    };

    this.getSalary = function(){
        return salary;
    };

    this.increaseSalaryWith = function(amount){
        salary += amount;

    };

    this.getScripts = function(){
        return scripts;
    };

    this.addScripts = function(name){
        scripts[name].amount ++;

    };

    this.getHardware = function(){
        return hardware;
    };

    this.loadGame = function(){
        var saveData = JSON.parse(localStorage.getItem("saveData"));
        if (saveData != null) {
            name = saveData.name;
            machine = saveData.machine;
            level = saveData.level;
            money = saveData.money;
            salary = saveData.salary;
            scripts = saveData.scripts;
            hardware = saveData.hardware;
        }
    };

    this.saveGame = function(){
        var saveData = {
            "name" : name,
            "machine" : machine,
            "level" : level,
            "money" : money,
            "salary": salary,
            "scripts" : scripts,
            "hardware" : hardware
        };

        localStorage.setItem("saveData", JSON.stringify(saveData));
    }
};

return Player;
});
