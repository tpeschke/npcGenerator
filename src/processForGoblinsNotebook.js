export default function processForGoblinsNotebook(npc) {

    function processIntoString(array) {
        return array.map((element, index) => element ? '* ' + element.value + `${index === array.length - 1 ? '  ' : ' \n'}` : `* ${index === array.length - 1 ? ' ' : ' \n'}`).join('')
    }

    function capitalizeFirstLetter(word) {
        if (!word) { return word }
        const firstLetter = word.charAt(0)
        const firstLetterCap = firstLetter.toUpperCase()
        const remainingLetters = word.slice(1).toLowerCase()
        return firstLetterCap + remainingLetters
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

## Relationships
${processIntoString(npc.characteristics.devotions)}

## Reputation
*  

## Injuries & Burdens
*   

## Misc
**Gender** ${capitalizeFirstLetter(npc.gender)}   
**Race** ${npc.ancestry === 'temple' ? 'Human' : capitalizeFirstLetter(npc.ancestry)} ${npc.ancestry === 'human' ? `(${capitalizeFirstLetter(npc.nation)})` : ''}  

## Background
*  `
}