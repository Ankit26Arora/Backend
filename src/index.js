import dotenv from 'dotenv';
dotenv.config({ path: './.env' });

import ConnectDB from './db/index.js';
import app from './app.js';

console.log('kr lea ha get bai party ho gyai ajj to', process.env.MONGODB_URI); 

ConnectDB()
.then(()=>{
    app.listen(process.env.PORT , ()=>{
       console.log(`port no  ${process.env.PORT} pr chal rha hai`);
    })
})
.catch((error)=>{
    console.log("Error a rha bai bai ek bar check kr");

})

// configDotenv.config({

// })


// (async ()=>{
//     try {
        
//     } catch (error) {
//         console.log("Error",error)
//         throw error
        
//     }
// })