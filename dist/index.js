"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const koa_1 = __importDefault(require("koa"));
const koa_bodyparser_1 = __importDefault(require("koa-bodyparser"));
const koa_router_1 = __importDefault(require("koa-router"));
const koa_logger_1 = __importDefault(require("koa-logger"));
const koa_static_1 = __importDefault(require("koa-static"));
const koa_mount_1 = __importDefault(require("koa-mount"));
const koa_cors_1 = __importDefault(require("koa-cors"));
const koa_easy_ws_1 = __importDefault(require("koa-easy-ws"));
const http_status_1 = __importDefault(require("http-status"));
const uuid_1 = require("uuid");
const async_redis_1 = __importDefault(require("async-redis"));
const client = async_redis_1.default.createClient(process.env.REDIS_URL);
client.on('error', (err) => {
    console.log('Redis client Error ' + err);
});
const app = new koa_1.default();
//These are the new change
const static_pages = new koa_1.default();
static_pages.use(koa_static_1.default(__dirname + '/build')); //serve the build directory
app.use(koa_mount_1.default('/', static_pages));
const PORT = process.env.PORT || 3000;
app.use(koa_bodyparser_1.default());
app.use(koa_logger_1.default());
app.use(koa_cors_1.default());
console.log('what', {
    websocket: koa_easy_ws_1.default,
});
// @ts-ignore
app.use(koa_easy_ws_1.default());
const router = new koa_router_1.default();
// matches
router.get('/matches', (ctx, next) => __awaiter(void 0, void 0, void 0, function* () {
    let keys = yield client.keys('*');
    const matches = [];
    // @ts-ignore
    for (let i = 0; i < keys.length; i++) {
        const match = yield client.get(keys[i]);
        console.log('found match', { match });
        matches.push(JSON.parse(String(match)));
    }
    ctx.status = http_status_1.default.OK;
    ctx.body = { matches };
    yield next();
}));
// scoreboard
router.put('/scoreboard', (ctx, next) => __awaiter(void 0, void 0, void 0, function* () {
    const newScoreboard = ctx.request.body;
    const key = uuid_1.v4();
    newScoreboard.key = key;
    console.log('setting value', {
        newScoreboard,
    });
    yield client.set(key, JSON.stringify(newScoreboard));
    ctx.status = http_status_1.default.OK;
    ctx.body = { key };
    yield next();
}));
router.get('/scoreboard', (ctx, next) => __awaiter(void 0, void 0, void 0, function* () {
    const key = ctx.query.key;
    console.log('key', {
        key,
    });
    const json = yield client.get(key);
    console.log('json', {
        json,
    });
    const data = JSON.parse(String(json));
    console.log('data', { data });
    ctx.status = http_status_1.default.OK;
    ctx.body = json;
    yield next();
}));
router.post('/scoreboard', (ctx, next) => __awaiter(void 0, void 0, void 0, function* () {
    const match = ctx.request.body;
    console.log('match update', {
        match,
    });
    const { key } = match;
    yield client.set(key, JSON.stringify(match));
    ctx.status = http_status_1.default.OK;
    yield next();
}));
router.post('/scoreboard/:key/set', (ctx, next) => __awaiter(void 0, void 0, void 0, function* () {
    const setToUpdate = ctx.request.body;
    const key = ctx.params.key;
    console.log('set update', {
        setToUpdate,
        key
    });
    const matchStr = yield client.get(key);
    if (!matchStr) {
        ctx.status = http_status_1.default.NOT_FOUND;
    }
    else {
        const match = JSON.parse(String(matchStr));
        const { setNumber } = setToUpdate;
        match.sets[setNumber - 1] = setToUpdate;
        yield client.set(key, JSON.stringify(match));
        ctx.status = http_status_1.default.OK;
    }
    yield next();
}));
app.use((ctx, next) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('in ws middleware');
    if (ctx.ws) {
        console.log('found a ws!');
        const ws = yield ctx.ws();
        let count = 0;
        setInterval(() => {
            count++;
            ws.send(JSON.stringify({ msg: `hello there ${count}` }));
        }, 5000);
        return ws.send(JSON.stringify({ msg: 'hello there' }));
    }
    yield next();
}));
app.use(router.routes()).use(router.allowedMethods());
app.listen(PORT, function () {
    console.log('==> 🌎  Listening on port %s. Visit http://localhost:%s/', PORT, PORT);
});
