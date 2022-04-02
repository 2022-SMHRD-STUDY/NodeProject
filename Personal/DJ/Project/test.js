const bcrypt = require('bcrypt')

const password = '1234'
const encryptedPassowrd = bcrypt.hashSync(password, 10) // sync
// Sync가 붙지 않으면 비동기 방식으로 콜백을 받아서 처리하게 끔 되어있구요.
// Sync가 붙으면 동기 방식으로 메서드 기능에 맞게 데이터를 리턴을 받게 끔 되어있어요.
// 상황에 맞게 적절히 사용하시면 됩니다.
bcrypt.hash(password, 10, (err, encryptedPassowrd) => {
    // async callback
})

console.log(encryptedPassowrd)

const same = bcrypt.compareSync(password, encryptedPassowrd) // sync
console.log(same) 