import {
  ButtonAction,
  CollectibleType,
  ModCallback,
  TrinketType,
} from "isaac-typescript-definitions";
import { log } from "isaacscript-common";

const MOD_NAME = "trinkets";

main();

function main() {
  // Instantiate a new mod object, which grants the ability to add callback functions that
  // correspond to in-game events.
  const mod = RegisterMod(MOD_NAME, 1);

  // Register a callback function that corresponds to when a new run is started.
  mod.AddCallback(ModCallback.POST_GAME_STARTED, postGameStarted);
  mod.AddCallback(ModCallback.POST_RENDER, dropTrinket);
  mod.AddCallback(
    ModCallback.POST_USE_ITEM,
    playLoveGiving,
    CollectibleType.MOMS_BOX,
  );
  // Print an message to the "log.txt" file.
  log(`${MOD_NAME} initialized.`);
}

function postGameStarted() {
  print("Callback triggered: POST_GAME_STARTED");
}

const DROP_FRAMES = 120; // 2 seconds
let dropTimer = 0;
function dropTrinket() {
  const player = Isaac.GetPlayer(0);
  if (Input.IsActionPressed(ButtonAction.DROP, player.ControllerIndex)) {
    dropTimer += 1;
    if (dropTimer === DROP_FRAMES) {
      const trinket = player.GetTrinket(0);
      if (trinket !== TrinketType.NULL) {
        let hasFamiliars = false;
        for (const e of Isaac.GetRoomEntities()) {
          const f = e.ToFamiliar();
          if (f !== undefined) {
            hasFamiliars = true;
            break;
          }
        }
        if (hasFamiliars) {
          const sound = Isaac.GetSoundIdByName("LoveGivingTrinkets");
          SFXManager().Play(sound);
        } else {
          const sound = Isaac.GetSoundIdByName("Trinkets");
          SFXManager().Play(sound);
        }
      }
    }
  } else {
    dropTimer = 0;
  }
}

function playLoveGiving() {
  const sound = Isaac.GetSoundIdByName("LoveGivingTrinkets");
  SFXManager().Play(sound);
  return true;
}
