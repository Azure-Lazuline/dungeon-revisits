ig.EVENT_STEP.DUNGEON_REPLAY = ig.EventStepBase.extend({
  dungeon: null,
  dungeonCamel: null,
  _wm: new ig.Config({
    attributes: {
      dungeon: {
        _type: "String",
        _info: "Dungeon to replay",
      }
    }
  }),
  init: function (a) {
    this.dungeon = a.dungeon;
	this.dungeonCamel = a.dungeon.toCamel();
  },
  start: function () {
	//console.warn("resetting " + this.dungeon);
	
	if (this.dungeon == "arid-dng")
	{ //this one has some global flags, and also the storage name is different from the area name
		ig.vars.storage.g["last-dng"] = null;
	}

	for (var [map, value] of Object.entries(ig.vars.storage.maps))
	{
		if (map.startsWith(this.dungeonCamel))
		{
			for (var [flagkey, flagvalue] of Object.entries(ig.vars.storage.maps[map]))
			{
				var dontRemove = false;
				
				if (flagkey == "dokuTaken" || flagkey == "pickaxeTaken" || flagkey == "dynamiteTaken" || flagkey == "tntTaken")
					dontRemove = true;
				
				if (map == "finalDng/b4/stargate" && flagkey == "chest_305") //macguffin coin chest
					dontRemove = true;
				
				if (dontRemove)
				{
					//console.warn("skipped " + map + " " + flagkey);
				}
				else
				{
					//console.warn("del " + map + " " + flagkey);
					delete ig.vars.storage.maps[map][flagkey]; //unset the flag
				}
			}
			ig.vars.storage.maps[map].hiddenUntilRevisit = true; //mark map as empty
		}
	}
	
	var numChests = sc.stats.getMap("chests", this.dungeon);
	sc.stats.subMap("chests", this.dungeon, numChests);
	sc.stats.subMap("chests", "total", numChests);
	sc.stats.setMap("chests", "totalRate", sc.map.getTotalChestsFound(true))

	ig.vars.storage[this.dungeon] = { };
	ig.vars.storage[this.dungeon].azureDungeonReset = true;
	ig.vars.storage[this.dungeon].disabledElement = null;
	ig.vars.storage["reset-" + this.dungeon] = true;
	
	if (this.dungeon == "rhombus-dng")
	{
		if(ig.vars.storage.maps["rhombusDng/entrance"] == null) ig.vars.storage.maps["rhombusDng/entrance"] = {};
		ig.vars.storage.maps["rhombusDng/entrance"]._entity16_triggered = true; //sergey intro
		if(ig.vars.storage.maps["rhombusDng/room-5Newer"] == null) ig.vars.storage.maps["rhombusDng/room5Newer"] = {};
		ig.vars.storage.maps["rhombusDng/room-5Newer"]._entity214_triggered = true; //other sergey intro
	}
	if (this.dungeon == "cold-dng")
	{
		ig.vars.storage[this.dungeon].disabledElement = sc.ELEMENT.HEAT;
		ig.vars.storage["redoDungeonIntro"] = true;

		if(ig.vars.storage.maps["coldDng/g/center"] == null) ig.vars.storage.maps["coldDng/g/center"] = {};
		ig.vars.storage.maps["coldDng/g/center"]._entity291_triggered = true; //the intro pan to the elevator
	}
	if (this.dungeon == "heat-dng")
	{
		ig.vars.storage[this.dungeon].disabledElement = sc.ELEMENT.COLD;
		ig.vars.storage["redoDungeonIntro"] = true;

		sc.map.activeLandmarks["heat-area"]["balcony"] = null;
		ig.vars.storage.g.fajroTopTeleport = null;
		ig.game.getEntityByName("shortcut").onHideRequest = null; //remove "pop" sound from teleporter hiding
	}
	if (this.dungeon == "wave-dng")
	{
		ig.vars.storage[this.dungeon].disabledElement = sc.ELEMENT.SHOCK;
		ig.vars.storage["redoDungeonIntro"] = true;

		ig.vars.storage.g.sonajizTeleport = null;
	}
	if (this.dungeon == "shock-dng")
	{
		ig.vars.storage[this.dungeon].disabledElement = sc.ELEMENT.WAVE;
		ig.vars.storage["redoDungeonIntro"] = true;

		ig.vars.storage.g.zirvitarTeleport = null;
	}
	if (this.dungeon == "tree-dng")
	{
		ig.vars.storage["redoDungeonIntro"] = true;

		ig.vars.storage.g.krysKajoShortcut = null;
		ig.vars.storage.dungeonsTreeBeatenNew = null;
	}
	if (this.dungeon == "arid-dng")
	{
		ig.vars.storage.plot.metaSpace = null; //the flag for the skip prompts
	}
	if (this.dungeon == "final-dng")
	{
		ig.vars.storage["redoDungeonIntro"] = true;

		ig.vars.storage.maps["forest/interior/temple-inner"] = {};
		ig.vars.storage.g["final-dng"] = {};
		
		sc.map.activeLandmarks["final-dng"]["center"] = null;

		ig.vars.storage.plot.finalDng = 1000;
		ig.vars.storage.plot.finalDngRevisit = 0;

		if (ig.vars.storage.maps["finalDng/g/outdoor-03SouthWest"] == null) ig.vars.storage.maps["finalDng/g/outdoor-03SouthWest"] = {};
		ig.vars.storage.maps["finalDng/g/outdoor-03SouthWest"].lukeMoved = true;
		ig.vars.storage.maps["finalDng/g/outdoor-03SouthWest"].ctronMoved = true;
		if (ig.vars.storage.maps["finalDng/g/outdoor-04NorthEast"] == null) ig.vars.storage.maps["finalDng/g/outdoor-04NorthEast"] = {};
		ig.vars.storage.maps["finalDng/g/outdoor-04NorthEast"].apolloGone = true;
		if (ig.vars.storage.maps["finalDng/g/outdoor-04NorthWest"] == null) ig.vars.storage.maps["finalDng/g/outdoor-04NorthWest"] = {};
		ig.vars.storage.maps["finalDng/g/outdoor-04NorthWest"].apolloMoved = true;
		ig.vars.storage.maps["finalDng/g/outdoor-04NorthWest"].shizukaMoved = true;
		
		if (ig.vars.storage.maps["finalDng/b2/bridge"] == null) ig.vars.storage.maps["finalDng/b2/bridge"] = {};
		ig.vars.storage.maps["finalDng/b2/bridge"]._entity73_triggered = true; //C'tron dialogue
	}

	if (sc.newgame.get("keep-elements"))
		ig.vars.storage[this.dungeon].disabledElement = null;
	
	if (this.dungeon != "arid-dng")
	{
		this.removeKeys("DUNGEON_KEY");
		this.removeKeys("DUNGEON_MASTER_KEY");
	}
	
	if (ig.vars.storage[this.dungeon].disabledElement == sc.model.player.currentElementMode)
		sc.model.player.setElementMode(0, true);

	var timername = "dungeon-replay-" + this.dungeon;
	sc.timers.removeTimer(timername);
	
	if (this.dungeon == "arid-dng")
		sc.timers.addTimer(timername, "COUNTER", null, "arid-dng-2", false, false, false, null); //hacks all over from the one instance where it's a different area label
	else
		sc.timers.addTimer(timername, "COUNTER", null, this.dungeon, false, false, false, null);

	var timerdisplay = "dungeon-replay-global";
	sc.timers.removeTimer(timerdisplay);
	sc.timers.addTimer(timerdisplay, "COUNTER", null, null, false, true, false, null);
  },
  removeKeys: function(keyname) {
	var keytype = sc.AREA_ITEM_TYPE[keyname];
	var keyid = sc.map.getAreaItemId(keytype, this.dungeon);
	while (sc.map.getAreaItemAmount(keytype, this.dungeon) > 0)
	{
		sc.model.player.removeItem(keyid, this.dungeon, 1);
	}
  }
});

