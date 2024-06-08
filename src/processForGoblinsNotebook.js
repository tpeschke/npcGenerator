export default function processForGoblinsNotebook(npc) {

    function processIntoString(array) {
        return array.map((element, index) => element ? '* ' + element.value + `${index === array.length - 1 ? '  ' : ' \n'}` : `* ${index === array.length - 1 ? ' ' : ' \n'}`).join('')
    }

    return `# $[objectname]
+/-3
+/-6
+/-9
+/-12
## Goals  
*  

## Description
${processIntoString(npc.characteristics.descriptions)}

## Convictions
${processIntoString(npc.characteristics.convictions)}

## Flaws
${processIntoString(npc.characteristics.flaws)}

## Devotions
${processIntoString(npc.characteristics.devotions)}

## Reputation
*  

## Injuries & Burdens
*   

## Misc
**Gender**  
**Race**  
**Vitality**    
**Stress Threshold** 30  
**Panic**  

## Background
*  `
}