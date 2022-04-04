const express = require('express');
const session = require('express-session');
const FileStore = require('session-file-store')(session); // 1
const app = express();
app.use(session({  // 2
  secret: 'keyboard cat',  // 암호화
  resave: false,
  saveUninitialized: true,
  store: new FileStore()
}));
app.get('/', (req, res, next) => {  // 3
  console.log(req.session);
  if(!req.session.num){
    req.session.num = 1;
  } else {
    req.session.num = req.session.num + 1;
  }
  res.send(`Number : ${req.session.num}`);
});
app.listen(3000, () => {
  console.log('listening 3000port');
});