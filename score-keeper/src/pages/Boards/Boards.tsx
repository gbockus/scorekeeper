import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';

import './Boards.css';
import Score from "../Score/Score";
import {API, Match} from "../../utils/API";
import {Logger} from "../../utils/Logger";

interface ParamsKey {
    key: string;
}

export interface Set {
    setNumber: number
    teamOneScore: number;
    teamTwoScore: number;
    complete: boolean;
}

const URL = 'ws://localhost:3000/update';

function Boards() {
    const { key } = useParams<ParamsKey>();

    console.log('key', { key });

    const [dataKey] = useState(key as string);
    const [testWs, setTestWs] = useState('');
    const [loaded, setLoaded] = useState(false);
    const [match, setMatch] = useState<Match>({teamOneName: '', teamTwoName: '', sets: [], complete: false});
    const [matchComplete, setMatchComplete] = useState(false);
    const ws: any = useRef(null);

    const loadMatch = async () => {
        Logger.log('loadMatch', {
            dataKey
        });
        const match = await API.getMatch(dataKey);
        Logger.log('match response', {
            match
        });
        if (match.sets.length === 0) {
            const newSet = {
                setNumber: 1,
                teamOneScore: 0,
                teamTwoScore: 0,
                complete: false
            };
            match.sets= [newSet];
        }
        Logger.log('Got match', {
            match
        });
        setMatch(match);
    };

    useEffect(() => {
        if (!loaded) {
            loadMatch().then(() => {
                Logger.log('loadComplete');
                setLoaded(true);
            });
        }
        ws.current = new WebSocket(URL);
        ws.current.onopen = () => console.log('ws opened');
        ws.current.onclose = () => console.log('ws closed');

        return () => {
            // ws.current.close();
        };
    });

    const tryIt = () => {
        console.log('tryIt', testWs);
        const test = new WebSocket(testWs);
        test.onopen = () => console.log('ws1 opened');
        test.onclose = () => console.log('ws1 closed');

        test.onmessage = (evt) => {
            // on receiving a message, add it to the list of messages
            const message = JSON.parse(evt.data);
            console.log('message!!!!', message);
        };
    };

    const addNewSet = async () => {
        Logger.log('AddNewSet');
        const updatedMatch = {...match,
          sets: [...match.sets, {
            setNumber: match.sets.length + 1,
            teamOneScore: 0,
            teamTwoScore: 0,
            complete: false
        }]};
        setMatch(updatedMatch);
        await API.saveMatch(updatedMatch);
    }

    const updateMatchComplete = async () => {
        const newValue = !match.complete;
        const updatedMatch = Object.assign({}, match);
        updatedMatch.sets.forEach((set) => {
            set.complete = newValue
        });
        updatedMatch.complete = newValue;
        setMatch(updatedMatch);
        await API.saveMatch(updatedMatch);
    }

    return (
        <div className="boards-page">
            {match.sets.length !== 0 && <h2> Match {match.teamOneName} vs {match.teamTwoName}</h2>}
            {match.sets.map((value, index) => {
                  return <Score key={index} matchKey={key} set={value} teamOneName={match.teamOneName} teamTwoName={match.teamTwoName} />
              })}
          {!match.complete && <button onClick={addNewSet}>Add Set</button>}
          <button onClick={() => updateMatchComplete()}>{match.complete ? 'Undo Match Over': 'Match Over'}</button>
        </div>
    );
}

export default Boards;
