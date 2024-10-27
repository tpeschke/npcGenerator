const config = require('./config')
    , axios = require('axios')
    , he = require('he')
const { sendErrorForwardNoFile, checkForContentTypeBeforeSending } = require('./helpers')
const sendErrorForward = sendErrorForwardNoFile('npc controller')

let characteristicsCache = {}

npcController = {
    createNPC: (req, res) => {
        let { gender, ancestry, nation } = req.query
        gender = gender ? gender : getRandomElement(['male', 'female']);
        ancestry = ancestry ? ancestry : getRandomElement(['human', 'elf', 'orc']);
        nation = nation ? nation : findNation(ancestry);

        let characteristics = setUpCharacteristicArray()

        axios.get(config.writingExercisesEndpoint).then(weResults => {
            characteristics = populateCharacteristicArray(characteristics, ancestry === 'temple' || ancestry === 'clan' ? characteristicsCache.human : characteristicsCache[ancestry], ancestry, nation, weResults.data.split(/[\s|\s,|.]+/)[0])

            if (ancestry === 'elf') {
                checkForContentTypeBeforeSending(res, { name: getElfName(), gender, ancestry, characteristics, nation })
            } else if (ancestry === 'clan') {
                axios.get(config.behindTheNameEndpoints.clan.notStated).then(results => {
                    let name = results.data.split('random-results')[1].split('class="plain">')[1].split('</a>')[0]
                    name = he.decode(name).normalize("NFD").replace(/[\u0300-\u036f]/g, "")
                    if (ancestry === 'human') {
                        name = vowelRepace(name, nation)
                    }

                    checkForContentTypeBeforeSending(res, { name, gender, ancestry, characteristics, nation })
                }).catch(e => sendErrorForward('behind the name', "Couldn't find a name", res))
            } else {
                axios.get(config.behindTheNameEndpoints[ancestry][gender]).then(results => {
                    let name = results.data.split('random-results')[1].split('class="plain">')[1].split('</a>')[0]
                    name = he.decode(name).normalize("NFD").replace(/[\u0300-\u036f]/g, "")
                    if (ancestry === 'human') {
                        name = vowelRepace(name, nation)
                    }

                    checkForContentTypeBeforeSending(res, { name, gender, ancestry, characteristics, nation })
                }).catch(e => sendErrorForward('behind the name', "Couldn't find a name", res))
            }
        })
    },
    setCharacteristics: function (characteristics) {
        characteristicsCache = characteristics
    }
}

function getRandomElement(array) {
    return array[Math.floor(Math.random() * array.length)];
}

function getElfName() {
    const syllableRegex = /[^aeiouy]*[aeiouy]+(?:[^aeiouy]*$|[^aeiouy](?=[^aeiouy]))?/gi;
    const baseName = elfNames[Math.floor(Math.random() * elfNames.length)]
    const brokenName = baseName.match(syllableRegex)
    const lowerCaseName = brokenName[Math.floor(Math.random() * brokenName.length)]
    return lowerCaseName.charAt(0).toUpperCase() + lowerCaseName.slice(1);
}

function isVowel(x) {
    return (x === "a" || x === "e" || x === "i" || x === "o" || x === "u");
}

function capitalizeFirstLetter(word) {
    if (!word) {return null}
    const firstLetter = word.charAt(0)
    const firstLetterCap = firstLetter.toUpperCase()
    const remainingLetters = word.slice(1).toLowerCase()
    return firstLetterCap + remainingLetters
}

const vowelRepace = (name, nation) => {
    name = name.toLowerCase()
    const wordArray = name.split('')

    const nationVowelDictionary = {
        pfaets: {
            'a': 'a',
            'e': 'i',
            'i': 'e',
            'o': 'u',
            'u': 'y',
            'y': 'o'
        },
        vipling: {
            'a': 'e',
            'e': 'i',
            'i': 'y',
            'o': 'a',
            'u': 'a',
            'y': 'u'
        },
        rhone: {
            'a': 'e',
            'e': 'i',
            'i': 'y',
            'o': 'a',
            'u': 'u',
            'y': 'o'
        },
        zwek: {
            'a': 'e',
            'e': 'i',
            'i': 'i',
            'o': 'u',
            'u': 'o',
            'y': 'a'
        },
        knach: {
            'a': 'a',
            'e': 'i',
            'i': 'o',
            'o': 'u',
            'u': 'y',
            'y': 'e'
        },
        drangsdt: {
            'a': 'y',
            'e': 'a',
            'i': 'e',
            'o': 'i',
            'u': 'o',
            'y': 'u'
        },
        lussk: {
            'a': 'e',
            'e': 'o',
            'i': 'u',
            'o': 'y',
            'u': 'i',
            'y': 'a'
        }
    }
    let finalWord = wordArray.map(letter => {
        if (isVowel(letter)) {
            return nationVowelDictionary[nation][letter]
        } else {
            return letter
        }
    }).join('')

    return capitalizeFirstLetter(finalWord)
}

