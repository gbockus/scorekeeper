import React, { FormEvent, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Logger } from '../../utils/Logger';
import { API } from '../../utils/API';

import './NewBoard.css';

function NewBoard() {
    const [teamOne, setTeamOne] = useState('NHVC');
    const [teamTwo, setTeamTwo] = useState('');
    const [error, setError] = useState('');
    const history = useHistory();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        Logger.log('handleSubmit', {
            teamOne,
            teamTwo,
        });

        if (teamOne === '' || teamTwo === '') {
            setError('Please provide a name for both teams.');
            return;
        }

        const result = await API.createMatch({
            teamOneName: teamOne,
            teamTwoName: teamTwo,
            sets: [],
            complete: false,
        });
        Logger.log('result', {
            result,
        });
        const params = new URLSearchParams();
        params.append('key', result.key);
        history.push(`/boards/${result.key}`);
    };

    const handleChange = (e: FormEvent) => {
        e.preventDefault();
        setError('');
        const target = e.target as HTMLInputElement;
        Logger.log('handleChange', {
            value: target.value,
        });
        if (target.name === 'teamOne') {
            setTeamOne(target.value);
        } else if (target.name === 'teamTwo') {
            setTeamTwo(target.value);
        }
    };

    return (
        <div className="new-page">
            <h2>New ScoreBoard</h2>
            <form onSubmit={handleSubmit} onChange={handleChange}>
                <label>
                    Team One:
                    <input type="text" name="teamOne" defaultValue={teamOne} />
                </label>
                <label>
                    Team Two:
                    <input type="text" name="teamTwo" />
                </label>
                {error !== '' && <div className="error">{error}</div>}
                <input type="submit" value="Create Scoreboard" />
            </form>
        </div>
    );
}

export default NewBoard;
