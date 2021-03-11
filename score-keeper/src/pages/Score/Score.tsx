import React, {useState} from "react";
import {Set} from '../Boards/Boards';
import './Score.css';
import {API} from "../../utils/API";
import {Logger} from "../../utils/Logger";

interface ScorePropsInterface {
  matchKey: string;
  teamOneName: string;
  teamTwoName: string;
  set: Set;
}

function Score(props: ScorePropsInterface) {
  const [set, setSet] = useState(props.set);

  const updateSet = async function(teamNumber: number, increment: boolean) {
    Logger.log('updateSet', {teamNumber, increment});
    let newSet: Set|null = null;
    let update: number;
    if (increment) {
      update = 1;
    } else {
      update = -1;
    }

    if (teamNumber === 1) {
        const newScore = set.teamOneScore + update
        if (newScore >= 0) {
          newSet = {...set, teamOneScore: set.teamOneScore + update};
        }
    } else {
      const newScore = set.teamOneScore + update
      if (newScore >= 0) {
        newSet = {...set, teamTwoScore: set.teamTwoScore + update};
      }
    }

    if (newSet !== null) {
      setSet(newSet);
      await API.updateSet(props.matchKey, newSet);
    }
  }

  return (
      <div className="score-ctr">
        <div className="title-ctr"><h3>Set {set.setNumber}</h3></div>
        <div className="team-ctr">
          <h3>{props.teamOneName}</h3>
          <div className="total-ctr">{set.teamOneScore}</div>
          {!props.set.complete &&
          <div className="button-ctr">
            <button onClick={() => updateSet(1, true)}>+</button>
            <button onClick={() => updateSet(1, false)}>-</button>
          </div>
          }
        </div>
        <div className="team-ctr">
          <h3>{props.teamTwoName}</h3>
          <div className="total-ctr">{set.teamTwoScore}</div>
          {
            !props.set.complete &&
            <div className="button-ctr">
              <button onClick={() => updateSet(2, true)}>+</button>
              <button onClick={() => updateSet(2, false)}>-</button>
            </div>
          }
        </div>
      </div>
  )
}

export default Score;