function setUpCharacteristicArray() {
    const intConvictionsDictionary = {
        1: 1,
        2: 2,
        3: 2,
        4: 3,
        5: 3,
        6: 3,
        7: 4,
        8: 4,
        9: 4,
        10: 4,
        11: 4,
        12: 4,
        13: 4,
        14: 5,
        15: 5,
        16: 5,
        17: 6,
        18: 6,
        19: 7,
        20: 7,
        21: 8,
        22: 8,
        23: 8
    }

    const int = (Math.floor(Math.random() * 6) + 1) + (Math.floor(Math.random() * 6) + 1) + (Math.floor(Math.random() * 6) + 1)

    let characteristicsArray = {
        convictions: [],
        descriptions: [null, null, null],
        devotions: [null, null, null],
        flaws: [null, null, null]
    }

    for (let i = 0; i < intConvictionsDictionary[int]; i++) {
        characteristicsArray.convictions[i] = null
    }

    return characteristicsArray
}

function findNation(ancestry) {
    if (ancestry === 'human') {
        return getRandomElement(['drangsdt', 'knach', 'lussk', 'pfaets', 'rhone', 'vipling', 'zwek'])
    } else if (ancestry === 'orc') {
        return getRandomElement(['szabolck', 'bok', 'gyisk', 'lokckkorsik', 'prermuk', 'totsok', 'vorhut', 'certek', 'dunk', 'mersk', 'potk', 'sok', 'suldk', 'voltk'])
    } else if (ancestry === 'elf') {
        return getRandomElement(['ail', 'geny', 'hern', 'inar', 'navar', 'orym', 'phas', 'rhan', 'rhoth', 'ruil', 'tiar', 'ual', 'qinn', 'sylv'])
    }
    return null
}

function populateCharacteristicArray(characteristicsArray, ancestryInfo, ancestry, nation, randomDescription) {
    // ancestry specific
    characteristicsArray = setStrength(characteristicsArray, ancestryInfo, ancestry, nation)
    characteristicsArray.flaws = populateSpecificCharacteristic(characteristicsArray.flaws, [ancestryInfo.flaw], false, 0)

    characteristicsArray.descriptions = populateSpecificCharacteristic(characteristicsArray.descriptions, ancestryInfo.descriptions, true, null)
    characteristicsArray.convictions = populateSpecificCharacteristic(characteristicsArray.convictions, ancestryInfo.convictions, true, null)
    characteristicsArray.devotions = populateSpecificCharacteristic(characteristicsArray.devotions, ancestryInfo.devotions, true, null)

    // culture specific
    if (ancestry === 'human') {
        characteristicsArray = setHumanCharacteristics(characteristicsArray, nation)
    } else if (ancestry === 'orc') {
        characteristicsArray = setOrcCharacteristics(characteristicsArray, nation)
    } else if (ancestry === 'elf') {
        characteristicsArray = setElfCharacteristics(characteristicsArray, nation)
    }

    // random characteristic
    const randomType = getRandomElement(['descriptions', 'convictions', 'devotions', 'flaws'])
    characteristicsArray[randomType] = populateSpecificCharacteristic(characteristicsArray[randomType], [randomDescription], true, null, randomType !== 'descriptions')

    return characteristicsArray
}

function populateSpecificCharacteristic(specificArray, arrayOfPossibilities, canBeReversed, specificIndex, isBold = null) {
    let characteristic = capitalizeFirstLetter(getRandomElement(arrayOfPossibilities))

    if (canBeReversed) {
        Math.random() < 0.5 ? characteristic += ` - ${characteristic.split("").reverse().join("")}` : null
    }

    if (specificIndex || specificIndex === 0) {
        specificArray[specificIndex] = { value: characteristic, isBold }
    } else {
        specificArray[returnNullIndex(specificArray)] = { value: characteristic, isBold }
    }

    return specificArray
}

function returnNullIndex(specificArray) {
    let indexArray = []
    for (i = 0; i < specificArray.length; i++) {
        if (!specificArray[i]) {
            indexArray.push(i)
        }
    }

    if (indexArray.length === 0) {
        return specificArray.length
    } else {
        return getRandomElement(indexArray)
    }
}

