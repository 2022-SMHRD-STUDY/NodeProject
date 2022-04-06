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
    title:{type:String, required:true, unique:true},
    comment:{type:String},
    password:{type:String}
  });

var User_info = mongoose.model('user_info', user_info);
var T_review = mongoose.model('t_review', t_review);

app.get('/', function(req, res){
    res.redirect('/contacts');
  });

//user_info - Index
app.get('/contacts', function(req, res){
    console.log(req.session.userId)
    res.render('contacts/index')
  })

app.get('/contacts/newUser', function(req, res){
    res.render('contacts/newuser');
  });

  // user_info - New user
app.post('/contacts/newuser', function(req, res){
  req.body.password = bcrypt.hashSync(req.body.password, 13)
    User_info.create(req.body, function(err, user_info){
      // console.log(req.body.password)
      if(err) return res.json(err);
      res.redirect('/contacts');
    });
  });

// user_info - Login
app.post('/contacts/Login', function(req, res){
  // 입력받은 비밀번호를 암호화한다.
  let encryptedPassowrd = bcrypt.hashSync(req.body.password, 13)
  User_info.findOne({id:req.body.id}, function(err, user_info){ //user_info에 결과값을 담는다.
      if(err) return res.json(err);
      console.log(user_info)
      // 검색결과가 있을 때
      if(user_info != null){ 
        // 비밀번호가 일치할 때
        // bcrypt.compareSync(입력받은 암호 문자열, db에 있는 해쉬암호값)
        if(bcrypt.compareSync(req.body.password, user_info.password)){
          console.log("비밀번호 일치")
          //세션 생성
          req.session.userId = user_info;
          //req.session.넣고싶은이름 = 넣을거 ( 객체도 변수1개도 들어가고.)
          console.log(req.session.userId)
          req.session.save(()=>{
            res.render('contacts/main',{user_info:req.session.userId}); // db검색값 객체 전체를 넣어준다.
            // 키:밸류
          });
        }
        else{     // 비밀번호가 일치하지 않을 때
          console.log("비밀번호가 올바르지않아")
          res.redirect('/contacts');
        }
      }
      else{     // 검색결과가 없을 때
        console.log("존재하지않는 아이디야")
        res.redirect('/contacts');
      }
    });
  });

// T_review- show
app.get('/contacts/tboard', function(req, res){
  if(typeof req.session.userId == "undefined" ){
    return res.redirect('/contacts');
  }
  T_review.find({}, function(err, t_review){
      if(err) return res.json(err);
      res.render('contacts/tboard', {t_review:t_review});
    });
  }); 

// T_review - create form
app.get('/contacts/tboard/new', function(req, res){
  res.render('contacts/newform');
});

// T_review - create form
app.post('/contacts/tboard/new', function(req, res){
  T_review.create(req.body, function(err, T_review){
    if(err) return res.json(err);
    res.redirect('/contacts/tboard');
  });
});

// 리뷰 삭제
app.delete('/contacts/tboard/:id', function(req, res){
  T_review.deleteOne({_id:req.params.id}, function(err){
    if(err) return res.json(err);
  
  });
});

// 리뷰 업데이트
app.put('/contacts/tboard/:id', function(req, res){
  T_review.findOne({_id:req.params.id}, function(err, T_review1){
    var pw = T_review1.password;
    // console.log(pw)
    // console.log(req.body.input_password)
    if(pw==req.body.input_password){
      console.log(req.body)
      T_review.findOneAndUpdate({_id:req.params.id}, req.body, function(err, T_review){
        if(err) return res.json(err);
        res.redirect('/contacts/tboard');
      });
    }
    //alret 띄우고 페이지 이동하기
    res.write("<script>alert('wrong Password')</script>");
    res.write("<script>window.location=`/contacts/tboard`</script>");  
    
    // res.redirect('/contacts/tboard');
  });

});



  // Port setting
var port = 3000;
app.listen(port, function(){
  console.log('server on! http://localhost:'+port);
});

function sessionCheck(req,res){
  if(typeof req.session.userId == "undefined" ){
    res.redirect('/contacts');
  }
}
