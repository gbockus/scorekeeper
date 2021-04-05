import { Set } from '../pages/Boards/Boards';
import { Logger } from './Logger';

export interface Match {
    id: number;
    key?: string;
    complete: boolean;
    sets: Set[];
    teams: Team[]
    createdAt?: number;
}

interface Team {
    name: string
    id?: number,
}

interface MatchResponse {
    key: string;
}

export class API {
    static async getMatch(key: string): Promise<Match> {
        const response = await fetch(`/scoreboard?key=${key}`, {
            method: 'get',
            mode: 'cors',
            cache: 'no-cache',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json',
            },
            referrerPolicy: 'no-referrer',
        });

        return await response.json();
    }

    static async saveMatch(match: Match) {
        Logger.log('saveMatch', { match });
        const response = await fetch('/scoreboard', {
            method: 'POST',
            body: JSON.stringify(match),
            mode: 'cors',
            cache: 'no-cache',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json',
            },
            referrerPolicy: 'no-referrer',
        });

        return await response.json();
    }

    static async createMatch(teamOneId: number, teamTwoId: number): Promise<MatchResponse> {
        const response = await fetch('/scoreboard', {
            method: 'PUT',
            body: JSON.stringify({teamOneId, teamTwoId}),
            mode: 'cors',
            cache: 'no-cache',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json',
            },
            referrerPolicy: 'no-referrer',
        });

        return await response.json();
    }

    static async updateSet(id: number, teamOneScore: number, teamTwoScore: number): Promise<void> {
        await fetch(`/scoreboard/set/${id}`, {
            method: 'POST',
            body: JSON.stringify({teamOneScore, teamTwoScore}),
            mode: 'cors',
            cache: 'no-cache',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json',
            },
            referrerPolicy: 'no-referrer',
        });
    }

    static async getMatches() {
        const response = await fetch(`/matches`, {
            method: 'GET',
            mode: 'cors',
            cache: 'no-cache',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json',
            },
            referrerPolicy: 'no-referrer',
        });

        return await response.json();
    }

    static async getTeams() {
        const response = await fetch(`/teams`, {
            method: 'GET',
            mode: 'cors',
            cache: 'no-cache',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json',
            },
            referrerPolicy: 'no-referrer',
        });

        const json = await response.json();
        return json.teams;
    }

    static async addSet(id: number) {
        const response = await fetch(`/scoreboard/addSet`, {
            method: 'POST',
            body: JSON.stringify({id}),
            mode: 'cors',
            cache: 'no-cache',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json',
            },
            referrerPolicy: 'no-referrer',
        });

        return await response.json();
    }

    static async setMatchComplete(id: number, complete: boolean) {
        const response = await fetch(`/match/${id}/complete`, {
            method: 'POST',
            body: JSON.stringify({complete}),
            mode: 'cors',
            cache: 'no-cache',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json',
            },
            referrerPolicy: 'no-referrer',
        });

        return await response.json();

    }

    static async addTeam(newTeamName: string) {
        await fetch('/team', {
            method: 'PUT',
            body: JSON.stringify({name: newTeamName}),
            mode: 'cors',
            cache: 'no-cache',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json',
            },
            referrerPolicy: 'no-referrer',
        });
    }
}