function setStrength(characteristicsArray, ancestryInfo, ancestry, nation) {
    if (ancestry === 'human') {
        const humanStrengthDictionary = {
            drangsdt: 'A Follower',
            knach: 'A Generous Person',
            lussk: 'A Watcher',
            pfaets: 'A Patient Person',
            rhone: 'A Wiseman',
            vipling: 'A Free Man',
            zwek: 'An Engineer'
        }
        characteristicsArray.strength = humanStrengthDictionary[nation]
    } else if (ancestry === 'orc') {
        const orcStrengthDictionary = {
            szabolck: 'A leader who brings people together', 
            bok: 'A leader who owns land and wealth', 
            gyisk: 'A leader who encourages people to keep going', 
            lokckkorsik: 'A leader who binds people together', 
            prermuk: 'A leader who people want to be in charge', 
            totsok: 'A leader who fights and keeps others fighting', 
            vorhut: 'One who has a way with words', 
            certek: 'A leader who smarter than everyone else', 
            dunk: 'A leader who provides for their followers', 
            mersk: 'A leader who teaches others', 
            potk: 'A leader who serves as an example', 
            sok: 'A leader who keeps their oaths', 
            suldk: 'A leader who can control others', 
            voltk: 'A leader who provides for those below them'
        }
        characteristicsArray.strength = orcStrengthDictionary[nation]
    } else if (ancestry === 'elf') {
        characteristicsArray.strength = 'A mystic'
    } else {
        characteristicsArray.strength = ancestryInfo.strength
    }

    return characteristicsArray
}

function setHumanCharacteristics(characteristicsArray, nation) {
    const humanCharacteristicsDictionary = {
        drangsdt: {
            descriptions: ['Taciturn', 'sly'],
            convictions: ['It is only through utility that a thing has value'],
            devotions: ['The State/Faithful']
        },
        knach: {
            descriptions: ['willful', 'adaptable'],
            convictions: ['No half messures'],
            devotions: ['Immediate Family']
        },
        lussk: {
            descriptions: ['earnest', 'deliberate'],
            convictions: ['when you think you have nothing left to see, your eyes are useless'],
            devotions: ['Who you take care of']
        },
        pfaets: {
            descriptions: ['Smart', 'crafty'],
            convictions: ['reputation is everything so safeguard it'],
            devotions: ['Anyone you gave your word to']
        },
        rhone: {
            descriptions: ['unbreakable', 'peaceful'],
            convictions: ['Survival is about teamwork'],
            devotions: ['Your tribe']
        },
        vipling: {
            descriptions: ['honorable', 'commanding'],
            convictions: ['freedom is worth any price'],
            devotions: ['People you\'ve fought alongside']
        },
        zwek: {
            descriptions: ['cheerful', 'thoughtful'],
            convictions: ['to build is the greatest thing a man can do'],
            devotions: ['Your neighbors']
        }
    }

    characteristicsArray.descriptions = populateSpecificCharacteristic(characteristicsArray.descriptions, humanCharacteristicsDictionary[nation].descriptions, true, null)
    characteristicsArray.convictions = populateSpecificCharacteristic(characteristicsArray.convictions, humanCharacteristicsDictionary[nation].convictions, true, null)
    characteristicsArray.devotions = populateSpecificCharacteristic(characteristicsArray.devotions, humanCharacteristicsDictionary[nation].devotions, true, null)

    return characteristicsArray
}

function setOrcCharacteristics(characteristicsArray, nation) {
    const orcCharacteristicsDictionary = {
        szabolck: {
            descriptions: ['open-minded'],
            convictions: ['Speak softly and carry a big stick'],
            devotions: ['Keeps the peace']
        },
        bok: {
            descriptions: ['Proud'],
            convictions: ['Orcs are a breed apart'],
            devotions: ['Loves prestige']
        },
        gyisk: {
            descriptions: ['Zealous'],
            convictions: ['Hear all, say nothing'],
            devotions: ['Admires endurance']
        },
        lokckkorsik: {
            descriptions: ['Hedonist'],
            convictions: ['Do not sell your soul to things'],
            devotions: ['Desires a world without humans and elves']
        },
        prermuk: {
            descriptions: ['Inventive'],
            convictions: ['An enemy who becomes a friend is better than a dead enemy'],
            devotions: ['Wants to be on top']
        },
        totsok: {
            descriptions: ['Disciplined'],
            convictions: ['Make your point with words and actions'],
            devotions: ['Careful about their duties']
        },
        vorhut: {
            descriptions: ['Mystical'],
            convictions: ['The snows bury the mountain but they cannot destroy it'],
            devotions: ['Cultivates knowledge']
        },
        certek: {
            descriptions: ['Stoic'],
            convictions: ['Trust rarely but when you do trust, trust completely'],
            devotions: ['Hates the Bok']
        },
        dunk: {
            descriptions: ['Brutal'],
            convictions: ['Things which seem difficult become easy if you use your brains'],
            devotions: ['Dreams of the good life']
        },
        mersk: {
            descriptions: ['Free'],
            convictions: ['Fight fair and you will also find friends'],
            devotions: ['Seeks to hone themselves']
        },
        potk: {
            descriptions: ['Iconoclastic'],
            convictions: ['The sun will soon set'],
            devotions: ['Wants a home']
        },
        sok: {
            descriptions: ['Circumspect'],
            convictions: ['Making a friend is doubling your strength'],
            devotions: ['Channels aggression into passion']
        },
        suldk: {
            descriptions: ['Scrappy'],
            convictions: ['By hook or by crook'],
            devotions: ['Does what they must']
        },
        voltk: {
            descriptions: ['Brave'],
            convictions: ['Try and try again'],
            devotions: ['Never breaks their oaths']
        }
    }

    characteristicsArray.descriptions = populateSpecificCharacteristic(characteristicsArray.descriptions, orcCharacteristicsDictionary[nation].descriptions, true, null)
    characteristicsArray.convictions = populateSpecificCharacteristic(characteristicsArray.convictions, orcCharacteristicsDictionary[nation].convictions, true, null)
    characteristicsArray.devotions = populateSpecificCharacteristic(characteristicsArray.devotions, orcCharacteristicsDictionary[nation].devotions, true, null)

    return characteristicsArray
}

