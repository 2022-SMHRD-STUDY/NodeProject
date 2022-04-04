var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser'); 
var methodOverride = require('method-override');
const bcrypt = require('bcrypt')
var app = express();

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

// DB schema
var user_info = mongoose.Schema({
    id:{type:String, required:true, unique:true},
    password:{type:String},
    name:{type:String}
  });

var User_info = mongoose.model('user_info', user_info);

app.get('/', function(req, res){
    res.redirect('/contacts');
  });

//user_info - Index
app.get('/contacts', function(req, res){
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
          res.render('contacts/main');
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


  // Port setting
var port = 3000;
app.listen(port, function(){
  console.log('server on! http://localhost:'+port);
});
