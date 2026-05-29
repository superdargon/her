# ? Art Direction

Reference board:

- `C:/Users/A1814/AppData/Local/Temp/3eb1fe46-afe9-4b53-aa89-cf0112c301d5.png`

This document turns the supplied reference board into a production-facing pet art spec for ?.
The goal is not "generic cute cat art". The goal is a companion mascot with readable emotion, repeatable animation logic, and a behavior model that fits a Codex-style desktop pet.

## 1. Core identity

Pet name:

- `软糖`

Species read:

- ragdoll kitten
- fluffy indoor companion
- feminine, soft, clingy, healing

Role in product:

- not a decorative sticker
- not a static emoji
- a presence layer that reacts to the user's return, waiting, chatting, idling, and absence

Codex-style companion interpretation:

- present but not noisy
- affectionate without being hyperactive
- visible emotional feedback when the user acts
- long quiet stretches should still feel alive through subtle motion

## 2. Visual language from the reference

### Silhouette

- large rounded head
- tiny body with tucked front paws
- thick fluffy cheek volume
- short upright ears with dark outline
- oversized tail with darker caramel tip

### Face construction

- extra-large blue eyes with bright white highlight
- tiny pink nose and soft smiling mouth
- blush patches always present on cheeks
- brows are implied through pixel clusters, not drawn lines

### Fur pattern

- base fur: warm cream / ivory
- mask patches: caramel beige on forehead, ears, tail, and back
- outline: cocoa brown, never black
- shadows: dusty mauve-brown, soft and warm

### Accessories

- pink collar
- small gold bell

### Rendering rule

- HD-2D pixel treatment
- clean nearest-neighbor sprite edges
- soft interior shading, not harsh contrast
- cozy daylight palette
- no hard UI-card framing baked into sprite art

## 3. Emotional read of the board

The reference board groups emotion into expression-first poses. The key insight is that this cat does not change shape dramatically; it changes through:

- eye openness
- blush intensity
- ear angle
- paw posture
- mouth curve
- tiny head tilt
- nearby particles

That is the correct direction for ? too: low-amplitude but high-readability changes.

## 4. Canonical view set

Use these four as the stable model sheet:

1. `front`
   Read: default engagement pose, direct eye contact, safest UI portrait.
2. `left`
   Read: walking, listening, following cursor, observing side panel activity.
3. `right`
   Read: mirrored side behavior, patrol, transition motion.
4. `back`
   Read: sleeping corner, shy retreat, low-energy idle, "waiting for you" moments.

Rule:

- front view is the primary companion view
- side views are for locomotion or glance states
- back view should be rare and emotionally meaningful

## 5. Expression set

Mapped from the board's "表情展示" section and normalized for product use.

### `happy`

Visual cues:

- crescent eyes
- open smiling mouth
- lifted cheeks
- warm blush

Product meaning:

- successful reply
- user returned
- daily greeting

### `love`

Visual cues:

- moist shining eyes
- small hearts above head
- paws tucked inward
- shy clingy energy

Product meaning:

- high chat frequency
- subscription success
- strong affection state

### `sad`

Visual cues:

- watery eyes
- mouth flattened
- ears slightly lowered
- body compresses downward

Product meaning:

- long user absence
- ignored state
- conversation loss

### `warning`

Visual cues:

- wide round eyes
- alert symbol above head
- ears upright
- body tense

Product meaning:

- unusual state
- waiting for response
- attention needed, but not catastrophic

### `error`

Visual cues:

- startled round eyes
- puff / frustration symbol
- color temperature slightly cooler

Product meaning:

- API failure
- network failure

### `sleeping`

Visual cues:

- closed eyes
- head droop
- soft speech bubble / drowsy bubble
- low vertical posture

Product meaning:

- night mode
- long inactivity

## 6. Motion system from the board

The board has three motion categories:

- idle
- interact
- move

That is exactly the right structure for production.

### A. Idle loop family

Reference read:

- breathing
- blinking
- tiny head dip
- micro sway

Production rule:

- every idle loop should work at low attention
- 4 to 6 frames is enough
- motion amplitude should stay within 1 to 3 pixels at 64px base

Recommended idle variants:

1. `idle_breathe`
   Use when active but calm.
2. `idle_blink`
   Use as overlay cadence every few seconds.
3. `idle_drowsy`
   Use after inactivity.
4. `idle_look_up`
   Use when the app foregrounds or user hovers nearby.

### B. Interaction family

Reference read:

- petting
- hugging / cling
- eating
- paw interaction
- blushing attention pose

Production rule:

- interaction poses should acknowledge the user, not just animate in place
- paws and face should always point toward the source of affection or object

Recommended interaction set:

1. `petting`
   Trigger: user hover, greeting, affection increase.
2. `clingy_hug`
   Trigger: high trust / high affection.
3. `eating_snack`
   Trigger: reward, feed action, milestone.
4. `paw_tap`
   Trigger: notification nudge, "talk to me" reminder.
