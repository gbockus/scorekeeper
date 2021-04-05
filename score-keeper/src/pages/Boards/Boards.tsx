import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';

import './Boards.css';
import Score from '../Score/Score';
import { API, Match } from '../../utils/API';
import { Logger } from '../../utils/Logger';

interface ParamsKey {
    key: string;
    edit: string;
    follow: string;
}

export interface Set {
    id: number;
    setNumber: number;
    teamOneScore: number;
    teamTwoScore: number;
    complete: boolean;
}

function Boards(props: any) {
    const { key, follow } = useParams<ParamsKey>();
    const editable = !follow;
    Logger.log('params', {
        key,
        follow,
        editable,
        props,
    });

    const [dataKey] = useState(key as string);
    const [loaded, setLoaded] = useState(false);
    const [match, setMatch] = useState<Match>({
        id: 0,
        teams: [{name: ''}, {name: ''}],
        sets: [],
        complete: false,
    });
    const ws: any = useRef(null);

    const loadMatch = async () => {
        Logger.log('loadMatch', {
            dataKey,
        });
        const match = await API.getMatch(dataKey);
        Logger.log('match response', {
            match,
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
    });

    useEffect(() => {
        if (!editable && !match.complete && ws.current === null) {
            // ws.current = new WebSocket(`ws:localhost:3000/${key}`);
            const HOST = window.location.origin.replace(/^http/, 'ws')
            ws.current = new WebSocket(HOST);
            ws.current.onopen = () => console.log('ws opened');
            ws.current.onclose = () => console.log('ws closed');

            ws.current.onmessage = (e: any) => {
                Logger.log('got message on ws');
                const matchUpdate = JSON.parse(e.data);
                Logger.log('ws match data', {
                    matchUpdate,
                });
                setMatch(matchUpdate);
            };

            return () => {
                Logger.log('closing web socket.');
                ws.current.close();
            };
        }
    }, [key, editable, match, setMatch]);

    const addNewSet = async () => {
        Logger.log('AddNewSet', {id: match.id});

        const updatedMatch = await API.addSet(match.id);
        setMatch(updatedMatch);
    };

    const isEditable = () => {
        return editable && !match.complete;
    };

    const updateMatchComplete = async () => {
        const newValue = !match.complete;
        const updatedMatch = await API.setMatchComplete(match.id, newValue);
        setMatch(updatedMatch);
    };

    console.log('match before render', {
        match
    });
    return (
        <div className="boards-page">
            {match.sets.length !== 0 && (
                <h2>
                    {' '}
                    Match {match.teams[0].name} vs {match.teams[1].name}
                </h2>
            )}
            {match.sets.map((value, index) => {
                return (
                    <Score
                        key={index}
                        matchKey={key}
                        setVal={match.sets[index]}
                        teamOneName={match.teams[0].name}
                        teamTwoName={match.teams[1].name}
                        edit={isEditable()}
                    />
                );
            })}
            {isEditable() && <button onClick={addNewSet}>Add Set</button>}
            {editable && (
                <button onClick={() => updateMatchComplete()}>
                    {match.complete ? 'Undo Match Over' : 'Match Over'}
                </button>
            )}
        </div>
    );
}

export default Boards;
