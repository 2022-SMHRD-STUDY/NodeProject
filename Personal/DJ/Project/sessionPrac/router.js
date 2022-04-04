const express = require('express');

const router = express.Router();

router.get('/auth', (req,res)=>{
    req.session.userId = req.body.userId;
    req.session.save();
    // console.log(req.body.userId)
    res.send('한글 되냐?'); // send는 자동으로 utf-8로 인코딩한다.
    // express를 사용하지 않았을 때는  res.writeHead()부분에 한글 관련 인코딩이 들어갔다.
})

router.get('*', (req, res) => {
    res.sendFile(__dirname+'/index.html');
})

module.exports = router;