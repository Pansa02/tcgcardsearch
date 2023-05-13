import React, { useState, useEffect } from 'react'
import { Amplify, API } from 'aws-amplify';

const myAPI = "cardSearch"
const path = "/search"

const Content3 = () => {
  const [results, displayResults] = useState([])

  function getData(e) {
    let data = e.input
    API.get(myAPI, path)
      .then(response => {
        console.log(response)
        let result = [...results]
        result.push(response)
        displayResults(result)
      })
  }

  return (
    <div id='resultContainer'>
      
    </div>
  )
}

export default Content3