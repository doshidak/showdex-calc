/**
 * @file `showdex.ts` - Anything used to implement `@smogon/calc` mods for Showdex.
 * @author Keith Choison <keith@tize.io>
 * @license MIT
 * @description
 * * Why not just fork it?
 *   - Too much work lmaooo
 *
 * Updated: 2023/07/21
 * @since 2023/07/21
 */

import { getBaseDamage } from './mechanics/util';

export type SmogonMechanicsFile =
  | 'gen12'
  | 'gen3'
  | 'gen4'
  | 'gen56'
  | 'gen789';

export type SmogonBaseDamageCalc = (
  level: number,
  basePower: number,
  attack: number,
  defense: number,
) => number;

/**
 * Base damage parameters for a **single** strike in a party-dependent move like *Beat Up*.
 */
export interface ShowdexCalcStrike {
  /**
   * Level of the Pokemon performing this specific strike.
   *
   * * Defaults to using the attacker's level.
   */
  level?: number;

  /**
   * Base power of this specific strike.
   *
   * * Defaults to using the base power normally derived in each mechanics file.
   */
  basePower?: number;

  /**
   * Base attack *value* of this specific strike.
   *
   * * Doesn't necessarily need to be the attacker's ATK stat; can be SPA or whatever actually.
   * * Defaults to using the attacker's attackcing stat value.
   */
  attack?: number;

  /**
   * Base defense *value* of this specific strike.
   *
   * * Doesn't necessarily need to be the defender's DEF stat; can be SPD or whatever actually.
   * * Defaults to using the defender's defending stat value.
   */
  defense?: number;
}

/**
 * Modifications spliced into each `@smogon/calc` mechanics file.
 */
export interface ShowdexCalcMods {
  /**
   * Base damage parameters for multi-striking & party-dependent moves like *Beat Up*.
   *
   * * Each element in this array results in a single base damage calculation, which will all be summed at the end.
   * * Resulting value will be used as the base damage, which is before applying any other damage modifiers like items & abilities.
   * * Providing a falsy value is completely valid & will result in a base damage calculation with the attacker's parameters.
   *   - You can use this to conveniently "specify" the attacker's parameters when building this array.
   *   - I mean, if you want, since you'd be iterating through the party Pokemon anyway.
   *   - Idea is you can start the array with `[null]` if that makes any sense (probably doesn't, all good LOL).
   * * Also, I'm aware that for *Beat Up*, damage modifiers should apply to each strike, but for our purposes, this is good enough c:
   *   - inb4 I regret saying that
   */
  strikes?: ShowdexCalcStrike[];

  /**
   * Base powers of each individual hit for multi-hitting moves.
   *
   * * This was initially implemented for overriding base powers for *Triple Axel* & *Triple Kick*, which was properly
   *   implemented in commit `718d832` (see link below), but works with any applicable move, such as *Icicle Spear*.
   * * Not providing this will fallback to the move's `bp` value.
   *   - This includes `null` / `undefined` values at a particular hit's index.
   *
   * @see https://github.com/smogon/damage-calc/commit/718d832eb5d5101e15587d709e7a26a3588a8edd
   */
  hitBasePowers?: number[];

  /**
   * Whether damage from stage hazards (e.g., *Stealth Rock*) should be excluded from the NHKO chance.
   *
   * @since 1.3.0
   */
  excludeHazardsDamage?: boolean;

  /**
   * Whether damage from end-of-turn effects (e.g., *Burned*, *Sandstorm*) should be excluded from the NHKO chance.
   *
   * @since 1.3.0
   */
  excludeEotDamage?: boolean;
}

/**
 * Base damage calculators by the name of the mechanics file.
 *
 * * Fallback to using `getBaseDamage()` if not specified here.
 */
const baseDamageCalcs: Partial<Record<SmogonMechanicsFile, SmogonBaseDamageCalc>> = {
  gen12: (l, b, a, d) => Math.floor(Math.floor((Math.floor((2 * l) / 5 + 2) * Math.max(1, a) * b) / Math.max(1, d)) / 50),
  gen3: (l, b, a, d) => Math.floor(Math.floor((Math.floor((2 * l) / 5 + 2) * a * b) / d) / 50),
  gen4: (l, b, a, d) => Math.floor(Math.floor((Math.floor((2 * l) / 5 + 2) * b * a) / 50) / d),
};

/**
 * Drop-in replacement for the `getBaseDamage()` function used in each mechanics file.
 *
 * @example
 * ```ts
 * // before (in `mechanics/gen12.ts`):
 * let baseDamage = Math.floor(Math.floor((Math.floor((2 * lv) / 5 + 2) * Math.max(1, at) * move.bp) / Math.max(1, df)) / 50);
 *
 * // after:
 * let baseDamage = modBaseDamage('gen12', mods)(lv, move.bp, at, df);
 * ```
 */
export const modBaseDamage = (
  mech: SmogonMechanicsFile,
  mods?: ShowdexCalcMods,
  originalCalc?: SmogonBaseDamageCalc,
): SmogonBaseDamageCalc => (
  level,
  basePower,
  attack,
  defense,
) => {
  const calcBaseDamage = baseDamageCalcs[mech]
    || originalCalc
    || getBaseDamage;

  if (typeof calcBaseDamage !== 'function') {
    return 0;
  }

  if (!mods?.strikes?.length) {
    return calcBaseDamage(level, basePower, attack, defense);
  }

  return mods.strikes.reduce((sum, strike) => {
    const {
      level: strikeLevel,
      basePower: strikeBasePower,
      attack: strikeAttack,
      defense: strikeDefense,
    } = strike || {};

    sum += calcBaseDamage(
      strikeLevel ?? level,
      strikeBasePower ?? basePower,
      strikeAttack ?? attack,
      strikeDefense ?? defense,
    );

    return sum;
  }, 0);
};
