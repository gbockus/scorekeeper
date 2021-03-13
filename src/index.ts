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
import AsyncRedis from 'async-redis';
import send from "koa-send";

const client = AsyncRedis.createClient(process.env.REDIS_URL);

client.on('error', (err) => {
    console.log('Redis client Error ' + err);
});
const app = new Koa();

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
    let keys = await client.keys('*');
    const matches = [];
    // @ts-ignore
    for (let i = 0; i < keys.length; i++) {
        const match = await client.get(keys[i]);
        console.log('found match', { match });
        matches.push(JSON.parse(String(match)));
    }
    ctx.status = HttpStatus.OK;
    ctx.body = { matches };
    await next();
});

// scoreboard
router.put('/scoreboard', async (ctx, next) => {
    const newScoreboard = ctx.request.body;
    const key = uuid();
    newScoreboard.key = key;
    console.log('setting value', {
        newScoreboard,
    });
    await client.set(key, JSON.stringify(newScoreboard));
    ctx.status = HttpStatus.OK;
    ctx.body = { key };
    await next();
});

router.get('/scoreboard', async (ctx, next) => {
    const key = ctx.query.key as string;
    console.log('key', {
        key,
    });
    const json = await client.get(key);
    console.log('json', {
        json,
    });
    const data = JSON.parse(String(json));
    console.log('data', { data });
    ctx.status = HttpStatus.OK;
    ctx.body = json;
    await next();
});

router.post('/scoreboard', async (ctx, next) => {
    const match = ctx.request.body;
    console.log('match update', {
        match,
    });
    const { key } = match;
    const matchJson = JSON.stringify(match);
    await client.set(key, matchJson);

    ctx.status = HttpStatus.OK;
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

router.post('/scoreboard/:key/set', async (ctx, next) => {
    const setToUpdate = ctx.request.body;
    const key = ctx.params.key;
    console.log('set update', {
        setToUpdate,
        key,
    });

    const matchStr = await client.get(key);
    if (!matchStr) {
        ctx.status = HttpStatus.NOT_FOUND;
    } else {
        const match = JSON.parse(String(matchStr));
        const { setNumber } = setToUpdate;
        match.sets[setNumber - 1] = setToUpdate;
        const matchJson = JSON.stringify(match);
        await client.set(key, JSON.stringify(match));

        ctx.status = HttpStatus.OK;

        await sendWebsocketMatchInfo(matchJson);
    }

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
