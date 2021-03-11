import { Set } from '../pages/Boards/Boards';
import { Logger } from './Logger';

export interface Match {
    teamOneName: string;
    teamTwoName: string;
    key?: string;
    complete: boolean;
    sets: Set[];
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

    static async createMatch(match: Match): Promise<MatchResponse> {
        const response = await fetch('/scoreboard', {
            method: 'PUT',
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

    static async updateSet(key: string, setToUpdate: Set): Promise<void> {
        await fetch(`/scoreboard/${key}/set`, {
            method: 'POST',
            body: JSON.stringify(setToUpdate),
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
}