ig.EVENT_STEP.DUNGEON_REPLAY_DONE = ig.EventStepBase.extend({
  dungeon: null,
  _wm: new ig.Config({
    attributes: {
      dungeon: {
        _type: "String",
        _info: "Dungeon that got replayed",
      }
    }
  }),
  init: function (a) {
    this.dungeon = a.dungeon;
	
	//ig.vars.storage["reset-" + this.dungeon] = true; //testing - always play the dungeon clear anim when you enter the room
  },
  start: function () {
	ig.vars.set("reset-" + this.dungeon, null);
	ig.vars.set("lastDungeonBeaten", this.dungeon);
	ig.vars.set("tmp.cancelDungeonTimer", true);
	if (this.dungeon == "heat-dng")
	{
		ig.vars.storage.g.fajroTopTeleport = 1;
	}
	if (this.dungeon == "wave-dng")
	{
		ig.vars.storage.g.sonajizTeleport = 1;
	}
	if (this.dungeon == "shock-dng")
	{
		ig.vars.storage.g.zirvitarTeleport = 1;
	}
	if (this.dungeon == "tree-dng")
	{
		ig.vars.storage.g.krysKajoShortcut = 1;
	}
	if (this.dungeon == "arid-dng")
	{
		ig.bgm.clear("MEDIUM_OUT");
	}
  },
});

