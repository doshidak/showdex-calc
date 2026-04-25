<h1 align="center">
  <img alt="showdex-lib" width="360px" src=".github/showdex-lib.png">
  <br>
  <a href="https://github.com/doshidak/showdex-calc"><code>showdex-calc</code></a>
</h1>

<table align="center">
  <thead>
    <tr>
      <th align="center">&nbsp;Currently <a href="https://github.com/doshidak/showdex-calc/releases/tag/v1.3.0"><s>v1.3.0</s></a>&nbsp;</th>
      <th align="center">&nbsp;Powering <a href="https://github.com/doshidak/showdex"><code>showdex</code></a> · <a href="https://github.com/doshidak/showdex/releases/tag/v1.3.0"><s>v1.3.0</s></a>&nbsp;</th>
      <th align="center">&nbsp;Patches <a href="https://github.com/smogon/damage-calc/tree/master/calc"><code>@smogon/calc</code></a> · <a href="https://npmjs.com/package/@smogon/calc/v/0.11.0">v0.11.0</a> &rarr; <a href="https://github.com/doshidak/showdex-calc/commit/c4d171797e80f6a4cdd3e58818b2a6f81b2d5519"><code>c4d1717</code></a>&nbsp;</th>
    </tr>
  </thead>
</table>

<br>

