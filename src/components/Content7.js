import React, { useState } from "react";
import { API } from "aws-amplify";
import { cards } from "./Content8";

const myAPI = "cardSearch";
const myPath = "/search";

let data = cards;

const Content7 = () => {
  const [results, displayResults] = useState([]);

  async function putData(e) {
    const cardList = document.querySelector("#resultContainer");
    const apiName = myAPI;
    const path = myPath;

    const dateTime = new Date();

    console.log(dateTime.toISOString());
    const myInit = {
      body: { e, dateTime },
      headers: {}, // OPTIONAL
    };

    if (cardList.hasChildNodes()) {
      document.querySelector("#result").remove();
    }

    const div_inner = document.createElement("div");
    div_inner.setAttribute("id", "result");
    cardList.appendChild(div_inner);
    div_inner.innerHTML = "<strong>Getting results, please wait...</strong>";
    displayResults(results);

    return await API.post(apiName, path, myInit).then((response) => {
      document.querySelector("#result").remove();
      console.log(response);

      const div_inner = document.createElement("div");
      div_inner.setAttribute("id", "result");

      cardList.appendChild(div_inner);
      div_inner.innerText = response;

      displayResults(results);
    });
  }

  return (
    <button
      className="button search"
      onClick={() => {
        data = cards;
        putData(data);
        console.log(data);
      }}
    >
      SEARCH
    </button>
  );
};

export default Content7;