ig.EVENT_STEP.SHOW_BOARD_MSG.inject({
	start(){
		if (this.text == "===DungeonReplayEnd===")
		{
			this.text = "Dungeon complete!";
			var timername = "dungeon-replay-" + ig.vars.storage["lastDungeonBeaten"];
			var time = sc.timers.getPassedTime(timername);
			if (time != null)
			{
				sc.timers.removeTimer(timername);
				this.text += "\nTime: " + sc.timers.formatTime(time, true);
			}
		}
		return this.parent();
	}
});

sc.TimerEntry.inject({
	tick(){
		if (this.name == "dungeon-replay-global") //there's a "global timer" that handles the display while the individual dungeon timers run in the background.
		{ //this is for a few technical reasons because timers with a HUD display were never designed to be area-specific
			var area = sc.map.currentArea.path;
			if (area == "arid-dng-2") area = "arid-dng";
			if (this.dungeonReplayLastArea != area || ig.vars.get("tmp.cancelDungeonTimer"))
			{
				//console.warn("changed area");
				ig.vars.set("tmp.cancelDungeonTimer", false);
				
				var otherTimer = sc.timers.timers["dungeon-replay-" + area];
				if (otherTimer != null && ig.vars.get("dungeonReplayTimerActive") && ig.vars.get("reset-" + area))
				{
					//console.warn("on");
					sc.timers.removeTimer(this.name);
					sc.timers.addTimer(this.name, "COUNTER", null, null, false, true, false, null, "time");
					sc.timers.timers[this.name].timer = otherTimer.timer; //copy the time from the dungeon-specific one
				}else{
					//console.warn("off");
					sc.timers.removeTimer(this.name);
					sc.timers.addTimer(this.name, "COUNTER", null, null, false, false, false, null); //null timer, doesn't do anything (but needs to exist so it keeps checking with this code)
				}
				sc.timers.timers[this.name].dungeonReplayLastArea = area;
			}
		}
		this.parent();
	}
});

//plot.line
//beat samurai: 19200
//beat DLC: 48000
ig.ENTITY.Enemy.inject({
	init(a, b, c, d)
	{
		this.parent(a, b, c, d);
		var area = sc.map.currentPlayerArea.path;
		if (area == "arid-dng-2") area = "arid-dng";
		if (ig.vars.storage[area] && ig.vars.storage[area].azureDungeonReset)
		{
			this.boosterState = sc.ENEMY_BOOSTER_STATE.NONE;
			
			var levelTarget = 60;
			if (ig.vars.get("plot.line") >= 48000)
				levelTarget = 75;
			
			if (levelTarget > this.getLevel())
			{
				this.setLevelOverride(levelTarget);
			}
		}
	}
});

