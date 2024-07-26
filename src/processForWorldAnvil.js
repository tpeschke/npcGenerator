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
[b]Caution[/b]: ?[br]
[subcontainer:b6f707d5-068e-4c7e-bdbc-2225c8dc93d9]
[section:confrontationBonusSection]@[+/-?](article:46d90ac6-a528-4430-bc0e-49ba76fcd575)[/section]
[/subcontainer]
[subcontainer:e90e5d79-7ab6-410d-b68f-9ec2a60ed99f]
[section:confrontationBonusSection]@[+/-?%](article:46d90ac6-a528-4430-bc0e-49ba76fcd575)[/section]
[/subcontainer]
[row]
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
[h2]Relationships[/h2]
${processIntoString(npc.characteristics.devotions)}
  [/col3]
  [col3]
  [h2]Flaws[/h2]
${processIntoString(npc.characteristics.flaws)}
  [h2]Burdens[/h2]
- 
  [/col3]
[/row]
[subcontainer:b6f707d5-068e-4c7e-bdbc-2225c8dc93d9]
[h2]Bonfire West March Standings[/h2]
@[Standing Rules](article:3a61c5b9-9f99-43f2-a836-60f7f56ee609)
- 
[/subcontainer]
[subcontainer:e90e5d79-7ab6-410d-b68f-9ec2a60ed99f]
[h2]HackMaster West March Standings[/h2]
@[Standing Rules](article:3a61c5b9-9f99-43f2-a836-60f7f56ee609)
- 
[/subcontainer]

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
[container:timelineArticles]
/* [articleblock:3faf7576-8d63-484c-a657-8dd20595c5ab] */
[/container]`
}