5. `blush_wait`
   Trigger: user idle on home screen with pet enabled.

### C. Movement family

Reference read:

- low-body trot
- tail trailing with bounce
- dust / floor puffs

Production rule:

- movement should feel soft and weight-light
- do not animate as a rigid side-scroll sprite
- front legs and tail should carry the rhythm

Recommended move set:

1. `walk_left`
2. `walk_right`
3. `arrive_and_sit`
4. `turn_back`

## 7. FX language

From the reference VFX row:

- hearts
- stars
- flash sparkle
- sleepy bubbles / Zzz
- music notes

Use FX as mood amplifiers, not as the main animation.

### Approved FX mapping

- `happy`: star sparkle, warm glint
- `love`: pink hearts
- `thinking`: tiny orbit bubble or soft dot pulse
- `sleeping`: sleepy bubble / Zzz
- `celebrating`: stars + musical notes
- `error`: small puff / jagged alert pop

Rule:

- FX should appear outside silhouette
- FX should not obscure face
- one FX family per state is enough

## 8. UI icon family from the board

The reference also implies a supporting icon set:

- avatar head
- food bowl
- heart
- bath / clean
- yarn ball
- gift

For ?, this means the mascot system is not only a character sprite set. It should own a mini visual language for:

- mood
- feeding
- care
- play
- rewards

## 9. Scene direction

The board provides three environments:

- cozy day room
- cozy night room
- sunny room

Production interpretation:

- day: normal home dashboard state
- night: sleeping / low-energy / after-hours state
- sunny: happy / welcome-back / celebration state

Room scenes should stay soft and low-contrast so the mascot remains the focal point.

## 10. Codex companion behavior mapping

This is the adaptation layer that makes the pet feel more like a Codex-style companion instead of a generic game pet.

### Emotional temperament

- waits patiently
- notices when you return
- perks up when work succeeds
- gets drowsy when nothing happens for a while
- shows concern on failure, not cartoon panic

### State mapping

- `idle` -> front sit, breathing, neutral eye shine
- `happy` -> front happy, light sparkle
- `thinking` -> seated, head slightly lowered, tiny orbit bubble
- `listening` -> side glance or front attentive, eyes open, still pose
- `typing` -> subtle paw motion or focused front pose
- `love` -> clingy face with hearts
- `sad` -> compressed sit, watery eyes
- `warning` -> alert round eyes, upright ears
- `error` -> startled / puff symbol
- `sleeping` -> curled or drooped seated sleep
- `excited` -> bounce with bright eyes
- `celebrating` -> happy + music / stars

### Memory interpretation

- high affection: clingier face, more blush, more front-facing return pose
- high trust: calmer eye contact, less frantic movement
- high loneliness: slower drooped idle, back/side waiting pose
- high fatigue: sleepy variant appears sooner
- high excitement: more bounce, sparkle, small trot entrances

## 11. Asset production checklist

Use the reference board as the source of truth for proportion and palette.

Required art groups:

1. Model sheet
   - front
   - left
   - right
   - back

2. Expression portraits
   - happy
   - love
   - sad
   - warning
   - error
   - sleeping

3. Idle animation frames
   - idle_breathe_01..06
   - idle_blink_01..04

4. Interaction frames
   - petting_01..04
   - clingy_hug_01..04
   - eating_01..04
   - paw_tap_01..04

5. Move frames
   - walk_left_01..06
   - walk_right_01..06
   - arrive_and_sit_01..04

6. FX sprites
   - heart
   - sparkle
   - flash
   - sleepy_bubble
   - music_note
   - puff_alert

7. Props
   - fish_dry
   - food_can
   - milk_bottle
   - yarn_ball
   - collar
   - bed

## 12. Technical sprite recommendations

Base sprite logic:

- design at `64x64`
- upscale in UI by nearest-neighbor
- keep action frames on fixed canvas to avoid layout shift

Recommended organization:

- `views/` for model sheet angles
- `emotions/` for still expression states
- `idle/` for loop frames
- `interactions/` for response actions
- `move/` for locomotion frames
- `fx/` for particles and symbols
- `rooms/` for backgrounds
- `props/` for item art

## 13. What to avoid

- square icon framing baked into the sprite
- oversaturated neon palette
- black outlines
- exaggerated meme expressions
- stiff RPG-maker walk cycles
- giant VFX that compete with the face
- swapping to a totally different silhouette per mood

## 14. Current asset note

The current project already contains crops derived from the reference board under:

- [manifest.json](D:/1/?/resources/app_extracted/frontend/public/assets/mascot/emotions/manifest.json)
- [reference-crops-preview.png](D:/1/?/resources/app_extracted/frontend/public/assets/mascot/sheets/reference-crops-preview.png)

Those crops are useful as a stopgap reference pack, but they are not yet a full production sprite system.
The next proper step is to redraw or generate clean frame-consistent assets using this document as the spec.
