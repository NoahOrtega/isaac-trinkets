import {
  ButtonAction,
  CollectibleType,
  EntityType,
  ModCallback,
  PickupVariant,
  TrinketSlot,
  TrinketType,
} from "isaac-typescript-definitions";
import {
  enableExtraConsoleCommands,
  sfxManager,
  upgradeMod,
} from "isaacscript-common";

const MOD_NAME = "trinkets for friends and family";

const SoundEffectCustom = {
  FRIENDS_AND_FAMILY: Isaac.GetSoundIdByName("LoveGivingTrinkets"),
  TRINKETS: Isaac.GetSoundIdByName("Trinkets"),
} as const;

main();

function main() {
  const modVanilla = RegisterMod(MOD_NAME, 1);
  const mod = upgradeMod(modVanilla);

  // Register a callback function that corresponds to when a new run is started.
  mod.AddCallback(ModCallback.PRE_ENTITY_SPAWN, newTrinket);
  mod.AddCallback(ModCallback.POST_RENDER, dropTrinket);
  mod.AddCallback(ModCallback.POST_USE_ITEM, momsBox, CollectibleType.MOMS_BOX);

  enableExtraConsoleCommands(mod);
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
    // Only NULL when it spawns during the current room.
    if ((subType as TrinketType) === TrinketType.NULL) {
      sfxManager.Play(SoundEffectCustom.TRINKETS, 0.4);
    }
  }
  return [entityType, variant, subType, initSeed];
}

const DROP_FRAMES = 120; // 2 seconds
const dropTimers: number[] = [0, 0, 0, 0];
function dropTrinket() {
  for (let pIndex = 0; pIndex < Game().GetNumPlayers(); pIndex++) {
    const player = Isaac.GetPlayer(pIndex);
    if (Input.IsActionPressed(ButtonAction.DROP, player.ControllerIndex)) {
      dropTimers[pIndex] += 1;
      // setPlayerDisplay((play: EntityPlayer): string => { const pI = getPlayerIndexVanilla(play);
      // if (pI !== undefined) { return `${dropTimers[pI]}`; } return "error"; });
      if (dropTimers[pIndex] === DROP_FRAMES) {
        const trinket = player.GetTrinket(TrinketSlot.SLOT_1);
        if (trinket !== TrinketType.NULL) {
          let hasFamiliars = false;
          for (const e of Isaac.GetRoomEntities()) {
            const f = e.ToFamiliar();
            if (f !== undefined) {
              hasFamiliars = true;
              break;
            }
          }
          if (hasFamiliars || Game().GetNumPlayers() > 1) {
            sfxManager.Play(SoundEffectCustom.FRIENDS_AND_FAMILY);
          }
        }
      }
    } else {
      dropTimers[pIndex] = 0;
    }
  }
}

function momsBox() {
  sfxManager.Stop(SoundEffectCustom.TRINKETS);
  sfxManager.Play(SoundEffectCustom.FRIENDS_AND_FAMILY);
  return true;
}
