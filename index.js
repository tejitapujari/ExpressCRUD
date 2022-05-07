var mongoclient=require("mongodb").MongoClient
var express=require('express')
var http=require('http')
var fs=require('fs')
var jwt=require("jsonwebtoken")
var app=express()
app.use(express.json())
mongoclient.connect('mongodb://localhost:27017' ,(err,client)=>
{
    if(err){
        console.log("Error in connection"+err)}
    else{
            console.log("connection established");
            db=client.db('empdb')
        }  
})

app.get('/emps',verifyToken,(req,res)=>{
    db.collection('emp').find().toArray((err,items)=>
    {
        res.write(JSON.stringify(items))
        res.end()      
    })
})
app.post('/addemp',verifyToken,(req,res)=>
{
    db.collection('emp').insertOne(req.body)
    res.end("inserted")
})


app.put('/updateemp/:id',verifyToken,(req,res)=>{
var id=req.params.id
db.collection('emp').updateOne({"_id":id},{$set:{"firstname":req.body.firstname}})

res.end("updated")
})

app.delete('/deleteemp/:id',verifyToken,(req,res)=>{
    var id=req.params.id
    db.collection('emp').deleteOne({"_id":id})
    res.end()
})


//

app.post('/login',(req,res)=>{
    uname=req.body.username
    pwd=req.body.password
    db.collection("users").findOne({"username":uname,"password":pwd})
    .then((item)=>{
         if(item){
            const token=jwt.sign({"username":uname},"cvrcollege");
            res.json({success:true,message:"authentication successful",token:token});
            res.end();
         }
         else{
            const token=jwt.sign({"username":uname},"cvrcollege");
            res.json({success:false,message:"unsuccessful"});
            res.end();
         }

    })
    .catch((err)=>{
    console.log("error",err)
    })
})

function verifyToken(req,res,next){
    let token=req.headers['authorization']
    if(token){
        token=token.split(' ')[1]
        console.log(token)
        jwt.verify(token,"cvrcollege",(err,decoded)=>{
            if(err){
                return res.json({success:false,message:'Token not valid'});
            }
            else{
                next();
            }
        })
    }
    else{
        return res.json({success:false,message:"A token is required for Authorization"});
    }
}

app.listen(3000,()=>{console.log("server started...")})