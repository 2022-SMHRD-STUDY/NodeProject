var express = require('express');
const session = require('express-session');
var mongoose = require('mongoose');
var bodyParser = require('body-parser'); 
var methodOverride = require('method-override');
const bcrypt = require('bcrypt')
require('dotenv').config({path: __dirname + '\\' + '.env'});

var app = express();

//use로 미들웨어사용. 세션
app.use(session({
  HttpOnly: true, // true로 하면 사용자가 자바스크립트 통해서 세션 사용불가 (권장)
  secure: true, //https 에서만 세션을 주고받을 수 있음 ( http 에서는 불가 )
  secret: process.env.SECRET, // .env에서 SECRET값 가져오기
  resave: false,  // 세션을 저장하고 불러올 때 세션을 다시 저장할지 여부
  saveUninitialized: true,  // 세션에 저장할 때 초기화할지 여부
  cookie: { maxAge: 24000 * 60 * 60 }  //쿠키의 생명주기 단위는 ms
}));

// DB setting
mongoose.connect(process.env.MONGO_DB);
var db = mongoose.connection;
db.once('open', function(){
  console.log('DB connected');
});
db.on('error', function(err){
  console.log('DB ERROR : ', err);
}); 

// Other settings
app.set('view engine', 'ejs');
app.use(express.static(__dirname+'/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(methodOverride('_method'));

// DB schema - 회원
var user_info = mongoose.Schema({
    id:{type:String, required:true, unique:true},
    password:{type:String},
    name:{type:String}
  });
  
// DB schema - 강사 리뷰
var t_review = mongoose.Schema({
    comment:{type:String, required:true, unique:true},
    password:{type:String}
  });

var User_info = mongoose.model('user_info', user_info);
var T_review = mongoose.model('t_review', t_review);

app.get('/', function(req, res){
    res.redirect('/contacts');
  });

//Contacts - Index
app.get('/contacts', function(req, res){
    console.log(req.session.userId)
    res.render('contacts/index')
  })

app.get('/contacts/newUser', function(req, res){
    res.render('contacts/newuser');
  });

  // Contacts - New user
app.post('/contacts/newuser', function(req, res){
  req.body.password = bcrypt.hashSync(req.body.password, 10)
    User_info.create(req.body, function(err, user_info){
      // console.log(req.body.password)
      if(err) return res.json(err);
      res.redirect('/contacts');
    });
  });


// 로그인 유저 검색 후 데이터 전송 
app.post('/contacts/Login', function(req, res){
  // 입력받은 비밀번호를 암호화한다.
  let encryptedPassowrd = bcrypt.hashSync(req.body.password, 10)
  User_info.findOne({id:req.body.id}, function(err, user_info){
      if(err) return res.json(err);

      // 검색결과가 있을 때
      if(user_info != null){ 
        // 비밀번호가 일치할 때
        if(bcrypt.compareSync(req.body.password, user_info.password)){
          console.log("비밀번호 일치")
          //세션 생성
          req.session.userId = user_info;
          console.log(req.session.userId)
          req.session.save(()=>{
            res.render('contacts/main',{user_info:req.session.userId}); // db검색값 객체 전체를 넣어준다.
          });
        }
        // 비밀번호가 일치하지 않을 때
        else{
          console.log("비밀번호가 올바르지않아")
          res.redirect('/contacts');
        }
      }

      // 검색결과가 없을 때
      else{
        console.log("존재하지않는 아이디야")
        res.redirect('/contacts');
      }
    });
  });



  // /contacts/Login
  // Port setting
var port = 3000;
app.listen(port, function(){
  console.log('server on! http://localhost:'+port);
});
