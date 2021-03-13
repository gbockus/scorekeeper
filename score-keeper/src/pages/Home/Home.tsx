import React, { useCallback, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';

import './Home.css';
import { Logger } from '../../utils/Logger';
import { API, Match } from '../../utils/API';

function Home() {
    const [matches, setMatches] = useState<Match[]>([]);
    const [loaded, setLoaded] = useState(false);
    const history = useHistory();

    const getMatches = useCallback(async () => {
        const result = await API.getMatches();
        Logger.log('Response from matches', {
            matches: result.matches,
        });
        result.matches.sort((a: Match, b: Match) => {
            if (a.createdAt && b.createdAt) {
                return a.createdAt - b.createdAt ;
            }
            return 0;
        });
        
        setMatches(result.matches);
    }, [setMatches]);

    useEffect(() => {
        Logger.log('useEffect', {
            loaded,
        });
        if (!loaded) {
            setLoaded(true);
            getMatches()
                .then(() => {
                    Logger.log('matches loaded.');
                })
                .catch(() => {
                    setLoaded(false);
                });
        }
    }, [setLoaded, getMatches, loaded]);

    function gotoBoard(key: string | undefined) {
        if (!key) {
            return;
        }
        history.push(`/boards/${key}/follow`);
    }

    return (
        <div className="home-page">
            {matches.length > 0 &&
                matches.map((match, index) => {
                    return (
                        <div
                            className={`match ${
                                match.complete ? 'complete' : ''
                            }`}
                            key={index}
                        >
                            {match.teamOneName} VS {match.teamTwoName}{' '}
                            <button
                                id={match.key}
                                onClick={(evt) => gotoBoard(match.key)}
                            >
                                Go
                            </button>
                        </div>
                    );
                })}
            <div>* Bolded matches are complete</div>
        </div>
    );
}

export default Home;
