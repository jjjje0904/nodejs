const { User } = require('../models/User')
//인증처리를 하는 곳
let auth = (req, res, next) => {
    //클라이언트 쿠키에서 토큰을 가져온다. 
    let token = req.cookies.x_auth
    //토크을 복호화한 후 유저를 찾는다.
    User.findByToken(token)
      .then(user => {
        if (!user) {
            
          return res.json({ isAuth: false, error: true })
        }
        //유저가 있으면 인증 okay
  
        req.token = token
        req.user = user
        next() //middelware에서 벗어날 수 있도록
      })
      .catch(err => {
        throw err
      })
} 

module.exports = { auth }; 