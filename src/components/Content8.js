import React, { useEffect, useState } from "react";
import { NewForm1 } from "../ui-components";

export let cards = [];
let clickNumber = 0;

const Content8 = () => {
  const [card, setCard] = useState();

  const handleCardRemove = (index) => {
    const cardsList = [...cards];
    const child = document.getElementById(index);
    const indexToRemove = cards.findIndex(function x(item) {
      item.cardValue = child;
      return item.cardValue;
    });
    cardsList.splice(indexToRemove, 1);
    cards = cardsList;
    child.parentElement.remove();
    console.log(cards);
  };

  useEffect(() => {
    const cardList = document.querySelector("#cardList");
    cards.push(card);
    if (clickNumber === 0) {
      let nullRemove = cards.slice(1);
      cards = nullRemove;
    }
    console.log(cards);

    if (clickNumber !== 0) {
      const div_inner = document.createElement("div");
      div_inner.setAttribute("id", "card");

      cardList.appendChild(div_inner);
      const closeButton = document.createElement("button");

      for (let key in card) {
        const div = document.createElement("div");
        div_inner.appendChild(div);
        div.setAttribute("id", key);
        div.innerText = key + " : " + card[key];
      }
      div_inner.appendChild(closeButton);
      closeButton.setAttribute("class", "closeButton");
      closeButton.setAttribute("id", card.cardName);
      closeButton.innerText = "X";
      closeButton.addEventListener("click", (event) => {
        const index = event.currentTarget.id;
        handleCardRemove(index);
      });
    }
  }, [card]);

  return (
    <div>
      <div>
        <NewForm1
          onSubmit={(fields) => {
            setCard({
              "Card Name": fields.Field0,
              "Exclusionary Words": fields.Field1,
              "Max Price": "$" + fields.Field2,
              "Free Shipping": fields.Field5,
              "Immediate Buyout Only": fields.Field3,
              "Aucton End Time":
                fields.Field4 + "/" + fields.Field6 + "/" + fields.Field7,
            });
            clickNumber++;
          }}
        />
      </div>
    </div>
  );
};

export default Content8;
