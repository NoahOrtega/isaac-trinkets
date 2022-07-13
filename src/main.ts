import {
  ButtonAction,
  CollectibleType,
  EntityType,
  ModCallback,
  PickupVariant,
  TrinketType,
} from "isaac-typescript-definitions";
import { sfxManager } from "isaacscript-common";

const MOD_NAME = "trinkets";

const SoundEffectCustom = {
  FRIENDS_AND_FAMILY: Isaac.GetSoundIdByName("LoveGivingTrinkets"),
  TRINKETS: Isaac.GetSoundIdByName("Trinkets"),
} as const;

main();

function main() {
  // Instantiate a new mod object, which grants the ability to add callback functions that
  // correspond to in-game events.
  const mod = RegisterMod(MOD_NAME, 1);

  // Register a callback function that corresponds to when a new run is started.
  mod.AddCallback(ModCallback.POST_USE_ITEM, momsBox, CollectibleType.MOMS_BOX);
  mod.AddCallback(ModCallback.PRE_ENTITY_SPAWN, newTrinket);
  mod.AddCallback(ModCallback.POST_RENDER, dropTrinket);
}

function newTrinket(
  entityType: EntityType,
  variant: int,
  subType: int,
  _position: Vector,
  _velocity: Vector,
  _spawner: Entity | undefined,
  initSeed: Seed,
): [EntityType, int, int, int] | undefined {
  if (PickupVariant.TRINKET === variant && EntityType.PICKUP === entityType) {
    if ((subType as TrinketType) === TrinketType.NULL) {
      sfxManager.Play(SoundEffectCustom.TRINKETS, 0.1);
    }
  }
  return [entityType, variant, subType, initSeed];
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
          sfxManager.Play(SoundEffectCustom.FRIENDS_AND_FAMILY);
        }
      }
    }
  } else {
    dropTimer = 0;
  }
}

function momsBox() {
  sfxManager.Stop(SoundEffectCustom.TRINKETS);
  sfxManager.Play(SoundEffectCustom.FRIENDS_AND_FAMILY);
  return true;
}