ig.Game.inject({
	loadingComplete(...args){
		this.parent(...args);
		
		var inDungeonReset = false;
		if(sc && sc.map && sc.map.currentPlayerArea)
		{
			var area = sc.map.currentPlayerArea.path;
			if (area == "arid-dng-2") area = "arid-dng";
			if (ig.vars.storage[area] && ig.vars.storage[area].azureDungeonReset)
			{
				inDungeonReset = true;

				if (ig.vars.storage[area].disabledElement == sc.model.player.currentElementMode)
					sc.model.player.setElementMode(0, true); //no smuggling it in
			}
			
			if (sc.map.currentMap)
			{
				var name = sc.map.currentMap.toCamel().toPath("", "");
				if (ig.vars.storage.maps[name])
					ig.vars.storage.maps[name].hiddenUntilRevisit = null;
			}
		}
		if((ig.vars.storage.inDungeonReset != inDungeonReset || inDungeonReset) && sc.inventory)
		{
			ig.vars.storage.inDungeonReset = inDungeonReset;
			if (inDungeonReset)
			{
				var levelTarget = 60;
				if (ig.vars.get("plot.line") >= 48000)
					levelTarget = 75;
				sc.inventory.updateScaledEquipment(levelTarget);
			}
			else
				sc.inventory.updateScaledEquipment(sc.model.player.level);
		}
		
	}
});

sc.MapRoom.inject({
	preRender() {
		var name = this.room.name.toCamel().toPath("", "");
		if (ig.vars.storage.maps[name] && ig.vars.storage.maps[name].hiddenUntilRevisit)
			this.unlocked = false;
		this.parent();
	}
});

sc.MapAreaContainer.inject({
	findMap(a, b, c, d)
	{
		var ret = this.parent(a, b, c, d);
		
		if (this.hoverRoom != null)
		{
			var name = this.hoverRoom.name.toCamel().toPath("", "");
			if (ig.vars.storage.maps[name] && ig.vars.storage.maps[name].hiddenUntilRevisit)
			{
				this.hoverRoom = null;
				this.mapNameGui.setText("");
				this.mapNameGui.doStateTransition("HIDDEN", true);
				return false;
			}
		}
		return ret;
	}
});

sc.PlayerModel.inject({
  hasElement(a) {
	  var area = sc.map.currentPlayerArea.path;
	  if (ig.vars.storage[area] && ig.vars.storage[area].disabledElement == a)
		  return false;
      return this.parent(a);
  },
  getCore(a) 
  {
	  if (sc && sc.map && sc.map.currentPlayerArea)
	  {
		  var area = sc.map.currentPlayerArea.path;
		  if (ig.vars.storage[area] && ig.vars.storage[area].disabledElement != null && ig.vars.storage[area].disabledElement + 8 == a)
			  return false;
	  }
	  return this.parent(a);
  }
});

sc.CircuitOverviewMenu.inject({
	onAttach(){
		this.parent();
		if (sc && sc.map && sc.map.currentPlayerArea)
		{
			var area = sc.map.currentPlayerArea.path;
			if(ig.vars.storage[area] && ig.vars.storage[area].disabledElement)
			{
				for (var a = this.buttons.length; a--; )
					if (ig.vars.storage[area].disabledElement == a)
					{
						this.buttons[a].focusable = false;
					}
			}
		}
	}
});

ig.EVENT_STEP.CHANGE_VAR_NUMBER.inject({
	start(){
		var area = sc.map.currentPlayerArea.path;
		if (area == "arid-dng-2") area = "arid-dng";
		if (this.varName == "plot.line" && ig.vars.storage[area] && ig.vars.storage[area].azureDungeonReset)
		{ //don't overwrite the plot!
			return;
		}
		if (this.varName == "plot.finalDng" && ig.vars.storage[area] && ig.vars.storage[area].azureDungeonReset)
		{
			this.varName = "plot.finalDngRevisit";
		}
		return this.parent();
	}
});
ig.EVENT_STEP.SET_PERMA_TASK.inject({
	start(){
		var area = sc.map.currentPlayerArea.path;
		if (area == "arid-dng-2") area = "arid-dng";
		if (ig.vars.storage[area] && ig.vars.storage[area].azureDungeonReset)
		{ //don't overwrite the current story mission
			return;
		}
		return this.parent();
	}
});

