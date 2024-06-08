import React, { useState } from 'react';
import './App.css';
import local from './local'
import axios from 'axios'
import Characteristics from './Characteristics';

function App() {
  const [queryObject, setQueryObject] = useState({ gender: null, ancestry: null, nation: null });
  const [npc, setNPC] = useState({ name: null });

  function setQueryValue(value, key) {
    value = value === "I Don't Care" ? null : value
    const newQueryValue = { ...queryObject, [key]: value }
    setQueryObject(newQueryValue)

    let queryString = '?'
    for (const [key, value] of Object.entries(newQueryValue)) {
      if (value) {
        if (queryString !== '?') {
          queryString += '&'
        }
        queryString += `${key}=${value}`
      }
    }

    axios.get(local.endpoint + `/createNPC${queryString}`).then(npc => {
      console.log(npc.data)
      setNPC(npc.data)
    })
  }

  function capitalizeFirstLetter(word) {
    const firstLetter = word.charAt(0)
    const firstLetterCap = firstLetter.toUpperCase()
    const remainingLetters = word.slice(1).toLowerCase()
    return firstLetterCap + remainingLetters
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
          </select>

          {queryObject.ancestry === 'human' ? <div>
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
        </div>

        <div>
          <div>
            BUTTONS TO DOWNLOAD WORLD ANVIL & GOBLIN'S NOTEBOOK VERSION
          </div>
          {npc.name ? <div>
            <h2>{npc.name}</h2>
            <div className='basic-info-shell'>
              <p><strong>Ancestry</strong> {capitalizeFirstLetter(npc.ancestry)} {npc.ancestry === 'human' ? `(${capitalizeFirstLetter(npc.nation)})` : ''}</p>
              <p><strong>Gender</strong> {capitalizeFirstLetter(npc.gender)}</p>
              <p><strong>Strength</strong> {capitalizeFirstLetter(npc.characteristics.strength)}</p>
            </div>
            <div className='characteristics-shell'>
              <div className='characteristics'>
                <strong>Descriptions</strong>
                <Characteristics array={npc.characteristics} objectKey='descriptions'/>
                <strong>Flaws</strong>
                <Characteristics array={npc.characteristics} objectKey='flaws'/>
              </div>
              <div className='characteristics'>
                <strong>Convictions</strong>
                <Characteristics array={npc.characteristics} objectKey='convictions'/>
                <strong>Devotions</strong>
                <Characteristics array={npc.characteristics} objectKey='devotions'/>
              </div>
            </div>
          </div> : <div></div>
          }
        </div>
      </div>
    </div>
  );
}

export default App;
