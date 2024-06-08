export default function processForWorldAnvil(npc) {

  function processIntoString(array) {
    return array.map((element, index ) => element ? '- ' + element.value + `${index === array.length-1 ? '' : '\n'}` : `- ${index === array.length-1 ? '' : '\n'}`).join('')
  }

  return `[h1]Quick Reference[/h1]
[row]
  [col]
  [b](Fatigue) Vitality[/b]: ( ? ) ?
  [/col]
  [col]
  [b](Panic) Stress Threshold[/b]: ( ? ) ?
  [/col]
[/row]
[b]Caution[/b]: ?
[row]
[section:confrontationBonusSection]+/-X[/section]
  [col3]
  [h2]Descriptions[/h2]
${processIntoString(npc.characteristics.descriptions)}
  [h2]Injuries[/h2]
- 
  [h2]Reputation[/h2]
- 
  [/col3]
  [col3]
  [h2]Goals[/h2]
- 
  [h2]Convictions[/h2]
${processIntoString(npc.characteristics.convictions)}
[h2]Devotions[/h2]
${processIntoString(npc.characteristics.devotions)}
  [/col3]
  [col3]
  [h2]Flaws[/h2]
  ${processIntoString(npc.characteristics.flaws)}
  [h2]Burdens[/h2]
- 
  [/col3]
[/row]

[row]
  [col]
  [h1]Contacts[/h1]
- 
  [/col]
  [col]
  [h1]Equipment[/h1]
None worth mentioning.
  [/col]
[/row]

[h1]Other Info[/h1]
- Link to full Character Sheet here
- Age: ?
[br]
[h1]History[/h1]
- `
}