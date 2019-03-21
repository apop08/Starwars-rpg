/**************************************************************************************************/
/*!
@file	StarwarsRPG.js
@date	3/20/2019
@authors: Alex Poplawski
@brief
The javascript file for the starwars rpg handles all the game logic and drawing
*/
/**************************************************************************************************/

// JavaScript function that wraps everything
$(document).ready(function() 
{
    /*
        Global variables encapsulated in a singleton to protect from idiocy
    */
    var gameInfo = {
        // map of jedi objects to prevent them from being garbage collected when nothing else is referencing them
        jediList: new Map(),
        // hook for the player's picked jedi
        playerJedi: null,
        // hook for the current enemy jedi
        curEnemy: null,
        // game state string
        gameState: "",
        // list of pickable jedi
        pickableJedi: new Map()
    };
    
    /*
        * Jedi object

        * params:
        * initName - The name string that represent the Jedi
        * initImage - The image string that represents the Jedi
        * initStartHp - The inital hp of the Jedi
        * initAttack - The inital attack of the Jedi
        * initCounterAtk - The inital counter attack of the Jedi

        * return:
        * return a reference to this object
    */
    function jedi(initName, initImage, initStartHp, initAttack, initCounterAtk)
    {
        this.name = initName;
        this.image = initImage
        this.startHp = initStartHp;
        this.hp = initStartHp;
        this.baseAtk = initAttack;
        this.currentAtk = initAttack;
        this.counterAtk = initCounterAtk;
        
        /*
        * Function for outputing Jedi to the screen

        * return:
        * A html string for displaying the jedi on the screen
        */
        this.print = function()
        {
            return "<img class=\"jedi\" src=\"" + this.image + "\" jediName=\"" + this.name + "\">" +
                   "<div class=\"label\">Name: " + this.name + "<br>HP: " + this.hp + "</div>";
        };

        
        /*
        * Function for checking if the player is dead

        * return:
        * true: the players hp is under 0 and dead
        * false: the players still alive
        */
        this.isDead = function()
        {
            if(this.hp <= 0)
            {
                return true;
            }
            return false;
        };

        /*
        * Function for reintializing the jedi
        */
        this.reInit = function()
        {
            this.hp = this.startHp;
            this.currentAtk = this.baseAtk;
        
        };

        /*
        * Stores attack then increments current attack

        * Return:
        * The stored attack
        */
        this.attack = function()
        {
            var temp = this.currentAtk;
            this.currentAtk += this.baseAtk;
            return temp;
        };

        /*
        * getter for counter attack

        * Return:
        * counter attack
        */
        this.counter = function()
        {
            return this.counterAtk;
        };

        /*
        * Damage handler function for jedi

        * params:
        * atk - integer to decrement hp by

        * return:
        * bool if the player is dead or not
        */
        this.takeDmg = function(atk)
        {
            this.hp -= atk;
            return this.isDead();
        };
        
        //when finished constructing return a hook to this so we can use it
        return this;
    }

    /*
    * Object Factory for the jedis calls the correct constructor for the jedi objects

    * params:
    * name - name of the jedi to create

    * return:
    * reference to the created jedi or an error string
    */
    function createJedi(name)
    {
        // this methodology isnt really relevent for this project since there is only 1 object type were making
        // I should also look into how the new key word really works and object.create but this works for now
        switch(name)
        {
            case "Obi-Wan Kenobi":
                return new jedi("Obi-Wan Kenobi", "Assets/Images/obiwan.jpg", 125, 12, 23);
            case "Luke Skywalker":
                return new jedi("Luke Skywalker", "Assets/Images/lukeskywalker.jpg", 145, 11, 21);
            case "Darth Vader":
                return new jedi("Darth Vader", "Assets/Images/darthvader.jpg", 150, 10, 18);
            case "Darth Maul":
                return new jedi("Darth Maul", "Assets/Images/darthmaul.jpg", 160, 9, 19);
            // TODO: Make the error louder instead of a silent fail (assert calls?)
            default:
                return "Error jedi not defined";
        }
    }
    
    /*
    * Populates the given map with jedi objects

    * params:
    * mapToPop - reference to a map object to add jedi into
    */
    function populateMap(mapToPop)
    {
        //key is the jedi's name and value is a reference to the jedi object
        mapToPop.set("Obi-Wan Kenobi", createJedi("Obi-Wan Kenobi"));
        mapToPop.set("Luke Skywalker", createJedi("Luke Skywalker"));
        mapToPop.set("Darth Vader", createJedi("Darth Vader"));
        mapToPop.set("Darth Maul", createJedi("Darth Maul"));
    }

    /*
    * Select a jedi out of the map and return a reference to the object

    * params:
    * jediPicked - string of the name of the jedi that was picked
    * mapIn - the map that the jedi object should be extracted from

    * return:
    * reference to the extracted jedi
    */
    function pickJedi(jediPicked, mapIn)
    {
        var temp = mapIn.get(jediPicked);
        mapIn.delete(jediPicked);
        return temp;
    }

    /*
    * function that handles the initial load
      populates the jedi list and initializes
      sets initial gamestate
    */
    function load()
    {
        populateMap(gameInfo.jediList);
        init();
        gameInfo.gameState = "pickChar";
    }

    /*
    * initialize function that resets the pickable jedis
    */
    function init()
    {
        for(let i of gameInfo.jediList)
        {
            gameInfo.pickableJedi.set(i[0], i[1]);
        }
        
    }
    
    /*
    * reset the game back to the inital state
    */
    function reset()
    {
        gameInfo.playerJedi = null;
        init();
        //reinitialize all the jedis to their initial state
        for(let i of gameInfo.jediList.values())
        {
            i.reInit();
        }
        gameInfo.gameState = "pickChar";
    }

    /*
    * Function that clears the relevent divs and hides the buttons
    */
    function clearScreen()
    {
        // TODO: find a way to do this cleaner and not on every draw call so I can 
        //       create animations that work correctly
        $("#pickJedi0").empty();
        $("#pickJedi1").empty();
        $("#pickJedi2").empty();
        $("#pickJedi3").empty();
        $("#playerJedi").empty();
        $("#enemyJedi").empty();
        $("#pickEnemyJedi0").empty();
        $("#pickEnemyJedi1").empty();
        $("#pickEnemyJedi2").empty();
        $("#textField").empty();
        $("#textField2").empty();
        $("#fight").hide();
        $("#replay").hide();
    }
    
    /*
    * draw state function, draws out the individual gamestates

    * params:
    * gS - the current game state

    */
    function draw(gS)
    {
        //clear the screen
        clearScreen();
        //iterator for the tables of jedi
        var j = 0;
        switch(gS)
        {
            // TODO: Functionize these
            case "pickChar":
                // print each jedi into its own div
                for(let i of gameInfo.pickableJedi.values())
                {
                    $("#pickJedi" + j++).append(i.print());
                }
                $("#textField").html("<h1>Pick Your Jedi</h1>");
                
                break;


            case "pickAttacker":

                $("#playerJedi").append(gameInfo.playerJedi.print());


                for(let i of gameInfo.pickableJedi.values())
                {
                    $("#pickEnemyJedi" + j++).append(i.print());
                }

                $("#textField").html("<h1>Pick your enemy</h1>");
                break;

            case "fight":
                //show the fight button
                $("#fight").show();
                for(let i of gameInfo.pickableJedi.values())
                {
                    $("#pickEnemyJedi" + j++).append(i.print());
                }
                $("#playerJedi").append(gameInfo.playerJedi.print());
                $("#enemyJedi").append(gameInfo.curEnemy.print());
                $("#enemyJedi").append();

                $("#textField").html("<h1>Versus</h1>");
                $("#textField2").html("<h1>Enemies remaining</h1>");
                break;

            case "win":
                $("#textField").html("<h1>You Win, Replay?</h1>");
                $("#replay").show();
                break;

            case "loss":
                $("#textField").html("<h1>You Lose, Replay?</h1>");
                $("#replay").show();
                break;
            default:
                // error handle a undefined gamestate
        }
            
    }

    load();
    draw(gameInfo.gameState);
    // handle the initial jedi pick
    $("#pickJedi").click(function(event) 
    {
        //ensure the correct game state
        if(gameInfo.gameState == "pickChar")
        {
            var jedi = $(event.target).attr("jediname");
            // check if they clicked the image not the text
            // TODO: handle this in the html not the code
            if(jedi)
            {
                gameInfo.playerJedi = pickJedi(jedi, gameInfo.pickableJedi);
                // set next game state
                gameInfo.gameState = "pickAttacker";
                // update the screen
                draw(gameInfo.gameState);
            }
            
        }
    });

    // handle the second jedi picked into the enemy
    $("#pickEnemyJedi").click(function(event) 
    {
        if(gameInfo.gameState == "pickAttacker")
        {
            var jedi = $(event.target).attr("jediname");
            if(jedi)
            {
                gameInfo.curEnemy = pickJedi(jedi, gameInfo.pickableJedi);
                gameInfo.gameState = "fight";
                draw(gameInfo.gameState);
            }
        }
    });

    // fight game state handling
    $("#fight").click(function(event) 
    {
        if(gameInfo.gameState == "fight")
        {
            // enemy takes the amount of damage from player jedi and check if the enemy died
            if(gameInfo.curEnemy.takeDmg(gameInfo.playerJedi.attack()))
            {
                // enemy dead and no more enemies left goto win
                if(gameInfo.pickableJedi.size == 0)
                {
                    gameInfo.gameState = "win";
                }
                // enemy dead and still enemies left
                else
                {
                    gameInfo.gameState = "pickAttacker";
                }
                
            }
            // handle the counter attack and check if player is dead
            else if(gameInfo.playerJedi.takeDmg(gameInfo.curEnemy.counter()))
            {
                //goto the loss state
                gameInfo.gameState = "loss";
            }
            draw(gameInfo.gameState);
        }
    });

    // if the press the replay button replay the game
    $("#replay").click(function(event) 
    {
        reset();
        draw(gameInfo.gameState);
    });

    

});