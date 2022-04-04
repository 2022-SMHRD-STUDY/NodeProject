require('dotenv').config({path: __dirname + '\\' + '.env'});
const express = require('express');
const session = require('express-session');
const router = require('./router')

const app = express();
const port = 3000;
app.use(session({
    HttpOnly: true, // true로 하면 사용자가 자바스크립트 통해서 세션 사용불가 (권장)
    secure: true, //https 에서만 세션을 주고받을 수 있음 ( http 에서는 불가 )
    secret: process.env.SECRET, // .env에서 SECRET값 가져오기
    resave: false,  // 세션을 저장하고 불러올 때 세션을 다시 저장할지 여부
    saveUninitialized: true,  // 세션에 저장할 때 초기화할지 여부
    cookie: { maxAge: 24000 * 60 * 60 }  //쿠키의 생명주기 단위는 ms
}));
app.use(router)

app.listen(port, () => {
    console.log(`#### webpack-dev-server is listening on port ${port}. ${new Date().toLocaleString()} ####  http://localhost:3000/`);
});