ig.EVENT_STEP.CHANGE_VAR_BOOL.inject({
	start(){
		var area = sc.map.currentPlayerArea.path;
		if (area == "arid-dng-2") area = "arid-dng";
		if (this.varName == "dungeons.tree.beaten" && this.value == true && ig.vars.storage[area] && ig.vars.storage[area].azureDungeonReset)
		{ //dungeons.tree.beaten is the only flag set after the boss is killed, but i can't globally replace it since lots of things depend on it elsewhere.
			//so set up a secondary one, done through code hacking instead of map editing since i still don't trust modifying existing objects/events in a map edit
			this.varName = "dungeonsTreeBeatenNew";
		}
		return this.parent();
	}
});

ig.Game.inject({
	spawnEntity(b, a, d, c, e, f){
		if (e && e.spawnCondition == "dungeons.tree.beaten" && sc.map.currentPlayerArea.path == "tree-dng")
			e.spawnCondition = "dungeonsTreeBeatenNew";

		return this.parent(b, a, d, c, e, f);
	}
});

ig.EVENT_STEP.SET_PLAYER_CORE.inject({
	start(){
		var area = sc.map.currentPlayerArea.path;
		if (area == "arid-dng-2") area = "arid-dng";
		if (ig.vars.storage[area] && ig.vars.storage[area].azureDungeonReset)
		{ //don't change cores
			return;
		}
		return this.parent();
	}
});

ig.EVENT_STEP.IF.inject({
	getNext(){
		if (sc && sc.map && sc.map.currentPlayerArea)
		{
			var area = sc.map.currentPlayerArea.path;
			if (ig.vars.storage[area] && ig.vars.storage[area].azureDungeonReset)
			{
				var conditionOverride = null;
				if (this.condition.pretty == "newgame.keep-elements")
					conditionOverride = true;
				if (this.condition.pretty == "!newgame.keep-elements")
					conditionOverride = false;
				
				if (conditionOverride != null)
				{
					//unlock the elements that were disabled
					ig.vars.storage[area].disabledElement = null;
					
					//copypasted from base
					return conditionOverride ? this.branches.thenStep ? this.branches.thenStep : this._nextStep : this.branches.elseStep ? this.branches.elseStep : this._nextStep;
				}
			}
		}
		return this.parent();
	}
});

ig.EVENT_STEP.SHOW_SIDE_MSG.inject({
	start(){
		var area = sc.map.currentPlayerArea.path;
		if (area == "arid-dng-2") area = "arid-dng";
		if (ig.vars.storage[area] && ig.vars.storage[area].azureDungeonReset && ig.vars.currentLevelName != "aridDng/second/f99/boss-1")
		{ //don't show side messages while in a replay, except when Gautham is being cool
			return;
		}
		return this.parent();
	}
});

ig.ENTITY.TeleportGround.inject({
	init(a, d, c, e){
		this.parent(a, d, c, e);
		if (ig.vars.storage["arid-dng"] && ig.vars.storage["arid-dng"].azureDungeonReset
			&& this.map == "arid.tower-1" && this.marker == "towerEntrance") //override exit out of tower
		{
			this.map = "forest.path-10-hidden";
			this.marker = "revisitTeleMarker";
			this.transitionType = 2; //fade to white
		}
	}
});
ig.EVENT_STEP.TELEPORT.inject({
	start(){
		if (this.map == "arid-dng.second.f99.end-room" && ig.vars.storage["arid-dng"] && ig.vars.storage["arid-dng"].azureDungeonReset)
		{
			ig.game.events.clear(); //end all events
			ig.vars.storage.tmp.bossFinished = true; //start new scene instead of teleporting to ending
			return;
		}
		this.parent();
	}
});

ig.Vars.inject({
	set(a, b){
		if (a == "tmp.ferroGateAbsorb" && ig.vars.get("reset-final-dng"))
		{
			a = "tmp.ferroGateAbsorbNew";
		}
		this.parent(a, b);
	}
});