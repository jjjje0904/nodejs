const express = require('express')
const app = express()
const port = 5000
const bodyParser = require('body-parser');
const config = require('./config/key');
const cookieParser = require('cookie-parser');
const { User }=require("./models/User");
const { auth } = require("./middleware/auth");

//application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended:true}));
//application/json
app.use(bodyParser.json());
app.use(cookieParser());

const mongoose = require('mongoose')
mongoose.connect(config.mongoURI).then(()=>console.log('MongoDB Connected...'))
 .catch(err=>console.log(err))


app.get('/', (req, res) => {res.send('Hello World!~~안녕하세요 하하')})

app.post('/api/users/register',async (req,res) =>{
    //회원 가입 할 때 필요한 정보들을 client에서 가져오면
    //그것들을 데이터 베이스에 넣어준다

    const user = new User(req.body)

    await user
    .save()
    .then(()=>{
        res.status(200).json({
            success:true,
        });

    })
    .catch((err)=>{
        console.error(err);
        res.json({
            success: false,
            err: err,
        })
    })
   
})
//로그인 라우트에서 해야 할 것 3가지

    //요청된 이메일이 데이터베이스 안에 있는지 찾는다.
   
         //요청된 이메일이 데이터 베이스에 있다면 비밀번호가 맞는 비밀번호인지 확ㅇ니
        
            //비밀번호가 틀렸을 때
           

            //비밀번호가 맞았을 때 => user 위한 토큰 생성
           
                //토큰 생성을 위해서 JSONWEBTOKEN라이브러리를 다운로드받아야함
                
                //토큰을 저장한다. 어디에? 쿠키, 로컬스토리지
                

app.post("/api/users/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
      if (!user) {
          return res.json({
              loginSuccess: false,
              message: "제공된 이메일에 해당하는 유저가 없습니다."
          })
      }

    const isMatch = await user.comparePassword(req.body.password)
      if (!isMatch)
        return res.json({ loginSuccess: false, message: "비밀번호가 틀렸습니다."})

    const token = user.generateToken();

    res.cookie("x_auth", user.token)
    .status(200)
    .json({ loginSuccess: true, userId: user._id })
  } catch (err) {
    return res.status(400).json({ loginSuccess: false, error: err })
  } 
})

app.get('/api/users/auth', auth, (req, res) => {

  res.status(200).json({
    _id: req.user._id,
    isAdmin: req.user.role === 0 ? false : true,
    isAuth: true,
    email: req.user.email,
    name: req.user.name,
    lastname: req.user.lastname,
    role: req.user.role,
    image: req.user.image,
  })
})

app.get('/api/users/logout', auth, async (req, res) => {
  try {
    await User.findOneAndUpdate({ _id: req.user._id }, { token: "" })
    return res.status(200).send({
      success: true
    })
  } catch (err) {
    return res.json({ success: false, err })
  }
})





app.listen(port, () => {console.log(`Example app listening on port ${port}`)})