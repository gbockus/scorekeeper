import Koa from 'koa';
import BodyParser from 'koa-bodyparser';
import Router from 'koa-router';
import Logger from 'koa-logger';
import serve from 'koa-static';
import mount from 'koa-mount';
import cors from 'koa-cors';
import WebSocket from 'ws';
import HttpStatus from 'http-status';
import { v4 as uuid } from 'uuid';
import send from "koa-send";
import {DAO} from './dao/DAO';


const app = new Koa();
const dao = new DAO();

const static_pages = new Koa();
static_pages.use(serve(__dirname + '/build')); //serve the build directory
app.use(mount('/', static_pages));

const PORT = process.env.PORT || 3000;

app.use(BodyParser());
app.use(Logger());
app.use(cors());

const router = new Router();

if (process.env.NODE_ENV === 'production') {
    const REACT_ROUTES = [
        '/boards',
        '/boards/:key',
        '/boards/:key/:follow',
        '/new'
    ];
    // Handle React routing, return all requests to React app
    router.get(REACT_ROUTES, async (ctx, next) => {
        console.log('React route found.');
        await send(ctx, 'dist/build/index.html');
    });
}

// matches
router.get('/matches', async (ctx, next) => {
   const matches = await dao.getMatches();
    console.log('Matches', {matches});
    ctx.status = HttpStatus.OK;
    ctx.body = { matches };
    await next();
});

// matches
router.get('/teams', async (ctx, next) => {
    const teams = await dao.getTeams();
    console.log('Teams', {teams});
    ctx.status = HttpStatus.OK;
    ctx.body = { teams };
    await next();
});

router.put('/team', async (ctx, next) => {
    const {name} = ctx.request.body;
    await dao.createTeam(name);
    ctx.status = HttpStatus.OK;
    await next();
});

// scoreboard
router.put('/scoreboard', async (ctx, next) => {
    const {teamOneId, teamTwoId} = ctx.request.body;
    const newMatch = await dao.createScoreboard(teamOneId, teamTwoId);
    ctx.status = HttpStatus.OK;
    ctx.body = { key: newMatch.key, matchId: newMatch.id };
    await next();
});

router.get('/scoreboard', async (ctx, next) => {
    const key = ctx.query.key as string;
    console.log('key', {
        key,
    });
    const match = await dao.getMatchByKey(key);
    console.log('found match', {match});
    ctx.status = HttpStatus.OK;
    ctx.body = match;
    await next();
});

router.post('/scoreboard', async (ctx, next) => {
    const match = ctx.request.body;
    console.log('match update', {
        match,
    });
    const { key } = match;
    const matchJson = JSON.stringify(match);
    // await client.set(key, matchJson);

    ctx.status = HttpStatus.OK;
    // await sendWebsocketMatchInfo(matchJson);
    await sendWebsocketMatchInfo({});

    await next();
});

router.post('/scoreboard/addSet', async (ctx, next) => {
    const {id} = ctx.request.body;
    console.log('add set', {
        id,
    });
    const match = await dao.addSet(id);
    console.log('set added', match);
    const matchJson = JSON.stringify(match);

    ctx.status = HttpStatus.OK;
    ctx.body = match;

    await sendWebsocketMatchInfo(matchJson);
    await next();
});

const sendWebsocketMatchInfo = (matchJson) => {
    try {
        console.log('Number of clients: ', {
            count: websocketServer.clients.size,
        });
        websocketServer.clients.forEach((client) => {
            if (client.readyState === 1) {
                console.log('sending data to socket');
                client.send(matchJson);
            }
        });
    } catch (err) {
        console.log('Failed to send data to web sockets.  Not bailing. ', {
            message: err.message,
        });
    }
}

router.post('/scoreboard/set/:id', async (ctx, next) => {
    const {teamOneScore, teamTwoScore} = ctx.request.body;
    const id: number = Number(ctx.params.id);
    console.log('set update', {
        id,
        teamOneScore,
        teamTwoScore
    });

    // const matchStr = await client.get(key);
    const match = dao.updateSetScore(id, teamOneScore, teamTwoScore);
    if (!match) {
        ctx.status = HttpStatus.NOT_FOUND;
    } else {
        ctx.status = HttpStatus.OK;
        const matchJson = JSON.stringify(match);
        await sendWebsocketMatchInfo(matchJson);
    }

    await next();
});

router.post('/match/:id/complete', async (ctx, next) => {
    const {complete} = ctx.request.body;
    const id: number = Number(ctx.params.id);
    console.log('set match complete', {
        id,
        complete
    });

    // const matchStr = await client.get(key);
    const match = await dao.updateMatchComplete(id, complete);
    ctx.status = HttpStatus.OK;
    console.log('result of update', match);
    ctx.body = match;
    const matchJson = JSON.stringify(match);
    await sendWebsocketMatchInfo(matchJson);

    await next();
});

app.use(router.routes()).use(router.allowedMethods());

const server = app.listen(PORT, function () {
    console.log(
        '==> 🌎  Listening on port %s. Visit http://localhost:%s/',
        PORT,
        PORT
    );
});

const websocketServer = new WebSocket.Server({ server });

websocketServer.on('connection', (ws: any) => {
    //connection is up, let's add a simple simple event
    ws.on('message', (message: string) => {
        //log the received message and send it back to the client
        console.log('received: %s', message);
        ws.send(`Hello, you sent -> ${message}`);
    });

    // ws.send('Hi there, I am a WebSocket server');
});
