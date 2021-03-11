import Koa from 'koa';
import BodyParser from 'koa-bodyparser';
import Router from 'koa-router';
import Logger from 'koa-logger';
import serve from 'koa-static';
import mount from 'koa-mount';
import cors from 'koa-cors';
import websocket from 'koa-easy-ws';
import HttpStatus from 'http-status';
import { v4 as uuid } from 'uuid';
import AsyncRedis from 'async-redis';

const client = AsyncRedis.createClient(process.env.REDIS_URL);

client.on('error', (err) => {
    console.log('Redis client Error ' + err);
});
const app = new Koa();

//These are the new change
const static_pages = new Koa();
static_pages.use(serve(__dirname + '/build')); //serve the build directory
app.use(mount('/', static_pages));

const PORT = process.env.PORT || 3000;

app.use(BodyParser());
app.use(Logger());
app.use(cors());
console.log('what', {
    websocket,
});

// @ts-ignore
app.use(websocket());

const router = new Router();

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
    await client.set(key, JSON.stringify(match));

    ctx.status = HttpStatus.OK;
    await next();
});

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
        await client.set(key, JSON.stringify(match));

        ctx.status = HttpStatus.OK;
    }

    await next();
});

app.use(async (ctx, next) => {
    console.log('in ws middleware');
    if (ctx.ws) {
        console.log('found a ws!');

        const ws = await ctx.ws();
        let count = 0;
        setInterval(() => {
            count++;
            ws.send(JSON.stringify({ msg: `hello there ${count}` }));
        }, 5000);
        return ws.send(JSON.stringify({ msg: 'hello there' }));
    }
    await next();
});

app.use(router.routes()).use(router.allowedMethods());

app.listen(PORT, function () {
    console.log(
        '==> 🌎  Listening on port %s. Visit http://localhost:%s/',
        PORT,
        PORT
    );
});
