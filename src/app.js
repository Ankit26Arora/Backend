import express from "express"
import cors from 'cors'
import cookieParser from "cookie-parser"

const app = express()

app.use(cors({
    origin:process.env.Cors_origin
}))

app.use(express.json({limit:'10kb'}))

app.use(express.urlencoded({extended:true}))

app.use(express.static("Public"))
app.use(cookieParser)
export default app