function setElfCharacteristics(characteristicsArray, nation) {
    const elfCharacteristicsDictionary = {
        ail: {
            convictions: ['Priorities are important'],
            devotions: ['Afraid of orcs', 'doesn\'t care about humans']
        },
        geny: {
            convictions: ['You can\'t long for a future that probably won\'t happen'],
            devotions: ['Tired of elves\' behavior']
        },
        hern: {
            convictions: ['Move on and grow'],
            devotions: ['Cares about humans']
        },
        inar: {
            convictions: ['The fight shows your mettle'],
            devotions: ['Feels superior to others']
        },
        navar: {
            convictions: ['First thing is first'],
            devotions: ['Willing to die for their Conference']
        },
        orym: {
            convictions: ['Orcs are the sword of elves\' vengence'],
            devotions: ['Tired of elves\' bickering']
        },
        phas: {
            convictions: ['There is always a long road ahead'],
            devotions: ['Tolerates humans', 'jealous of orcs']
        },
        rhan: {
            convictions: ['The quality of your enemies determines your quality'],
            devotions: ['Holds disdain for humans']
        },
        rhoth: {
            convictions: ['Fight quietly to keep fighting'],
            devotions: ['Finds the weak spot']
        },
        ruil: {
            convictions: ['The bee can bring down a man'],
            devotions: ['Chooses their companions carefully']
        },
        tiar: {
            convictions: ['You are your core, not outer signifiers'],
            devotions: ['Admires orcs', 'looks down on humans']
        },
        ual: {
            convictions: ['Only through perfection can one be free'],
            devotions: ['Above petty squabbles']
        },
        qinn: {
            convictions: ['Today is yours but tomorrow is mine'],
            devotions: ['Seeks to weaken their enemies']
        },
        sylv: {
            convictions: ['All things belong to the elves'],
            devotions: ['Seeks out conflict']
        }
    }

    characteristicsArray.convictions = populateSpecificCharacteristic(characteristicsArray.convictions, elfCharacteristicsDictionary[nation].convictions, true, null)
    characteristicsArray.devotions = populateSpecificCharacteristic(characteristicsArray.devotions, elfCharacteristicsDictionary[nation].devotions, true, null)

    return characteristicsArray
}

