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
        nation = nation ? nation : ancestry === 'human'?  getRandomElement(['drangsdt', 'knach', 'lussk', 'pfaets', 'rhone', 'vipling', 'zwek']) : null;

        let characteristics = setUpCharacteristicArray()

        axios.get(config.writingExercisesEndpoint).then(weResults => {
            characteristics = populateCharacteristicArray(characteristics, ancestry === 'temple' ? characteristicsCache.human : characteristicsCache[ancestry], ancestry, nation, weResults.data.split(/[\s|\s,|.]+/)[0])
    
            if (ancestry === 'elf') {
                checkForContentTypeBeforeSending(res, { name: getElfName(), gender, ancestry, characteristics, nation })
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
        devotions: [null, null],
        flaws: [null, null, null]
    }

    for (let i = 0; i < intConvictionsDictionary[int]; i++) {
        characteristicsArray.convictions[i] = null
    }

    return characteristicsArray
}

function populateCharacteristicArray(characteristicsArray, ancestryInfo, ancestry, nation, randomDescription) {
    characteristicsArray = setStrength(characteristicsArray, ancestryInfo, ancestry, nation)
    characteristicsArray.flaws[0] = {value: ancestryInfo.temperament}

    if (Math.random() < 0.5) {randomDescription += ` - ${randomDescription.split("").reverse().join("")}`}
    characteristicsArray.descriptions[findNullIndex(characteristicsArray, 'descriptions')] = {value: capitalizeFirstLetter( randomDescription)}

    const characteristicTypes = ['descriptions', 'convictions', 'devotions']

    const firstType = getRandomElement(characteristicTypes)
    const firstCharacteristic = getRandomElement(ancestryInfo[firstType])
    const firstIndex = findNullIndex(characteristicsArray, firstType)
    
    const secondType = getRandomElement(characteristicTypes)
    const secondCharacteristic = getRandomElement(ancestryInfo[secondType])
    const secondIndex = findNullIndex(characteristicsArray, secondType)

    characteristicsArray[firstType][firstIndex] = { value: firstCharacteristic }
    characteristicsArray[secondType][secondIndex] = { value: secondCharacteristic }

    if (ancestry === 'human') {
        characteristicsArray = setHumanCharacteristics(characteristicsArray, nation)
    }

    return characteristicsArray
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
    } else {
        characteristicsArray.strength = ancestryInfo.strength
    }

    return characteristicsArray
}

function setHumanCharacteristics(characteristicsArray, nation) {
    const humanDevotionsDictionary = {
        drangsdt: 'The State/Faithful',
        knach: 'Immediate Family',
        lussk: 'Who you take care of',
        pfaets: 'Anyone you gave your word to',
        rhone: 'Your tribe',
        vipling: 'People you\'ve fought alongside',
        zwek: 'Your neighbors'
    }

    characteristicsArray.devotions.push({ value: humanDevotionsDictionary[nation], isBold: true })

    const humanCharacteristicsDictionary = {
        drangsdt: {
            descriptions: ['Taciturn', 'docile', 'rebellious', 'questioning', 'sly'],
            convictions: ['The Father can give and take all life', 'It is only through utility that a thing has value', 'If it\'s someone else\'s problem, it\'s not yours', 'better to be quiet and live']
        },
        knach: {
            descriptions: ['Passionate', 'willful', 'open-minded', 'adaptable', 'extreme', 'daring'],
            convictions: ['No half messures', 'to fight is to win', 'wherever you go, you\'re in charge', 'strenght is found in embracing the strange', 'a stranger is a friend not yet known']
        },
        lussk: {
            descriptions: ['Stoic', 'earnest', 'intuitive', 'poetic', 'thoughtful', 'deliberate', 'dutiful', 'kind'],
            convictions: ['A man is his duties', 'the less you talk, the more you hear', 'when you think you have nothing left to see, your eyes are useless', 'there is great evil in the world but also great good']
        },
        pfaets: {
            descriptions: ['Smart', 'crafty', 'disagreeable', 'two-faced', 'strong', 'unbreakable'],
            convictions: ['Find those worth fighting for and die for them', 'a man is only as good as his word', 'reputation is everything so safeguard it', 'don\'t let people walk all over you']
        },
        rhone: {
            descriptions: ['Hardy', 'weathered', 'family-oriented', 'hard-working', 'unbreakable', 'peaceful', 'unflappable', 'confident'],
            convictions: ['Survival is about teamwork', 'wisdom pays dividends', 'speak slowly and never regret it', 'violance changes quickly, peace changes permenantly', 'nature is unforgiving']
        },
        vipling: {
            descriptions: ['Confident', 'strong', 'independent', 'honorable', 'agile', 'commanding', 'domineering', 'competitive'],
            convictions: ['To fight is to win', 'battle is the ultimate pleasure', 'freedom is worth any price', 'be yourself', 'nothing is more important than the people you depend on']
        },
        zwek: {
            descriptions: ['Trusting', 'well-muscled', 'cheerful', 'thoughtful', 'taciturn'],
            convictions: ['Survive together or die apart', 'to build is the greatest thing a man can do']
        }
    }

    const limitedCharacteristicTypes = ['descriptions', 'convictions']
    const characteristicTypes = ['descriptions', 'convictions', 'devotions']

    const firstToTakeFrom = getRandomElement(limitedCharacteristicTypes)
    const firstCharacteristic = getRandomElement(humanCharacteristicsDictionary[nation][firstToTakeFrom])
    const firstToPutIn = getRandomElement(characteristicTypes)
    const firstIndex = findNullIndex(characteristicsArray, firstToPutIn)
    characteristicsArray[firstToPutIn][firstIndex] = { value: firstCharacteristic, isBold: firstToTakeFrom !== firstToPutIn }
    
    const secondToTakeFrom = getRandomElement(limitedCharacteristicTypes)
    const secondCharacteristic = getRandomElement(humanCharacteristicsDictionary[nation][secondToTakeFrom])
    const secondToPutIn = getRandomElement(characteristicTypes)
    const secondIndex = findNullIndex(characteristicsArray, secondToPutIn)
    characteristicsArray[secondToPutIn][secondIndex] = { value: secondCharacteristic, isBold: secondToTakeFrom === secondToPutIn }

    return characteristicsArray
}

