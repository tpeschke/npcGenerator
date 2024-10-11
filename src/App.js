import React, { useState, useEffect } from 'react';
import './App.css';
import local from './local'
import axios from 'axios'
import Characteristics from './Characteristics';
import processForWorldAnvil from './processForWorldAnvil';
import processForGoblinsNotebook from './processForGoblinsNotebook';

function App() {
  const [queryObject, setQueryObject] = useState({ gender: null, ancestry: null, nation: null });
  const [npc, setNPC] = useState({ name: null });
  const [isCopied, setCopied] = useState(false);

  useEffect(() => {
    getNPC(queryObject)
  }, { name: null });

  function setQueryValue(value, key) {
    value = value === "I Don't Care" ? null : value
    let newQueryValue = { ...queryObject, [key]: value }
    if (key === 'ancestry' && value !== queryObject.ancestry) {
      newQueryValue.nation = null
    }
    setQueryObject(newQueryValue)
    getNPC(newQueryValue)
  }

  function getNPC(queryValue) {
    let queryString = '?'
    for (const [key, value] of Object.entries(queryValue)) {
      if (value) {
        if (queryString !== '?') {
          queryString += '&'
        }
        queryString += `${key}=${value}`
      }
    }

    axios.get(local.endpoint + `/createNPC${queryString}`).then(npc => {
      setCopied(false)
      setNPC(npc.data)
    })
  }

  function processForDownload(format) {
    for (const [key, value] of Object.entries(npc)) {
      if (key === 'characteristics') {
        for (const [charKey, charValue] of Object.entries(npc[key])) {
          if (charKey !== 'strength') {
            npc[key][charKey] = charValue.map(element => {
              if (element) {
                return element.isBold ? { value: element.value.toUpperCase() } : { value: capitalizeFirstLetter(element.value) }
              } else {
                return null
              }
            })
          } else {
            npc[key][charKey] = capitalizeFirstLetter(charValue)
          }
        }
      } else if (key === 'ancestry' && value === 'temple') {
        npc[key] = 'Human'
      } else {
        npc[key] = capitalizeFirstLetter(value)
      }
    }

    let stringToDownload = ''
    if (format === 'WA') {
      stringToDownload = processForWorldAnvil(npc)
    } else {
      stringToDownload = processForGoblinsNotebook(npc)
    }

    if (stringToDownload !== '') {
      navigator.clipboard.writeText(stringToDownload);
      setCopied(true)
    }
  }

  function capitalizeFirstLetter(word) {
    if (!word) { return word }
    const firstLetter = word.charAt(0)
    const firstLetterCap = firstLetter.toUpperCase()
    const remainingLetters = word.slice(1).toLowerCase()
    return firstLetterCap + remainingLetters
  }

  function setNation (ancestry, nation) {
    let adjustedNation;
    if (nation) {
      adjustedNation = nation === 'lokckkorsik' ? 'Lokck-Korsik' : nation
    }
    return ancestry === 'human' || ancestry === 'orc' || ancestry === 'elf' ? `(${capitalizeFirstLetter(adjustedNation)})` : ''
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>NPC Generator</h1>
      </header>
      <div className='body'>
        <div className='select-shell'>
          <p>Gender</p>
          <select onChange={e => setQueryValue(e.target.value, 'gender')}>
            <option>I Don't Care</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
          <p>Ancestry:</p>
          <select onChange={e => setQueryValue(e.target.value, 'ancestry')}>
            <option>I Don't Care</option>
            <option value="human">Human</option>
            <option value="elf">Elf</option>
            <option value="orc">Orc</option>
            <option value="temple">Temple</option>
            <option value="clan">Clan</option>
          </select>

          {queryObject.ancestry === 'human' || queryObject.ancestry === 'clan' ? <div>
            <p>Nation:</p>
            <select onChange={e => setQueryValue(e.target.value, 'nation')}>
              <option>I Don't Care</option>
              <option value="drangsdt">Drangsdt</option>
              <option value="knach">Knach</option>
              <option value="lussk">Lussk</option>
              <option value="pfaets">Pfaets</option>
              <option value="rhone">Rhone</option>
              <option value="vipling">Vipling</option>
              <option value="zwek">Zwek</option>
            </select>
          </div> : <div></div>}

          {queryObject.ancestry === 'orc' ? <div>
            <p>Horde:</p>
            <select onChange={e => setQueryValue(e.target.value, 'nation')}>
              <option>I Don't Care</option>
              <option value="szabolck">Szabolck</option>
              <option value="bok">Bok</option>
              <option value="gyisk">Gyisk</option>
              <option value="lokckkorsik">Lokck-Korsik</option>
              <option value="prermuk">Prermuk</option>
              <option value="totsok">Totsok</option>
              <option value="vorhut">Vorhut</option>
              <option value="certek">Certek</option>
              <option value="dunk">Dunk</option>
              <option value="mersk">Mersk</option>
              <option value="potk">Potk</option>
              <option value="sok">Sok</option>
              <option value="suldk">Suldk</option>
              <option value="voltk">Voltk</option>
            </select>
          </div> : <div></div>}

          {queryObject.ancestry === 'elf' ? <div>
            <p>Conference:</p>
            <select onChange={e => setQueryValue(e.target.value, 'nation')}>
              <option>I Don't Care</option>
              <option value="ail">Ail</option>
              <option value="geny">Geny</option>
              <option value="hern">Hern</option>
              <option value="inar">Inar</option>
              <option value="navar">Navar</option>
              <option value="orym">Orym</option>
              <option value="phas">Phas</option>
              <option value="rhan">Rhan</option>
              <option value="rhoth">Rhoth</option>
              <option value="ruil">Ruil</option>
              <option value="tiar">Tiar</option>
              <option value="ual">Ual</option>
              <option value="qinn">Qinn</option>
              <option value="sylv">Sylv</option>
            </select>
          </div> : <div></div>}
        </div>

        {npc.name ? <div>
          <div className='button-shell'>
            <button onClick={_ => processForDownload('WA')}>World Anvil</button>
            <button onClick={_ => processForDownload('GN')}>Goblin's Notebook</button>
            {isCopied ? <p>NPC Copied</p> : <p></p>}
          </div>
          <div>
            <h2>{npc.name}</h2>
            <div className='basic-info-shell'>
              <p><strong>Ancestry</strong> {npc.ancestry === 'temple' ? 'Human' : capitalizeFirstLetter(npc.ancestry)} {setNation(npc.ancestry, npc.nation)}</p>
              <p><strong>Gender</strong> {capitalizeFirstLetter(npc.gender)}</p>
              <p><strong>Strength</strong> {capitalizeFirstLetter(npc.characteristics.strength)}</p>
            </div>
            <div className='characteristics-shell'>
              <div className='characteristics'>
                <strong>Descriptions</strong>
                <Characteristics array={npc.characteristics} objectKey='descriptions' />
                <strong>Flaws</strong>
                <Characteristics array={npc.characteristics} objectKey='flaws' />
              </div>
              <div className='characteristics'>
                <strong>Convictions</strong>
                <Characteristics array={npc.characteristics} objectKey='convictions' />
                <strong>Relationships</strong>
                <Characteristics array={npc.characteristics} objectKey='devotions' />
              </div>
            </div>
          </div>
          <div className='button-shell'>
            <button onClick={_ => getNPC(queryObject)}>Refresh</button>
          </div>
        </div> : <div></div>}
      </div>
    </div>
  );
}

export default App;
