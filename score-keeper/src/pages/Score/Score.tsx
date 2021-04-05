import React, { useEffect, useState } from 'react';
import { Set } from '../Boards/Boards';
import './Score.css';
import { API } from '../../utils/API';
import { Logger } from '../../utils/Logger';

interface ScorePropsInterface {
    matchKey: string;
    teamOneName: string;
    teamTwoName: string;
    setVal: Set;
    edit: boolean;
}

function Score(props: ScorePropsInterface) {
    Logger.log('Score props', {
        props,
    });
    const [set, setSet] = useState({
        id: 0,
        setNumber: 0,
        teamOneScore: 0,
        teamTwoScore: 0,
        complete: true,
    });

    useEffect(() => {
        const { setVal } = props;
        setSet(setVal);
    }, [setSet, props]);

    const updateSet = async function (teamNumber: number, increment: boolean) {
        Logger.log('updateSet', { teamNumber, increment });
        let newSet: Set | null = null;
        let update: number;
        if (increment) {
            update = 1;
        } else {
            update = -1;
        }

        if (teamNumber === 1) {
            const newScore = set.teamOneScore + update;
            if (newScore >= 0) {
                newSet = { ...set, teamOneScore: set.teamOneScore + update };
            }
        } else {
            const newScore = set.teamTwoScore + update;
            if (newScore >= 0) {
                newSet = { ...set, teamTwoScore: set.teamTwoScore + update };
            }
        }

        if (newSet !== null) {
            setSet(newSet);
            await API.updateSet(set.id, newSet.teamOneScore, newSet.teamTwoScore);
        }
    };

    return (
        <div className="score-ctr">
            <div className="title-ctr">
                <h3>Set {set.setNumber}</h3>
            </div>
            <div className="team-ctr">
                <h3>{props.teamOneName}</h3>
                <div className="total-ctr">
                    {set.teamOneScore}
                    {props.edit && (
                      <div className="button-ctr">
                          <div className="reduce" onClick={() => updateSet(1, false)}>-</div>
                          <div className="increase" onClick={() => updateSet(1, true)}>+</div>
                      </div>
                    )}
                </div>
            </div>
            <div className="team-ctr">
                <h3>{props.teamTwoName}</h3>
                <div className="total-ctr">{set.teamTwoScore}
                    {props.edit && (
                      <div className="button-ctr">
                          <div className="reduce" onClick={() => updateSet(2, false)}>-</div>
                          <div className="increase" onClick={() => updateSet(2, true)}>+</div>
                      </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Score;