function findNullIndex(characteristicsArray, destination) {
    let indexArray = []
    for (i = 0; i < characteristicsArray[destination].length; i++) {
        if (!characteristicsArray[destination][i]) {
            indexArray.push(i)
        }
    }

    if (indexArray.length === 0) {
        return characteristicsArray[destination].length
    } else {
        return getRandomElement(indexArray)
    }
}

const elfNames = ["balar", "banise", "bella", "beros", "can", "caryn", "ceran", "cyne", "dan", "di", "dithas", "dove", "faren", "fiel", "fina", "fir", "geiros", "gella", "golor", "gwyn", "hana", "harice", "hice", "horn", "jeon", "jor", "jyre", "kalyn", "kas", "kian", "krana", "lamin", "lana", "lar", "lee", "len", "leth", "lynn", "maer", "maris", "menor", "moira", "myar", "mys", "na", "nala", "nan", "neiros", "nelis", "norin", "peiros", "petor", "phine", "phyra", "qen", "qirelle", "quinal", "ra", "ralei", "ran", "rel", "ren", "ric", "rie", "rieth", "ris", "ro", "rona", "rora", "roris", "salor", "sandoral", "satra", "stina", "sys", "thana", "thyra", "toris", "tris", "tumal", "valur", "varis", "ven", "vyre", "warin", "wenys", "wraek", "wynn", "xalim", "xidor", "xina", "xisys", "yarus", "ydark", "ynore", "yra", "zana", "zeiros", "zorwyn", "zumin", "Adorellan", "Adresin", "Aelrindel", "Aenwyn", "Aerendyl", "Aerith", "Aien", "Ailen", "Ailre", "Aimer", "Aire", "Aithlin", "Alaion", "Alais", "Alanis", "Alasse", "Alosrin", "Amra", "Amrynn", "Aneirin", "Anfalen", "Anhaern", "Anlyth", "Arbane", "Ardreth", "Arel", "Ariawyn", "Arryn", "Arthion", "Artin", "Ashryn", "Aubron", "Avourel", "Axilya", "Ayen", "Aymer", "Ayre", "Aywin", "Azariah", "Bellas", "Bemere", "Bialaer", "Caeda", "Calarel", "Chaenath", "Ciliren", "Ciradyl", "Cithrel", "Cohnal", "Conall", "Cornaith", "Cyran", "Dain", "Darunia", "Ehlark", "Ehrendil", "Elaith", "Elandorr", "Elanil", "Elas", "Elauthin", "Eldaerenth", "Eldrin", "Elen", "Elidyr", "Elion", "Elisen", "Ellisar", "Elluin", "Elnaril", "Elpharae", "Elred", "Elyon", "Emmyth", "Erendriel", "Eroan", "Estelar", "Faelyn", "Falael", "Falenas", "Farryn", "Felaern", "Feno", "Filaurel", "Filverel", "Folen", "Folre", "Fylson", "Gaeleath", "Gaelin", "Gaerradh", "Galan", "Goras", "Goren", "Gweyir", "Haemir", "Halaema", "Halamar", "Haldir", "Halueth", "Halueve", "Hamon", "Horith", "Hycis", "Iefyr", "Ilbryen", "Iliphar", "Ilphas", "Imizael", "Inchel", "Irhaal", "Isarrel", "Isilynor", "Ithronel", "Ivasaar", "Jandar", "Jassin", "Jhaan", "Jorildyn", "Kailu", "Katar", "Keenor", "Kelvhan", "Kendel", "Keryth", "Kharis", "Khidell", "Khiiral", "Khyrmin", "Kilyn", "Kindreth", "Kymil", "Laeroth", "Larrel", "Lathlaeril", "Lazziar", "Lethonel", "Lhoris", "Lierin", "Llewel", "Lorsan", "Lyari", "Lysanthir", "Maeral", "Maiele", "Malon", "Malonne", "Merellien", "Meriel", "Merith", "Methild", "Micaiah", "Mirthal", "Mnementh", "Myrdin", "Myriil", "Myrin", "Myrrh", "Naesala", "Naevys", "Namys", "Narbeth", "Nasir", "Navarre", "Nelaeryn", "Neremyn", "Nesterin", "Nhamashal", "Nieven", "Nithenoel", "Nueleth", "Nuovis", "Nym", "Orym", "Paeral", "Paeris", "Pelleas", "Phraan", "Rathiain", "Rennyn", "Rhalyf", "Riluaneth", "Rolim", "Ruehnar", "Ruvaen", "Ruven", "Ruvyn", "Ryllae", "Ryo", "Saelethil", "Saelihn", "Saevel", "Saida", "Saleh", "Sanev", "Selanar", "Shalaevar", "Shandalar", "Sharian", "Sinaht", "Sylmare", "Sylvar", "Syvis", "Taenaran", "Taeral", "Tamnaeth", "Tanathil", "Tannatar", "Tannyll", "Tanyl", "Tanyth", "Taranth", "Tarathiel", "Thalanil", "Thallan", "Tyrael", "Uneathen", "Vaeril", "Vamir", "Venali", "Virion", "Vulen", "Vulmar", "Vulmer", "Vulwin", "Wirenth", "Wynather", "Yesanith", "Zeno", "Ad", "Ae", "Ara", "Bal", "Bei", "Bi", "Bry", "Cai", "Car", "Chae", "Cra", "Da", "Dae", "Dor", "Eil", "El", "Ela", "En", "Er", "Fa", "Fae", "Far", "Fen", "Gen", "Gil", "Glyn", "Gre", "Hei", "Hele", "Her", "Hola", "Ian", "Iar", "Ili", "Ina", "Jo", "Kea", "Kel", "Key", "Kris", "Leo", "Lia", "Lora", "Lu", "Mag", "Mia", "Mira", "Mor", "Nae", "Neri", "Nor", "Ola", "Olo", "Oma", "Ori", "Pa", "Per", "Pet", "Phi", "Pres", "Qi", "Qin", "Qui", "Ralo", "Rava", "Rey", "Ro", "Sar", "Sha", "Syl", "The", "Tor", "Tra", "Tris", "Ula", "Ume", "Uri", "Va", "Val", "Ven", "Vir", "Waes", "Wran", "Wyn", "Wysa", "Xil", "Xyr", "Yel", "Yes", "Yin", "Ylla", "Zin", "Zum", "Zyl", "Aelrie", "Aelua", "Aelynthi", "Aenwyn", "Aerilaya", "Aerith", "Ahrendue", "Ahshala", "Aila", "Alagossa", "Alais", "Alanis", "Alasse", "Alavara", "Alea", "Aleesia", "Alenia", "Aleratha", "Allannia", "Allisa", "Alloralla", "Allynna", "Almedha", "Almithara", "Alvaerelle", "Alyndra", "Amara", "Amaranthae", "Amarille", "Amedee", "Ameria", "Amisra", "Amnestria", "Amra", "Anarzee", "Aneirin", "Anhaern", "Annallee", "Ara", "Arasne", "Aravae", "Arcaena", "Ariawyn", "Arilemna", "Arlayna", "Arnarra", "Arryn", "Arthion", "Artin", "Ashera", "Ashryn", "Aurae", "Ava", "Axilya", "Ayda", "Ayla", "Azariah", "Baerinda", "Bellaluna", "Bemere", "Bonaluria", "Burolia", "Caeda", "Caerthynna", "Calarel", "Celaena", "Cellica", "Chaenath", "Chalia", "Chalsarda", "Chamylla", "Chandrelle", "Chasianna", "Ciliren", "Ciradyl", "Cithrel", "Clanire", "Cremia", "Daethie", "Daratrine", "Darshee", "Darunia", "Dasyra", "Delimira", "Delsanra", "Dessielle", "Deulara", "Dilya", "Dirue", "Ealirel", "Ecaeris", "Edea", "Edraele", "Eirina", "Elanalue", "Elanil", "Elasha", "Elenaril", "Eletha", "Elincia", "Elisen", "Eliyen", "Ellarian", "Elmyra", "Eloimaya", "Elora", "Elyon", "Ena", "Enania", "Eshenesra", "Esiyae", "Essaerae", "Esta", "Falenas", "Faraine", "Farryn", "Faunalyn", "Fayeth", "Faylen", "Fhaertala", "Filaurel", "Filauria", "Fildarae", "Finnea", "Gaelira", "Gaerradh", "Gaylia", "Geminara", "Ghilanna", "Glynnii", "Gweyir", "Gwynnestri", "Gylledhia", "Haciathra", "Haera", "Halaema", "Halanaestra", "Hamalitia", "Haramara", "Helartha", "Holone", "Huethea", "Hycis", "Ialantha", "Ikeshia", "Ildilyntra", "Ilmadia", "Ilsevel", "Ilyana", "Ilyrana", "Ilythyrra", "Imizael", "Immianthe", "Imra", "Imryll", "Ioelena", "Irhaal", "Isarrel", "Isilynor", "Ithronel", "Itireae", "Itylara", "Jastira", "Jeardra", "Jhaerithe", "Jhanandra", "Jhilsara", "Kali", "Kasula", "Kavrala", "Kaylessa", "Kaylin", "Keenor", "Keerla", "Keishara", "Kenia", "Kethryllia", "Keya", "Kilyn", "Kylantha", "Kythaela", "Laamtora", "Laerdya", "Lazziar", "Leena", "Leilatha", "Lenna", "Lensa", "Lethhonel", "Lierin", "Liluth", "Lithoniel", "Lixiss", "Llamiryl", "Llorva", "Loreleia", "Lura", "Lusha", "Lusserina", "Lyeecia", "Lyeneru", "Lymseia", "Lyndis", "Lyra", "Lyrei", "Lythienne", "Madris", "Maelyrra", "Maeralya", "Maescia", "Makaela", "Malonne", "Malruthiia", "Mariona", "Mathienne", "Maylin", "Meira", "Melarue", "Meorise", "Merethyl", "Merialeth", "Meriel", "Merlara", "Mhoryga", "Micaiah", "Minuvae", "Muelara", "Myantha", "Mylaela", "Mylaerla", "Myriani", "Myrrh", "Nabeora", "Naesala", "Naevys", "Naexi", "Nakiasha", "Nalaea", "Nambra", "Namys", "Nanthaliene", "Neia", "Nephinae", "Nimeroni", "Nimue", "Nithenoel", "Nithroel", "Nuala", "Nueleth", "Nuovis", "Nushala", "Nyana", "Nylathria", "Ochilysse", "Omylia", "Osonia", "Penelo", "Phaerille", "Phelorna", "Phinara", "Phyrra", "Pyria", "Qamara", "Radelia", "Raenisa", "Rallientha", "Rania", "Ratha", "Rathiain", "Renestrae", "Renna", "Rina", "Riniya", "Rophalin", "Rosanhi", "Rosaniya", "Roshia", "Rubarae", "Ryllae", "Saelihn", "Saida", "Sakaala", "Salihn", "Sana", "Saphielle", "Saria", "Sariandi", "Sarya", "Seldanna", "Selphie", "Selussa", "Shael", "Shaerra", "Shalaevar", "Shalana", "Shalendra", "Shalheira", "Shalia", "Shanaera", "Shandalar", "Shanyrria", "Shelara", "Shenarah", "Sillavana", "Sionia", "Siora", "Siphanien", "Siraye", "Solana", "Soliana", "Sorisana", "Sumina", "Syllia", "Sylmare", "Symania", "Syndra", "Syvis", "Taenya", "Talanashta", "Talindra", "Tanelia", "Tanila", "Tanulia", "Tarasynora", "Tehlarissa", "Tephysea", "Teriani", "Thaciona", "Thalia", "Thaola", "Thasinia", "Thessalia", "Tialha", "Tinesi", "Tiriana", "Tisha", "Tsarra", "Tyrael", "Ulesse", "Umilythe", "Uneathen", "Urricea", "Usamea", "Vaeri", "Valindra", "Vanya", "Vasati", "Velatha", "Verrona", "Vestele", "Vianola", "Viessa", "Wynather", "Yaereene", "Yalanue", "Yathanae", "Ygannea", "Ynaselle", "Yralissa", "Yrathea", "Yrneha", "Ysildea", "Yumanea", "Yunaesa", "Zaleria", "Zentha", "Zestari", "Zilyana", "Abarat", "Adamar", "Adorellan", "Adresin", "Aelrindel", "Aerendyl", "Aeson", "Afamrail", "Agandaur", "Agis", "Aias", "Aiduin", "Aien", "Ailas", "Ailduin", "Ailen", "Ailluin", "Ailmar", "Ailmer", "Ailmon", "Ailre", "Ailred", "Ailuin", "Ailwin", "Aimar", "Aimer", "Aimon", "Airdan", "Aire", "Aired", "Aithlin", "Aiwin", "Akkar", "Alabyran", "Alaion", "Alas", "Alen", "Alinar", "Alluin", "Almar", "Almer", "Almon", "Alok", "Alosrin", "Alre", "Alred", "Althidon", "Alwin", "Amrynn", "Andrathath", "Anfalen", "Anlyth", "Aolis", "Aquilan", "Arathorn", "Arbane", "Arbelladon", "Ardreth", "Ardryll", "Arel", "Arlen", "Arun", "Ascal", "Athtar", "Aubron", "Aumanas", "Aumrauth", "Avourel", "Ayas", "Ayduin", "Ayen", "Ayluin", "Aymar", "Aymer", "Aymon", "Ayre", "Ayred", "Aywin", "Belanor", "Beldroth", "Bellas", "Beluar", "Biafyndar", "Bialaer", "Braern", "Cailu", "Camus", "Castien", "Chathanglas", "Cohnal", "Conall", "Connak", "Cornaith", "Corym", "Cyran", "Dain", "Dakath", "Dalyor", "Darcassan", "Darfin", "Darthoridan", "Darunia", "Deldrach", "Delmuth", "Delsaran", "Devdan", "Drannor", "Druindar", "Durlan", "Durothil", "Dyffros", "Edwyrd", "Edyrm", "Ehlark", "Ehrendil", "Eilauver", "Elaith", "Elandorr", "Elas", "Elashor", "Elauthin", "Eldaerenth", "Eldar", "Eldrin", "Elduin", "Elen", "Elephon", "Elidyr", "Elion", "Elkhazel", "Ellisar", "Elluin", "Elmar", "Elmer", "Elmon", "Elnaril", "Elorshin", "Elpharae", "Elre", "Elred", "Eltaor", "Elwin", "Elyon", "Emmyth", "Entrydal", "Erendriel", "Eriladar", "Erlan", "Erlareo", "Erlathan", "Eroan", "Erolith", "Estelar", "Ethlando", "Ettrian", "Evindal", "Faelar", "Faelyn", "Faeranduil", "Falael", "Felaern", "Fenian", "Feno", "Feyrith", "Fhaornik", "Filarion", "Filvendor", "Filverel", "Flardryn", "Flinar", "Folas", "Folduin", "Folen", "Folluin", "Folmar", "Folmer", "Folmon", "Folre", "Folred", "Folwin", "Fylson", "Gaeleath", "Gaelin", "Galaeron", "Galan", "Galather", "Ganamede", "Gantar", "Garrik", "Garynnon", "Giullis", "Glanduil", "Glarald", "Glorandal", "Goras", "Gorduin", "Goren", "Gorluin", "Gormar", "Gormer", "Gormon", "Gorre", "Gorred", "Gorwin", "Grathgor", "Haemir", "Hagas", "Hagduin", "Hagen", "Hagluin", "Hagmar", "Hagmer", "Hagre", "Hagred", "Hagwin", "Haladavar", "Halafarin", "Halamar", "Haldir", "Halflar", "Halueth", "Halueve", "Hamon", "Haryk", "Hastios", "Hatharal", "Horith", "Hubys", "Iefyr", "Ievis", "Ilbryen", "Ilimitar", "Iliphar", "Illianaro", "Illithor", "Illitran", "Ilphas", "Ilrune", "Ilthuryn", "Ilvisar", "Inchel", "Inialos", "Intevar", "Iolas", "Iolrath", "Itham", "Ivaran", "Ivasaar", "Iymbryl", "Iyrandrar", "Jandar", "Jannalor", "Jaonos", "Jassin", "Jhaan", "Jhaartael", "Jhaeros", "Jonik", "Jorildyn", "Kailu", "Katar", "Katyr", "Kellam", "Kelvhan", "Kendel", "Kerym", "Keryth", "Kesefeon", "Kharis", "Khatar", "Khidell", "Khiiral", "Khilseith", "Khuumal", "Khyrmin", "Kieran", "Kiirion", "Kindroth", "Kivessin", "Klaern", "Kolvar", "Kuskyn", "Kymil", "Kyrenic", "Kyrtaar", "Laeroth", "Lafarallin", "Laiex", "Lamruil", "Larongar", "Larrel", "Lathai", "Lathlaeril", "Lhoris", "Lianthorn", "Llarm", "Llewel", "Lorsan", "Luirlan", "Luthais", "Luvon", "Lyari", "Lyklor", "Lysanthir", "Maeral", "Maiele", "Malgath", "Malon", "Maradeim", "Marikoth", "Marlevaur", "Melandrach", "Merellien", "Merith", "Methild", "Mhaenal", "Mitalar", "Mihangyl", "Miirphys", "Mirthal", "Mlartlar", "Mnementh", "Morthil", "Myrdin", "Myriil", "Myrin", "Mythanar", "Naertho", "Naeryndam", "Naesala", "Narbeth", "Nardual", "Nasir", "Navarre", "Nelaeryn", "Neldor", "Neremyn", "Nesterin", "Nevarth", "Nhamashal", "Nieven", "Nindrol", "Ninleyn", "Ninthalor", "Niossae", "Nuvian", "Nylian", "Nym", "Nyvorlas", "Olaurae", "Onas", "Oncith", "Onvyr", "Orist", "Ornthalas", "Orrian", "Orym", "Otaehryn", "Othorion", "Paeral", "Paeris", "Pelleas", "Phaendar", "Pharom", "Phraan", "Pirphal", "Purtham", "Pyrravyn", "Pywaln", "Qildor", "Raeran", "Raibyn", "Ralnor", "Ranaeril", "Rathal", "Reluraun", "Reluvethel", "Rennyn", "Reptar", "Respen", "Revalor", "Rhalyf", "Rhangyl", "Rhistel", "Rhothomir", "Rhys", "Rilitar", "Riluaneth", "Rolim", "Rothilion", "Ruehnar", "Ruith", "Ruvaen", "Ruven", "Ruvyn", "Rychell", "Rydel", "Ryfon", "Ryo", "Ryul", "Saelethil", "Saevel", "Saleh", "Samblar", "Sanev", "Scalanis", "Selanar", "Sharian", "Shaundyl", "Shyrrik", "Sihnion", "Silvyr", "Simimar", "Sinaht", "Siveril", "Sontar", "Sudryal", "Sundamar", "Sylvar", "Sythaeryn", "Taegen", "Taenaran", "Taeral", "Taerentym", "Taleasin", "Tamnaeth", "Tanithil", "Tannatar", "Tannivh", "Tannyll", "Tanyl", "Tanyth", "Taranath", "Tarathiel", "Taredd", "Tarron", "Tasar", "Tassarion", "Tathaln", "Thalanil", "Thallan", "Theodas", "Theodemar", "Theoden", "Theodluin", "Theodmer", "Theodmon", "Theodre", "Theodred", "Thuridan", "Tiarsus", "Tolith", "Tordynnar", "Toross", "Traeliorn", "Travaran", "Triandal", "Ualiar", "Uevareth", "Uldreyin", "Urdusin", "Usunaar", "Uthorim", "Vaalyun", "Vaeril", "Vamir", "Varitan", "Velethuil", "Venali", "Vesryn", "Vesstan", "Virion", "Volodar", "Voron", "Vuduin", "Vulas", "Vulen", "Vulluin", "Vulmar", "Vulmer", "Vulmon", "Vulre", "Vulred", "Vulwin", "Wirenth", "Wistari", "Wyn", "Wyninn", "Wyrran", "Yalathanil", "Yesanith", "Yhendorn", "Ylyndar", "Zaos", "Zelphar", "Zeno", "Zhoron"]

module.exports = npcController

