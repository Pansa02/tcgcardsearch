import React from "react";
import Content1 from "./Content1";
import Content2 from "./Content2";
import Content3 from "./Content3";
import Content7 from "./Content7";
import Content8 from "./Content8";

const MainPage = () => {
  return (
    <React.Fragment>
      <section>
        <div className="layout text-2xl text-white">
          <div className="content1 centered">
            <Content1 />
          </div>
          <div className="content2" id="cardList">
            <Content2 />
          </div>
          <div className="content3" id="resultList">
            <Content3 />
          </div>
          <div className="content7 centered">
            <Content7 />
          </div>
          <div className="content8 centered">
            <Content8 />
          </div>
        </div>
      </section>
    </React.Fragment>
  );
};

export default MainPage;
