const express = require('express')
const cors = require('cors')
const { encode } = require('html-entities')

const app = express()
const port = 3000

const users = [
    {
        id: '1234',
        username: 'long',
        email: 'long@gmail.com',
        password: '1234'
    }
]
const messages = []

function makeid(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }
    return result;
}

// Chấp nhận để origin http://127.0.0.1:5500 được phép truy cập
app.use(cors({
    origin: ['http://127.0.0.1:5500']
}))

app.use(express.json())

app.get('/users', (req, res) => {
    // logic
    res.json({
        name: 'F8'
    })
})

app.post('/auth/register', (req, res) => {
    const newUser = {
        id: makeid(4),
        // Dùng hàm encode để mã hóa các ký tự <, >,... Tránh bị xss attach
        // Tham khảo thêm tại: https://viblo.asia/p/ky-thuat-tan-cong-xss-va-cach-ngan-chan-YWOZr0Py5Q0
        username: encode(req.body.username), 
        email: req.body.email,
        password: req.body.password,
    }

    // Kiểm tra xem user đã xuất hiện hay chưa
    const existed = users.some((user) => {
        return user.email === newUser.email
    })

    // Nếu xuất hiện thì trả về mã 409
    if (existed) {
        return res.status(409).json({
            message: 'Email was existed.'
        });
    }

    // Thêm user mới vào mảng users
    users.push(newUser)

    return res.json({
        data: {
            id: newUser.id,
            email: newUser.email,
            username: newUser.username,
        }
    })
})

app.post('/auth/login', (req, res) => {
    // Kiểm tra xem trong mảng users có xuất hiện user với email và password
    // tương ứng hay không
    const body = req.body;
    const user = users.find(user => {
        return user.email === body.email && user.password === body.password
    })

    if (!user) {
        return res.status(401).json({
            message: 'Unauthenticated.'
        })
    }
    return res.json({
        data: {
            id: user.id,
            username: user.username,
            email: user.email,
        }
    })
})

app.post('/messages', (req, res) => {
    const body = req.body
    console.log(body)
    
    const user = users.find(user => user.id === body.userId)
    if (!user) {
        return res.status(401).json({
            message: 'Unauthenticated.'
        })
    }

    const newMessage = {
        content: encode(body.content),
        userId: body.userId
    }

    messages.push(newMessage)

    return res.json({
        data: newMessage
    })
})

app.get('/messages', (req, res) => {
    const data = messages.map(message => {
        const user = users.find(user => user.id === message.userId)

        return {
            content: message.content,
            userId: message.userId,
            username: user.username
        }
    })

    return res.json({
        data
    })
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
