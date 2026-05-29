# ? Rive Mascot

Art direction and motion spec:

```text
public/assets/mascot/PET_ART_DIRECTION.md
```

Place the production Rive file here:

```text
public/assets/mascot/cat.riv
```

The React mascot bridge expects:

```text
State machine: State Machine 1
```

Inputs:

```text
emotion: number
isThinking: boolean
isSleeping: boolean
isSad: boolean
triggerHappy: trigger
triggerExcited: trigger
```

Emotion number mapping:

```text
0 idle
1 happy / love / listening
2 thinking / typing
3 sleeping
4 sad / warning / error
5 excited / celebrating
```

Until `cat.riv` is provided, the app gracefully falls back to the static cat image.

After adding `cat.riv`, enable it in:

```text
public/assets/mascot/mascot-config.json
```

Set:

```json
{
  "enabled": true
}
```
