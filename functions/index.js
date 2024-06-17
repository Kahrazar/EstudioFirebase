const functions = require("firebase-functions");
const admin = require("firebase-admin");
const express = require("express");
const cors = require("cors");
const app = express();


var serviceAccount = require("./permissions.json");
const { query } = require("firebase/database");
const { QuerySnapshot } = require("firebase-admin/firestore");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

app.use(cors({origin:true}));

const db = admin.firestore();

// ----- Rutas -----


// Get
app.get('/api/personalities', (request, response) =>{
    (async ()=>{
        try{
            const query = db.collection('personalities')
            let personalities = []

            await query.get().then(querySnapshot=>{
                const docs = querySnapshot.docs;
                for(let doc of docs){
                    personalities.push(
                        {
                           id: doc.id,
                           description: doc.data().description 
                        }
                    )
                }
            })
            
            return response.status(200).send(personalities)
        }catch(error){
            console.log(error)
            return response.status(500).send(error)
        } 
    })();
})

app.get('/hello-world', (request, response) =>{
    return response.status("200").send('Hola mundo!')
});

//Post
app.post('/api/personalities', (request, response) =>{
    (async ()=>{
        try{
       
            await db.collection('personalities').doc('/' + request.body.id + '/')
                .create(
                    {
                        description: request.body.description
                    }
                )

            return response.status(200).send()
        }catch(error){
            console.log(error)
            return response.status(500).send(error)
        } 

    })();
});


// ----------------------
// Export api to Firebase cloud function service.
exports.app = functions.https.onRequest(app)