[**Showdex**](https://smogon.com/forums/threads/showdex-an-auto-updating-damage-calculator-built-into-showdown.3707265/post-9368925)'s fork of the [**`@smogon/calc`**](https://github.com/smogon/damage-calc/tree/master/calc) package, sometimes referred to as the "underlying damage calculator." This is the modified source of the aforementioned package that's patched in & bundled with official releases of Showdex.

If you're looking for Showdex's source code, this **isn't** it ([**try here**](https://github.com/doshidak/showdex) instead!). You're looking at a supporting package that supplies all the damage calculations that Showdex displays to you. But if you're looking for a sign, here's a pointer: `int*` <sub>✧ﾟ･: *ヽ(◕ヮ◕ヽ)</sub>

<br>
<br>

<h1 align="center">
  Developer Zone
</h1>

> [!CAUTION]
> You are about to get in the zone, the developer zone.  
> If you do not wish to get in the zone, the developer zone, please visit [this zone](https://youtube.com/watch?v=9MiP1MJC7EU) instead.

## Developer SparkNotes™

Sooo... what's different?

**Mainly:**

* Disabled web client.
  - Web client build scripts have been bypassed in the `postinstall` script.
  - For our purposes, we're only interested in the *ＭＥＡＴ* inside the [`calc`](/calc) directory ( ͡° ͜ʖ ͡°)
* `pnpm` in lieu of `npm`, similar to Showdex.

**More specifically:**

* Hacky [*Beat Up*](https://smogon.com/dex/sv/moves/beat-up) implementation requiring [`getBaseDamage()`'s to be subbed for this fork's special `modBaseDamage()` wrapper](/calc/src/mechanics/gen3.ts#L157-L158) instead.
  - Since this requires [knowledge about all party Pokémon](https://bulbapedia.bulbagarden.net/wiki/Beat_Up_(move)#Effect), Showdex passes a special [`ShowdexCalcMods`](/calc/src/showdex.ts#L67) object to [`modBaseDamage()`](/calc/src/showdex.ts#L106), which is a generic wrapper (to support more mods in the future, as needed) that basically only contains a [`strikes[]`](/calc/src/showdex.ts#L80) array for *Beat Up* & [`hitBasePowers[]`](/calc/src/showdex.ts#L92) for overriding the BPs of each hit for multi-hitting moves such as [*Triple Axel*](https://smogon.com/dex/sv/moves/triple-axel).
  - Every single mechanics file from [`gen12.ts`](/calc/src/mechanics/gen12.ts#L205) to [`gen789.ts`](/calc/src/mechanics/gen789.ts#L1672) has this modification.
* [Disabled auto-BP calculations for some moves like *Triple Kick*](/calc/src/mechanics/gen789.ts#L982-L985) (but not all!) so that what you see (in the Calcdex &mdash; especially when editing moves) is what you *calc*... sorta:
  - As of [Showdex v1.2.5](https://github.com/doshidak/showdex/releases/tag/v1.2.5), many of the previously disabled moves, such as [*Acrobatics*](https://smogon.com/dex/sv/moves/acrobatics) (but not [*Triple Kick*](https://smogon.com/dex/sv/moves/triple-kick) — still disabled!), have been [re-enabled in some of the mechanics files](/calc/src/mechanics/gen789.ts#L865-L870).
  - Showdex will display an "**AUTO**" label in these instances where the mechanics files will be calculating dynamic move properties, i.e., [category](/calc/src/mechanics/gen789.ts#L123-L126) &/or [BP](/calc/src/mechanics/gen789.ts#L997-L1000), for moves such as [*Tera Blast*](https://smogon.com/dex/sv/moves/tera-blast).
* [Excludable damages in the NHKO calculations](/calc/src/desc.ts#L329-L335) as of [Showdex v1.3.0](https://github.com/doshidak/showdex/releases/tag/v1.3.0), namely [`mods.excludeHazardsDamage`](/calc/src/showdex.ts#L99) from field hazards such as [*Stealth Rock*](https://smogon.com/dex/sv/moves/stealth-rock) & [`mods.excludeEotDamage`](/calc/src/showdex.ts#L106) from end-of-turn effects such as the non-volatile [BRN](https://bulbapedia.bulbagarden.net/wiki/Burn_(status_condition)) status condition.
* [Disabled auto-boosting of some abilities like *Intrepid Sword*](/calc/src/mechanics/util.ts#L257-L264), especially since Showdown *also* reports those boosts in the battle!
* [Persistent final move BPs in matchup descriptions](/calc/src/mechanics/gen789.ts#L1042) to assist with debugging calculations from Showdex.
* [Extra exported types in `src/index.ts`](/calc/src/index.ts#L147-L170) that I frequently use like `GameType` & `GenerationNum`, conveniently importable from `'@smogon/calc'` directly.

Many of these modifications were made to account for real-time battle conditions that don't apply to the original web-based version. Hence, I'm not intending on pushing any of them to the master [`smogon/damage-calc`](https://github.com/smogon/damage-calc) repo (also would seriously break the good 'ol [Damage Calculator](https://calc.pokemonshowdown.com) we know & love!).

### Requirements

* **`node`** LTS Jod v24
* **`pnpm`** v10.0.0+
* **`bash`** ([Windows WSL](https://docs.microsoft.com/en-us/windows/wsl/install), macOS, or Linux)

## ①&nbsp;&nbsp;Installation

> [!CAUTION]
> Without any additional package configuration (that I'm too lazy to do rn), attempting to install this from a package manager (e.g., `pnpm add doshidak/showdex-calc`) will fail! You **must** install this custom fork into your local copy of Showdex using the cumbersome method detailed below. Sorry :c

> [!IMPORTANT]
> I'm assuming you've already cloned `doshidak/showdex.git` (i.e., Showdex's source code), which exists under `showdex` in your favorite directory.

1. `cd` into your favorite directory.
2. `git clone git@github.com:doshidak/showdex-calc.git`
3. `cd showdex-calc`
4. `pnpm install`
5. `cd ../showdex`
6. `rm -r node_modules/@smogon/calc/dist node_modules/@smogon/calc/src`
7. `cp -r ../showdex-calc/calc/dist ../showdex-calc/calc/src node_modules/@smogon/calc`
8. `pnpm patch @smogon/calc@<version>` &mdash; pnpm spits out an editable dir path
9. Replace `dist/` + `src/` in that dir with `../showdex-calc/calc/dist` + `../showdex-calc/calc/src`
10. `pnpm patch-commit <that-editable-dir-path>` &mdash; writes the patchfile to `patches/`
11. `pnpm install`
12. `pnpm dev:re`
13. ???
14. Profit!

> [!TIP]
> Steps 8-10 are completely optional if you just want to quickly test some changes &mdash; the manual `cp` from step 7 is enough until the next `pnpm install` blows it away.

> [!NOTE]
> Steps 8-10 used to be `pnpm patch-package @smogon/calc` (back when Showdex used the [`patch-package`](https://npmjs.com/package/patch-package) tool), but [Showdex migrated to pnpm-native patches](https://github.com/doshidak/showdex/commit/1f7a412c) so the flow has changed accordingly.

> [!NOTE]
> Technically, copying the `showdex-calc/calc/dist/src` directory into `node_modules/@smogon/calc` has no effect (uses the files in `dist` instead) & is completely optional, but I do it anyway so you can peep the source code. Fun fact: You can look through your local Showdex's `node_modules/@smogon/calc/src` right now to see the source code you see here!

> [!TIP]
> Showdex's `pnpm dev[:chrome|:firefox]:re` script is an alias of its `pnpm cache:purge && pnpm dev[:chrome|:firefox]` scripts (also `pnpm dev` itself is an alias of `pnpm dev:chrome`). Running `pnpm cache:purge` is necessary if you've changed anything inside `node_modules` (including the `@smogon/calc` package!) after running `pnpm dev` since the stale changes will still persist in (& be loaded from) `node_modules/.cache/babel`.

**wait, you mean you do this *every* time for *every* Showdex release ???**

* yessir
* all natty
  - no git
  - no ci
  - raw dawg
* basically took a year to set this up cause I'm lazy
  - probably would've taken at least two had someone not asked me for this LOL

<br>

<h1 align="center">
  Credits
</h1>

big thank to:

* honk honk
* austin, tx
* kris kringle
* smog squad
* `git clone`

yee

\ (•◡•) /
