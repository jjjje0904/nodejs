const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const saltRounds =10;
const jwt = require('jsonwebtoken');


const userSchema = mongoose.Schema({
    name:{
        type: String,
        maxlength: 50

    },
    email:{
        type: String,
        trim: true,
        unique:1
    },
    password:{
        type:String,
        minlength:5
    },
    lastname:{
        type: String,
        maxlength:50
    },
    role:{
        type: Number,
        default: 0
    },

    image: String,
    token:{
        type: String
    },
    tokenExp:{
        type: Number
    }

})


userSchema.pre('save',function(next){
    var user = this;
    if(user.isModified('password')){
        bcrypt.genSalt(saltRounds, function(err, salt) {
            if(err) return next(err)
            bcrypt.hash(user.password, salt, function(err, hash) {
                // Store hash in your password DB.
                if(err) return next(err)
                user.password = hash
                next()
            });
    
        });

    }
    //비밀번호를 암호화 시킨다
    else{
        next()
    }
    
})

userSchema.methods.comparePassword = function(plainPassword){
    const user = this;
    return new Promise((resolve,reject)=>{
        bcrypt.compare(plainPassword,user.password)
        .then(isMatch=>resolve(isMatch))
        .catch(err => reject(err))
    })
    //plainPassword: 1234567 암호화된 비밀번호: ~를 같은지 체크해야함
    //암호화된걸 복호화해서 비교할 수 없음 => plainPassword을 암호화해서 암호화된
    //비밀번호랑 비교해야 함
    
}

userSchema.methods.generateToken = function(){
    const user = this;
    //jsonwebtoken이용해서 token 생성하기
    const token = jwt.sign(user._id.toHexString(), 'secretToken')
    user.token = token
    return user.save().then(savedUser => savedUser)
}

userSchema.statics.findByToken = function(token) {
    const User = this
    let decoded
    //토큰을 decode 한다.
    try {
      decoded = jwt.verify(token, 'secretToken')
      //유저 아이디를 이용해서 유저를 찾은 다으메
      //클라이언트에서 가져온 toke과 DB에 보관된 토큰이 일치하는지 확인
    } catch (err) {
      return Promise.reject(err)
    }
  
    return User.findOne({ _id: decoded, token })
} 



const User = mongoose.model('User',userSchema)

module.exports = {User}