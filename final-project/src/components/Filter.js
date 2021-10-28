import React from "react";
import bar from "../img/filter.png"

export default function Filter() {

    let text = "test"



    return (
        <div>
            <a href="/" onClick={console.log(text)}>
                <img src={bar} alt="Filter" />
            </a>
        </div>
    )
}