const elfNames = ["balar", "banise", "bella", "beros", "can", "caryn", "ceran", "cyne", "dan", "di", "dithas", "dove", "faren", "fiel", "fina", "fir", "geiros", "gella", "golor", "gwyn", "hana", "harice", "hice", "horn", "jeon", "jor", "jyre", "kalyn", "kas", "kian", "krana", "lamin", "lana", "lar", "lee", "len", "leth", "lynn", "maer", "maris", "menor", "moira", "myar", "mys", "na", "nala", "nan", "neiros", "nelis", "norin", "peiros", "petor", "phine", "phyra", "qen", "qirelle", "quinal", "ra", "ralei", "ran", "rel", "ren", "ric", "rie", "rieth", "ris", "ro", "rona", "rora", "roris", "salor", "sandoral", "satra", "stina", "sys", "thana", "thyra", "toris", "tris", "tumal", "valur", "varis", "ven", "vyre", "warin", "wenys", "wraek", "wynn", "xalim", "xidor", "xina", "xisys", "yarus", "ydark", "ynore", "yra", "zana", "zeiros", "zorwyn", "zumin", "Adorellan", "Adresin", "Aelrindel", "Aenwyn", "Aerendyl", "Aerith", "Aien", "Ailen", "Ailre", "Aimer", "Aire", "Aithlin", "Alaion", "Alais", "Alanis", "Alasse", "Alosrin", "Amra", "Amrynn", "Aneirin", "Anfalen", "Anhaern", "Anlyth", "Arbane", "Ardreth", "Arel", "Ariawyn", "Arryn", "Arthion", "Artin", "Ashryn", "Aubron", "Avourel", "Axilya", "Ayen", "Aymer", "Ayre", "Aywin", "Azariah", "Bellas", "Bemere", "Bialaer", "Caeda", "Calarel", "Chaenath", "Ciliren", "Ciradyl", "Cithrel", "Cohnal", "Conall", "Cornaith", "Cyran", "Dain", "Darunia", "Ehlark", "Ehrendil", "Elaith", "Elandorr", "Elanil", "Elas", "Elauthin", "Eldaerenth", "Eldrin", "Elen", "Elidyr", "Elion", "Elisen", "Ellisar", "Elluin", "Elnaril", "Elpharae", "Elred", "Elyon", "Emmyth", "Erendriel", "Eroan", "Estelar", "Faelyn", "Falael", "Falenas", "Farryn", "Felaern", "Feno", "Filaurel", "Filverel", "Folen", "Folre", "Fylson", "Gaeleath", "Gaelin", "Gaerradh", "Galan", "Goras", "Goren", "Gweyir", "Haemir", "Halaema", "Halamar", "Haldir", "Halueth", "Halueve", "Hamon", "Horith", "Hycis", "Iefyr", "Ilbryen", "Iliphar", "Ilphas", "Imizael", "Inchel", "Irhaal", "Isarrel", "Isilynor", "Ithronel", "Ivasaar", "Jandar", "Jassin", "Jhaan", "Jorildyn", "Kailu", "Katar", "Keenor", "Kelvhan", "Kendel", "Keryth", "Kharis", "Khidell", "Khiiral", "Khyrmin", "Kilyn", "Kindreth", "Kymil", "Laeroth", "Larrel", "Lathlaeril", "Lazziar", "Lethonel", "Lhoris", "Lierin", "Llewel", "Lorsan", "Lyari", "Lysanthir", "Maeral", "Maiele", "Malon", "Malonne", "Merellien", "Meriel", "Merith", "Methild", "Micaiah", "Mirthal", "Mnementh", "Myrdin", "Myriil", "Myrin", "Myrrh", "Naesala", "Naevys", "Namys", "Narbeth", "Nasir", "Navarre", "Nelaeryn", "Neremyn", "Nesterin", "Nhamashal", "Nieven", "Nithenoel", "Nueleth", "Nuovis", "Nym", "Orym", "Paeral", "Paeris", "Pelleas", "Phraan", "Rathiain", "Rennyn", "Rhalyf", "Riluaneth", "Rolim", "Ruehnar", "Ruvaen", "Ruven", "Ruvyn", "Ryllae", "Ryo", "Saelethil", "Saelihn", "Saevel", "Saida", "Saleh", "Sanev", "Selanar", "Shalaevar", "Shandalar", "Sharian", "Sinaht", "Sylmare", "Sylvar", "Syvis", "Taenaran", "Taeral", "Tamnaeth", "Tanathil", "Tannatar", "Tannyll", "Tanyl", "Tanyth", "Taranth", "Tarathiel", "Thalanil", "Thallan", "Tyrael", "Uneathen", "Vaeril", "Vamir", "Venali", "Virion", "Vulen", "Vulmar", "Vulmer", "Vulwin", "Wirenth", "Wynather", "Yesanith", "Zeno", "Ad", "Ae", "Ara", "Bal", "Bei", "Bi", "Bry", "Cai", "Car", "Chae", "Cra", "Da", "Dae", "Dor", "Eil", "El", "Ela", "En", "Er", "Fa", "Fae", "Far", "Fen", "Gen", "Gil", "Glyn", "Gre", "Hei", "Hele", "Her", "Hola", "Ian", "Iar", "Ili", "Ina", "Jo", "Kea", "Kel", "Key", "Kris", "Leo", "Lia", "Lora", "Lu", "Mag", "Mia", "Mira", "Mor", "Nae", "Neri", "Nor", "Ola", "Olo", "Oma", "Ori", "Pa", "Per", "Pet", "Phi", "Pres", "Qi", "Qin", "Qui", "Ralo", "Rava", "Rey", "Ro", "Sar", "Sha", "Syl", "The", "Tor", "Tra", "Tris", "Ula", "Ume", "Uri", "Va", "Val", "Ven", "Vir", "Waes", "Wran", "Wyn", "Wysa", "Xil", "Xyr", "Yel", "Yes", "Yin", "Ylla", "Zin", "Zum", "Zyl", "Aelrie", "Aelua", "Aelynthi", "Aenwyn", "Aerilaya", "Aerith", "Ahrendue", "Ahshala", "Aila", "Alagossa", "Alais", "Alanis", "Alasse", "Alavara", "Alea", "Aleesia", "Alenia", "Aleratha", "Allannia", "Allisa", "Alloralla", "Allynna", "Almedha", "Almithara", "Alvaerelle", "Alyndra", "Amara", "Amaranthae", "Amarille", "Amedee", "Ameria", "Amisra", "Amnestria", "Amra", "Anarzee", "Aneirin", "Anhaern", "Annallee", "Ara", "Arasne", "Aravae", "Arcaena", "Ariawyn", "Arilemna", "Arlayna", "Arnarra", "Arryn", "Arthion", "Artin", "Ashera", "Ashryn", "Aurae", "Ava", "Axilya", "Ayda", "Ayla", "Azariah", "Baerinda", "Bellaluna", "Bemere", "Bonaluria", "Burolia", "Caeda", "Caerthynna", "Calarel", "Celaena", "Cellica", "Chaenath", "Chalia", "Chalsarda", "Chamylla", "Chandrelle", "Chasianna", "Ciliren", "Ciradyl", "Cithrel", "Clanire", "Cremia", "Daethie", "Daratrine", "Darshee", "Darunia", "Dasyra", "Delimira", "Delsanra", "Dessielle", "Deulara", "Dilya", "Dirue", "Ealirel", "Ecaeris", "Edea", "Edraele", "Eirina", "Elanalue", "Elanil", "Elasha", "Elenaril", "Eletha", "Elincia", "Elisen", "Eliyen", "Ellarian", "Elmyra", "Eloimaya", "Elora", "Elyon", "Ena", "Enania", "Eshenesra", "Esiyae", "Essaerae", "Esta", "Falenas", "Faraine", "Farryn", "Faunalyn", "Fayeth", "Faylen", "Fhaertala", "Filaurel", "Filauria", "Fildarae", "Finnea", "Gaelira", "Gaerradh", "Gaylia", "Geminara", "Ghilanna", "Glynnii", "Gweyir", "Gwynnestri", "Gylledhia", "Haciathra", "Haera", "Halaema", "Halanaestra", "Hamalitia", "Haramara", "Helartha", "Holone", "Huethea", "Hycis", "Ialantha", "Ikeshia", "Ildilyntra", "Ilmadia", "Ilsevel", "Ilyana", "Ilyrana", "Ilythyrra", "Imizael", "Immianthe", "Imra", "Imryll", "Ioelena", "Irhaal", "Isarrel", "Isilynor", "Ithronel", "Itireae", "Itylara", "Jastira", "Jeardra", "Jhaerithe", "Jhanandra", "Jhilsara", "Kali", "Kasula", "Kavrala", "Kaylessa", "Kaylin", "Keenor", "Keerla", "Keishara", "Kenia", "Kethryllia", "Keya", "Kilyn", "Kylantha", "Kythaela", "Laamtora", "Laerdya", "Lazziar", "Leena", "Leilatha", "Lenna", "Lensa", "Lethhonel", "Lierin", "Liluth", "Lithoniel", "Lixiss", "Llamiryl", "Llorva", "Loreleia", "Lura", "Lusha", "Lusserina", "Lyeecia", "Lyeneru", "Lymseia", "Lyndis", "Lyra", "Lyrei", "Lythienne", "Madris", "Maelyrra", "Maeralya", "Maescia", "Makaela", "Malonne", "Malruthiia", "Mariona", "Mathienne", "Maylin", "Meira", "Melarue", "Meorise", "Merethyl", "Merialeth", "Meriel", "Merlara", "Mhoryga", "Micaiah", "Minuvae", "Muelara", "Myantha", "Mylaela", "Mylaerla", "Myriani", "Myrrh", "Nabeora", "Naesala", "Naevys", "Naexi", "Nakiasha", "Nalaea", "Nambra", "Namys", "Nanthaliene", "Neia", "Nephinae", "Nimeroni", "Nimue", "Nithenoel", "Nithroel", "Nuala", "Nueleth", "Nuovis", "Nushala", "Nyana", "Nylathria", "Ochilysse", "Omylia", "Osonia", "Penelo", "Phaerille", "Phelorna", "Phinara", "Phyrra", "Pyria", "Qamara", "Radelia", "Raenisa", "Rallientha", "Rania", "Ratha", "Rathiain", "Renestrae", "Renna", "Rina", "Riniya", "Rophalin", "Rosanhi", "Rosaniya", "Roshia", "Rubarae", "Ryllae", "Saelihn", "Saida", "Sakaala", "Salihn", "Sana", "Saphielle", "Saria", "Sariandi", "Sarya", "Seldanna", "Selphie", "Selussa", "Shael", "Shaerra", "Shalaevar", "Shalana", "Shalendra", "Shalheira", "Shalia", "Shanaera", "Shandalar", "Shanyrria", "Shelara", "Shenarah", "Sillavana", "Sionia", "Siora", "Siphanien", "Siraye", "Solana", "Soliana", "Sorisana", "Sumina", "Syllia", "Sylmare", "Symania", "Syndra", "Syvis", "Taenya", "Talanashta", "Talindra", "Tanelia", "Tanila", "Tanulia", "Tarasynora", "Tehlarissa", "Tephysea", "Teriani", "Thaciona", "Thalia", "Thaola", "Thasinia", "Thessalia", "Tialha", "Tinesi", "Tiriana", "Tisha", "Tsarra", "Tyrael", "Ulesse", "Umilythe", "Uneathen", "Urricea", "Usamea", "Vaeri", "Valindra", "Vanya", "Vasati", "Velatha", "Verrona", "Vestele", "Vianola", "Viessa", "Wynather", "Yaereene", "Yalanue", "Yathanae", "Ygannea", "Ynaselle", "Yralissa", "Yrathea", "Yrneha", "Ysildea", "Yumanea", "Yunaesa", "Zaleria", "Zentha", "Zestari", "Zilyana", "Abarat", "Adamar", "Adorellan", "Adresin", "Aelrindel", "Aerendyl", "Aeson", "Afamrail", "Agandaur", "Agis", "Aias", "Aiduin", "Aien", "Ailas", "Ailduin", "Ailen", "Ailluin", "Ailmar", "Ailmer", "Ailmon", "Ailre", "Ailred", "Ailuin", "Ailwin", "Aimar", "Aimer", "Aimon", "Airdan", "Aire", "Aired", "Aithlin", "Aiwin", "Akkar", "Alabyran", "Alaion", "Alas", "Alen", "Alinar", "Alluin", "Almar", "Almer", "Almon", "Alok", "Alosrin", "Alre", "Alred", "Althidon", "Alwin", "Amrynn", "Andrathath", "Anfalen", "Anlyth", "Aolis", "Aquilan", "Arathorn", "Arbane", "Arbelladon", "Ardreth", "Ardryll", "Arel", "Arlen", "Arun", "Ascal", "Athtar", "Aubron", "Aumanas", "Aumrauth", "Avourel", "Ayas", "Ayduin", "Ayen", "Ayluin", "Aymar", "Aymer", "Aymon", "Ayre", "Ayred", "Aywin", "Belanor", "Beldroth", "Bellas", "Beluar", "Biafyndar", "Bialaer", "Braern", "Cailu", "Camus", "Castien", "Chathanglas", "Cohnal", "Conall", "Connak", "Cornaith", "Corym", "Cyran", "Dain", "Dakath", "Dalyor", "Darcassan", "Darfin", "Darthoridan", "Darunia", "Deldrach", "Delmuth", "Delsaran", "Devdan", "Drannor", "Druindar", "Durlan", "Durothil", "Dyffros", "Edwyrd", "Edyrm", "Ehlark", "Ehrendil", "Eilauver", "Elaith", "Elandorr", "Elas", "Elashor", "Elauthin", "Eldaerenth", "Eldar", "Eldrin", "Elduin", "Elen", "Elephon", "Elidyr", "Elion", "Elkhazel", "Ellisar", "Elluin", "Elmar", "Elmer", "Elmon", "Elnaril", "Elorshin", "Elpharae", "Elre", "Elred", "Eltaor", "Elwin", "Elyon", "Emmyth", "Entrydal", "Erendriel", "Eriladar", "Erlan", "Erlareo", "Erlathan", "Eroan", "Erolith", "Estelar", "Ethlando", "Ettrian", "Evindal", "Faelar", "Faelyn", "Faeranduil", "Falael", "Felaern", "Fenian", "Feno", "Feyrith", "Fhaornik", "Filarion", "Filvendor", "Filverel", "Flardryn", "Flinar", "Folas", "Folduin", "Folen", "Folluin", "Folmar", "Folmer", "Folmon", "Folre", "Folred", "Folwin", "Fylson", "Gaeleath", "Gaelin", "Galaeron", "Galan", "Galather", "Ganamede", "Gantar", "Garrik", "Garynnon", "Giullis", "Glanduil", "Glarald", "Glorandal", "Goras", "Gorduin", "Goren", "Gorluin", "Gormar", "Gormer", "Gormon", "Gorre", "Gorred", "Gorwin", "Grathgor", "Haemir", "Hagas", "Hagduin", "Hagen", "Hagluin", "Hagmar", "Hagmer", "Hagre", "Hagred", "Hagwin", "Haladavar", "Halafarin", "Halamar", "Haldir", "Halflar", "Halueth", "Halueve", "Hamon", "Haryk", "Hastios", "Hatharal", "Horith", "Hubys", "Iefyr", "Ievis", "Ilbryen", "Ilimitar", "Iliphar", "Illianaro", "Illithor", "Illitran", "Ilphas", "Ilrune", "Ilthuryn", "Ilvisar", "Inchel", "Inialos", "Intevar", "Iolas", "Iolrath", "Itham", "Ivaran", "Ivasaar", "Iymbryl", "Iyrandrar", "Jandar", "Jannalor", "Jaonos", "Jassin", "Jhaan", "Jhaartael", "Jhaeros", "Jonik", "Jorildyn", "Kailu", "Katar", "Katyr", "Kellam", "Kelvhan", "Kendel", "Kerym", "Keryth", "Kesefeon", "Kharis", "Khatar", "Khidell", "Khiiral", "Khilseith", "Khuumal", "Khyrmin", "Kieran", "Kiirion", "Kindroth", "Kivessin", "Klaern", "Kolvar", "Kuskyn", "Kymil", "Kyrenic", "Kyrtaar", "Laeroth", "Lafarallin", "Laiex", "Lamruil", "Larongar", "Larrel", "Lathai", "Lathlaeril", "Lhoris", "Lianthorn", "Llarm", "Llewel", "Lorsan", "Luirlan", "Luthais", "Luvon", "Lyari", "Lyklor", "Lysanthir", "Maeral", "Maiele", "Malgath", "Malon", "Maradeim", "Marikoth", "Marlevaur", "Melandrach", "Merellien", "Merith", "Methild", "Mhaenal", "Mitalar", "Mihangyl", "Miirphys", "Mirthal", "Mlartlar", "Mnementh", "Morthil", "Myrdin", "Myriil", "Myrin", "Mythanar", "Naertho", "Naeryndam", "Naesala", "Narbeth", "Nardual", "Nasir", "Navarre", "Nelaeryn", "Neldor", "Neremyn", "Nesterin", "Nevarth", "Nhamashal", "Nieven", "Nindrol", "Ninleyn", "Ninthalor", "Niossae", "Nuvian", "Nylian", "Nym", "Nyvorlas", "Olaurae", "Onas", "Oncith", "Onvyr", "Orist", "Ornthalas", "Orrian", "Orym", "Otaehryn", "Othorion", "Paeral", "Paeris", "Pelleas", "Phaendar", "Pharom", "Phraan", "Pirphal", "Purtham", "Pyrravyn", "Pywaln", "Qildor", "Raeran", "Raibyn", "Ralnor", "Ranaeril", "Rathal", "Reluraun", "Reluvethel", "Rennyn", "Reptar", "Respen", "Revalor", "Rhalyf", "Rhangyl", "Rhistel", "Rhothomir", "Rhys", "Rilitar", "Riluaneth", "Rolim", "Rothilion", "Ruehnar", "Ruith", "Ruvaen", "Ruven", "Ruvyn", "Rychell", "Rydel", "Ryfon", "Ryo", "Ryul", "Saelethil", "Saevel", "Saleh", "Samblar", "Sanev", "Scalanis", "Selanar", "Sharian", "Shaundyl", "Shyrrik", "Sihnion", "Silvyr", "Simimar", "Sinaht", "Siveril", "Sontar", "Sudryal", "Sundamar", "Sylvar", "Sythaeryn", "Taegen", "Taenaran", "Taeral", "Taerentym", "Taleasin", "Tamnaeth", "Tanithil", "Tannatar", "Tannivh", "Tannyll", "Tanyl", "Tanyth", "Taranath", "Tarathiel", "Taredd", "Tarron", "Tasar", "Tassarion", "Tathaln", "Thalanil", "Thallan", "Theodas", "Theodemar", "Theoden", "Theodluin", "Theodmer", "Theodmon", "Theodre", "Theodred", "Thuridan", "Tiarsus", "Tolith", "Tordynnar", "Toross", "Traeliorn", "Travaran", "Triandal", "Ualiar", "Uevareth", "Uldreyin", "Urdusin", "Usunaar", "Uthorim", "Vaalyun", "Vaeril", "Vamir", "Varitan", "Velethuil", "Venali", "Vesryn", "Vesstan", "Virion", "Volodar", "Voron", "Vuduin", "Vulas", "Vulen", "Vulluin", "Vulmar", "Vulmer", "Vulmon", "Vulre", "Vulred", "Vulwin", "Wirenth", "Wistari", "Wyn", "Wyninn", "Wyrran", "Yalathanil", "Yesanith", "Yhendorn", "Ylyndar", "Zaos", "Zelphar", "Zeno", "Zhoron"]

module.exports = npcController

