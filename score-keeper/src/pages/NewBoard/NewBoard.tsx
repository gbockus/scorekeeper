import React, {FormEvent, useEffect, useState} from 'react';
import { useHistory } from 'react-router-dom';
import { Logger } from '../../utils/Logger';
import { API } from '../../utils/API';

import './NewBoard.css';

interface Team {
    id: number;
    name: string;
    createdAt: Date;
}

function NewBoard() {
    const [teamOne, setTeamOne] = useState('NHVC');
    const [teamTwo, setTeamTwo] = useState('');
    const [teams, setTeams]= useState<Team[]>([]);
    const [loaded, setLoaded] = useState(false);
    const [newTeamName, setNewTeamName] = useState('');
    const [error, setError] = useState('');
    const history = useHistory();

    const getTeams = async () => {
        Logger.log('getTeams');
        const teams = await API.getTeams();
        Logger.log('teams response', teams);
        setTeams(teams);
    };

    useEffect(() => {
        if (!loaded) {
            getTeams()
              .then(()=> {
                  console.log('setting loaded');
                  setLoaded(true)
              });
        }
    });

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

        if (teamOne === teamTwo) {
            setError('Please select two different teams.');
            return;
        }


        const selectedTeamOne = teams.find((team) => team.name === teamOne);
        const selectedTeamTwo = teams.find((team) => team.name === teamTwo);
        if (!selectedTeamOne || !selectedTeamTwo) {
            console.log('unable to find teams.');
            return;
        } else {
            console.log('Creating match with ', {
                one: selectedTeamTwo.id,
                two: selectedTeamTwo.id
            })
        }
        const result = await API.createMatch(selectedTeamOne.id, selectedTeamTwo.id);
        Logger.log('result', {
            result,
        });
        const params = new URLSearchParams();
        params.append('key', result.key);
        history.push(`/boards/${result.key}`);
    };


    const options = teams.length > 0
      && teams.map((item: Team, i) => {
          return (
            <option key={i} value={item.name}>{item.name}</option>
          )
      });

    const changeTeamOne = (event: any) => {
        console.log('set team one', event.target.value);
        setTeamOne(event.target.value);
    }
    const changeTeamTwo = (event: any) => {
        console.log('set team two', event.target.value);
        setTeamTwo(event.target.value);
    }

    const handleAddTeam = async (event: FormEvent) => {
        event.preventDefault();
        await API.addTeam(newTeamName);
        const updatedTeams = await API.getTeams();
        setTeams(updatedTeams);
        setNewTeamName('');
    }


    return (
        <div className="new-page">
            <h2>New ScoreBoard</h2>
            <form onSubmit={handleSubmit}>
                <label>
                    Team One:
                    <select onChange={changeTeamOne}>{options}</select>
                </label>
                <label>
                    Team Two:
                    <select onChange={changeTeamTwo}>{options}</select>
                </label>
                {error !== '' && <div className="error">{error}</div>}
                <input type="submit" value="Create Scoreboard" />
            </form>
            <h2>Add Team</h2>
            <form onSubmit={handleAddTeam}>
                <label>
                    New Team Name:
                    <input type='text' value={newTeamName} onChange={(evt) => setNewTeamName(evt.target.value)} />
                </label>
                {error !== '' && <div className="error">{error}</div>}
                <input type="submit" value="Create New Team" />
            </form>
        </div>
    );
}

export default NewBoard;
