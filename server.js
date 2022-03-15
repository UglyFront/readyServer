const express = require("express");
const cors = require("cors");
const { json } = require("express");
const pg = require("pg").Pool

const db = new pg({
    user: "postgres",
    password: "109109109",
    port: 5432,
    database: "chat",
    host: "localhost"
})

db.connect()

const app = express()

app.use(express.json())


app.use(cors({
    origin: "*"
}))


const PORT = 4444


// REG AUTH

app.post("/login", (req, res) => {
    let {login, password} = req.body;

    db.query(`SELECT * FROM users where login = '${login}' AND password = '${password}';`, (e,r,f) => {
        try {
            if(!r.rows.length) {
                res.status(400).json("Не найден пользователь")
            }
            else {
                res.status(200).json(r.rows[0])
            }
        } catch(e) {
            res.status(400).json()

        }
    })
} )

app.post("/reg", (req, res) => {
    let {name, login, password} = req.body;

    db.query(`SELECT * FROM users where login = '${login}';`, (e,r,f) => {
        try {
            if(r.rows.length) {
                res.status(400).json("Логин не уникален!")
            }
            else {
                db.query(`INSERT INTO users(name, login, password) VALUES ('${name}', '${login}', '${password}');`, (e2, r2, f2) => {
                    res.status(200).json("Успешно!")
                })
            }
        } catch(e) {
            res.status(400).json()

        }
    })
} )



////////////////////////////////////////////////////////////////////////////////////////////////////



//UPDATE USER



app.get("/search", (req, res) => {
    let str = req.query.v
    console.log(str.length)
    try {
        if (str.length !== 1 || str.length !== 0) {
            db.query(`SELECT id, name, img, about FROM users WHERE login LIKE '${str}%'`, (e, r, f) => {
                res.status(200).json(r.rows)
            })
        }
        else {
            console.log("НАЗУЙ")
        }
    } catch(e) {
        console.log(e)
        res.status(400).json()
    } 
})



app.get("/user", (req, res) => {
    let id = req.query.id;

    try {
        db.query(`SELECT name, login, id, about, img FROM users where id = ${+id};`, (e,r,f) => {
            res.status(200).json(r.rows[0])
        })
    } catch(e) {
        console.log(e)
        res.status(400).json()
    }

})


app.put("/img", (req, res) => {
    let {id, img} = req.body;

    console.log(req.body)

    db.query(`UPDATE users SET img = '${img}' where id = ${+id};`, (e,r,f) => {
        res.status(200).json("Обновлено!")
    })
})

app.put("/about", (req, res) => {
    let {id, about} = req.body;

    db.query(`UPDATE users set about = '${about}' where id = ${+id};`, (e,r,f) => {
        res.status(200).json("Обновлено!")
    })
})

app.put("/name", (req, res) => {
    let {id, name} = req.body;

    db.query(`UPDATE users set name = '${name}' where id = ${+id};`, (e,r,f) => {
        res.status(200).json("Обновлено!")
    })
})


///////////////////////////////////////////////////////////////////////////////////////////////////



//MSG

app.post("/msg", async (req, res) => {
    let {idsend, idadress, text, img, time} = req.body

    await db.query(`INSERT INTO msg(idsend, idadress, text, img, time) VALUES (${idsend}, ${idadress}, '${text}', '${img}', '${time}');`, (e, r, f) => {
        try {
            res.status(200).json("ok")
        }catch(e) {
            res.status(400).json("Ошибка")
        }
    })

}) 


app.get("/getMsgLast", (req, res) => {
    let {id, myid} = req.query
    console.log(req.query)

    db.query(`SELECT * FROM msg WHERE (idsend = ${id} AND idadress=${myid}) OR (idsend=${myid} AND idadress=${id} ) ORDER BY ID DESC LIMIT 1 ;`, (e, r, f) => {
        try {
            res.status(200).json(r.rows[0].text)
        }catch(e) {
            res.status(400).json("Пусто...")
        }
    })
})


app.get("/msg", (req, res) => {
    let id = req.query.id;
    let myid = req.query.myid;

    db.query(`SELECT * FROM msg where (idsend = ${id} AND idadress=${myid}) OR (idsend=${myid} AND idadress=${id} );`, (e2,r2,f2) => {
        res.status(200).json(r2.rows)
    })
})






app.put("/contacts", (req, res) => {
    let id = req.body.id
    let out = []

    db.query(`SELECT DISTINCT idadress, idsend FROM msg WHERE idadress = ${id};`, (e, r, f) => {
        r.rows.forEach(async el => {
            await db.query(`SELECT id, img, about, name FROM users WHERE id = ${el.idsend};`, (e2, r2, f2) => {
                out.push(r2.rows)
            }
        )
    })
    })

    setTimeout(() => {
        res.status(200).json(out)
    }, 2000)
}) // получить всех кто писал мне

///////////////////////////////////////////////////// 




app.listen(PORT, () => {
    try {
        console.log(`go on ${PORT}`)
    } catch(e) {
        console.log(e)
    }
})