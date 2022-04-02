var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser'); 
var methodOverride = require('method-override');
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

// var newUser = new User_info({id:'admin',password:'123', name:'admin'}

// newUser.save(function(error, data){
//     if(error){
//         console.log(error);
//     }else{
//         console.log('Saved!')
//     }
// })

app.get('/', function(req, res){
    res.redirect('/contacts');
  });

//Contacts - Index
app.get('/contacts', function(req, res){
    res.render('contacts/index')
  })

app.get('/contacts/newUser', function(req, res){
    res.render('contacts/newuser');
  });

  // Contacts - New user
app.post('/contacts/newuser', function(req, res){
    User_info.create(req.body, function(err, user_info){
      if(err) return res.json(err);
      res.redirect('/contacts');
    });
  });
  


  // Port setting
var port = 3000;
app.listen(port, function(){
  console.log('server on! http://localhost:'+port);
});
