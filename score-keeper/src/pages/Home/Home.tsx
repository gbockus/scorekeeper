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
                    Logger.log('render match', {size: match.teams.length});
                    return (
                        <div
                            className={`match ${
                                match.complete ? 'complete' : ''
                            }`}
                            key={index}
                        >
                            {match.teams[0].name} VS {match.teams[1].name}{' '}
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
