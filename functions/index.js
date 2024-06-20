const functions = require("firebase-functions");
const admin = require("firebase-admin");
const express = require("express");
const cors = require("cors");
const app = express();

var serviceAccount = require("./permissions.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});


app.use(cors({origin:true}));

const db = admin.firestore();

// ----- Rutas -----

// -------------------- Get ----------------------------
// --- Personalities ---
app.get('/v1/personalities/:id', (request, response)=>{
    (async ()=>{
        try{
            const document = db.collection('personalities').doc(request.params.id)
            const personality = await document.get(); //Extrae la informacion
            
            const fullPersonality = {
                id: document.id,
                description: personality.data().description
            }

            return response.status(200).send(fullPersonality)
        }catch(error){
            console.error(error)
            return response.status(500).send(error)
        }
    })();
})

app.get('/v1/personalities', (request, response) =>{
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
// ---------------------
// --- Breeds ---
app.get('/v1/breeds',(request, response)=>{
    (
        async ()=>{
            try{
                const query = db.collection('breeds');
                let breeds = []

                await query.get().then(querySnapshot=>{
                    const docs = querySnapshot.docs;
                    for(let doc of docs){
                        breeds.push(
                            {
                                id: doc.id,
                                description: doc.data().description
                            }
                        )
                    }
                })
                return response.status(200).send(breeds)
            }catch(error){
                console.error(error)
                return response.status(500).send(error)
            }
        }
    )();
})
app.get('/v1/breeds/:id',(request, response)=>{
    (async ()=>{
        try{
            const document = db.collection('breeds').doc(request.params.id)
            const breed = await document.get(); //Extrae la informacion
            
            const fullBreed = {
                id: document.id,
                description: breed.data().description
            }

            return response.status(200).send(fullBreed)
        }catch(error){
            console.error(error)
            return response.status(500).send(error)
        }
    })();
})
// ----------------
// ----------------------- Vaccines ---------------------
app.get('/v1/vaccines',(request, response)=>{
    (
        async ()=>{
            try{
                const query = db.collection('vaccines');
                let vaccines = []

                await query.get().then(querySnapshot=>{
                    const docs = querySnapshot.docs;
                    for(let doc of docs){
                        vaccines.push(
                            {
                                id: doc.id,
                                description: doc.data().description
                            }
                        )
                    }
                })
                return response.status(200).send(vaccines)
            }catch(error){
                console.error(error)
                return response.status(500).send(error)
            }
        }
    )();
})
app.get('/v1/vaccines/:id',(request, response)=>{
    (async ()=>{
        try{
            const document = db.collection('vaccines').doc(request.params.id)
            const vaccines = await document.get(); //Extrae la informacion
            
            const fullVaccine = {
                id: document.id,
                description: vaccines.data().description
            }

            return response.status(200).send(fullVaccine)
        }catch(error){
            console.error(error)
            return response.status(500).send(error)
        }
    })();
})
// -----------------------------------------
// --- Provinces ---
app.get('/v1/provinces',(request, response)=>{
    (
        async ()=>{
            try{
                const query = db.collection('provinces');
                let provinces = []

                await query.get().then(querySnapshot=>{
                    const docs = querySnapshot.docs;
                    for(let doc of docs){
                        provinces.push(
                            {
                                id: doc.id,
                                description: doc.data().description
                            }
                        )
                    }
                })
                return response.status(200).send(provinces)
            }catch(error){
                console.error(error)
                return response.status(500).send(error)
            }
        }
    )();
})
app.get('/v1/provinces/:id',(request, response)=>{
    (async ()=>{
        try{
            const document = db.collection('provinces').doc(request.params.id)
            const provinces = await document.get(); //Extrae la informacion
            
            const fullProvince = {
                id: document.id,
                ...provinces.data()
            }

            return response.status(200).send(fullProvince)
        }catch(error){
            console.error(error)
            return response.status(500).send(error)
        }
    })();
})
// -----------------------------------------
// ---- Dogs ---

/* 
    This method returns all the dogs liked by an specific user
*/
app.get('/v1/dogs/like/:user',(request, response)=>{
    (async ()=>{
        try{
            db.runTransaction(async (t)=>{
                // First, get the id of all the dogs liked by the user
                const query = db.collection('users-dogs')
                .where('relationType','==','L')
                .where('user','==',request.params.user);

                let ids = []
                let dogsPromises = []
                let returnDogs = []

                // Send query to database
                const snapshot = await query.get() 

                if(snapshot.empty){
                    console.log("No matching results.")
                    return response.status(200).send()
                }

                // Get all liked dogs id
                snapshot.forEach(row=>{
                    let data = row.data()
                    ids.push(data.dog)
                })
              
                // Get the reference for every dog that has been liked by the user
               ids.forEach(id=>{
                    dogsPromises.push(db.collection('dogs').doc(id).get())                
                })

                // wait for promises to fulfill and get the information for each dog found
                Promise.all(dogsPromises).then(
                    resolved=>resolved.forEach(dog=>returnDogs.push(dog.data())/*dog=>{ returnDogs.push(dog.data())}*/ )
                )
                console.log(returnDogs)
                return response.status(200).send(returnDogs)
            })
        }catch(error){
            return response.status(500).send(error)
        }
    }
    )();
})


// -------------- Post -------------------
// ---- Dogs ----
app.post('/v1/dogs/:id/like', (request, response)=>{
    (async ()=>{
        try{
            await db.collection('users-dogs').add(
                {
                    user:request.body.user,
                    dog: request.params.id,
                    relationType:"L" // L stands for Like
                }
            )
            return response.status(200).send("Dog has been liked successfully")
        }catch(error){
            return response.status(500).send(error)
        }

    })();
})


app.post('/v1/dogs', (request, response)=>{
    (async ()=>{
        try{
            db.runTransaction( async (t)=>{
                const addedDog = await db.collection('dogs').add(
                    {
                        name: request.body.name,
                        birthDay: request.body.birthDay,
                        specialMeat: request.body.specialMeat,
                        breed: request.body.breed,
                        personality: request.body.personality,
                        vaccinesApplied: request.body.vaccinesApplied                   
                    }
                )
                const addRelation = db.collection('users-dogs').add(
                    {
                        user:request.body.owner,
                        dog: addedDog.id,
                        relationType:"O" 
                    }
                )
            })
            return response.status(200).send()
        }catch(error){
            return response.status(500).send(error)
        }
    })();
})


// ---- Users ---
app.post('/v1/users', (request, response)=>{
    (async ()=>{
        try{
       
            await db.collection('users').doc('/' + request.body.id + '/')
                .create(
                    { 
                      name: request.body.name,
                      lastname: request.body.lastname,
                      mail:request.body.mail,
                      qualification:0,
                      province: request.body.province.id
                    }
                )

            return response.status(200).send()
        }catch(error){
            console.log(error)
            return response.status(500).send(error)
        } 

    })();
})

// --- Personalities ---
app.post('/v1/personalities', (request, response) =>{
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
// ---------------------
// --- Breeds ---
app.post('/v1/breeds', (request, response) =>{
    (async ()=>{
        try{
       
            await db.collection('breeds').doc('/' + request.body.id + '/')
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
// ---------------------
// --- vaccines ---
app.post('/v1/vaccines', (request, response) =>{
    (async ()=>{
        try{
       
            await db.collection('vaccines').doc('/' + request.body.id + '/')
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
// -------------------
// --- Provinces ---
app.post('/v1/provinces', (request, response) =>{
    (async ()=>{
        try{
       
            await db.collection('provinces').doc('/' + request.body.id + '/')
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
// -------------------

// ----------------------- Put --------------------------
// --- Personalities ---
app.put('/v1/personalities/:id', (request, response) =>{
    (async ()=>{
        try{
            //Extraemos el documento entero de la coleccion
            const document = db.collection('personalities').doc(request.params.id)
            
            // Ahora, actualizamos la informacion
            await document.update({
                description: request.body.description
            }); 
            
            return response.status(200).send();
        }catch(error){
            console.log(error)
            return response.status(500).send(error)
        } 

    })();
})
// --------------
// --- Breeds ---
app.put('/v1/breeds/:id',(request, response) =>{
    (async ()=>{
        try{
            //Extraemos el documento entero de la coleccion
            const document = db.collection('breeds').doc(request.params.id)
            
            // Ahora, actualizamos la informacion
            await document.update({
                description: request.body.description
            }); 
            
            return response.status(200).send();
        }catch(error){
            console.log(error)
            return response.status(500).send(error)
        } 

    })();
});
// ---------------------
// --- Vaccines ---
app.put('/v1/vaccines/:id',(request, response) =>{
    (async ()=>{
        try{
            //Extraemos el documento entero de la coleccion
            const document = db.collection('vaccines').doc(request.params.id)
            
            // Ahora, actualizamos la informacion
            await document.update({
                description: request.body.description
            }); 
            
            return response.status(200).send();
        }catch(error){
            console.log(error)
            return response.status(500).send(error)
        } 

    })();
});
// ---------------------
// --- Provinces ---
app.put('/v1/provinces/:id',(request, response) =>{
    (async ()=>{
        try{
            //Extraemos el documento entero de la coleccion
            const document = db.collection('provinces').doc(request.params.id)
            
            // Ahora, actualizamos la informacion
            await document.update({
                description: request.body.description
            }); 
            
            return response.status(200).send();
        }catch(error){
            console.log(error)
            return response.status(500).send(error)
        } 

    })();
});
// ---------------------

//------------------ Delete--------------------
// --- Personalities ---
app.delete('/v1/personalities/:id', (request, response) =>{
    (async ()=>{
        try{
            //Extraemos el documento entero de la coleccion
            const document = db.collection('personalities').doc(request.params.id)
            document.delete()
            
            return response.status(200).send();
        }catch(error){
            console.log(error)
            return response.status(500).send(error)
        } 

    })();
})
// ---------------------
// --- Breeds ---
app.delete('/v1/breeds/:id', (request, response) =>{
    (async ()=>{
        try{
            //Extraemos el documento entero de la coleccion
            const document = db.collection('breeds').doc(request.params.id)
            document.delete()
            
            return response.status(200).send();
        }catch(error){
            console.log(error)
            return response.status(500).send(error)
        } 

    })();
})
// -----------------------
// --- Vaccines ---
app.delete('/v1/vaccines/:id', (request, response) =>{
    (async ()=>{
        try{
            //Extraemos el documento entero de la coleccion
            const document = db.collection('vaccines').doc(request.params.id)
            document.delete()
            
            return response.status(200).send();
        }catch(error){
            console.log(error)
            return response.status(500).send(error)
        } 

    })();
})
// -----------------------
// --- Provinces ---
app.delete('/v1/provinces/:id', (request, response) =>{
    (async ()=>{
        try{
            //Extraemos el documento entero de la coleccion
            const document = db.collection('provinces').doc(request.params.id)
            document.delete()
            
            return response.status(200).send();
        }catch(error){
            console.log(error)
            return response.status(500).send(error)
        } 

    })();
})
// -----------------------

// ----------------------
// Export api to Firebase cloud function service.
exports.app = functions.https.onRequest(app)