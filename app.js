import express from "express";
import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import Task from './models/Task.js';
import cors from 'cors';

dotenv.config();
mongoose.connect(process.env.DATABASE_URL).then(() => console.log('Connected to DB'));


const app=express();
const corsOptions={
    origin: ['http://127.0.0.1:5500', 'https://my-todo.com'],
};
app.use(cors());
app.use(express.json()); //앱 전체에서 express.json 사용


function asyncHandler(handler){
    return async function(req,res){
        try{
            await handler(req,res);
        }catch(e){
            if(e.name==='ValidationError'){
                res.status(400).send({message:e.message});
            }else if (e.name==='CastError'){
                res.status(404).send({messge:'Cannot find given id'});
            }else{
                res.status(500).send({message:e.message});
            }
    }
} //오류처리까지 가능해짐
}

app.get('/tasks',async (req,res)=> {
    /**
     * *쿼리파라미터
     * -sort: 'oldest'인 경우 오래된 태스크 기준, 나머지 경우 새로운 태스크 기준
     * -count: 태스크 개수
     */
    const sort =req.query.sort;
    const count= Number(req.query.count);
    const sortOption={createdAt:sort==='oldest'?'asc':'desc'};
    

    const tasks=await Task.find().sort(sortOption).limit(count); //여러객체를 가져오는 find()

    
    res.send(tasks); //이것 때문에 js객체가 json으로 변환됨
}); //request 핸들러

app.get('/tasks/:id',async (req,res)=>{
    const id = req.params.id;
    const task =await Task.findById(id);
    if (task){
        res.send(task);
    }else{
        res.status(404).send({message:'cannot find given id'});
    }

});

app.post('/tasks',asyncHandler(async (req,res)=>{
    const newTask= await Task.create(req.body);
    res.status(201).send(newTask);
}));

app.patch('/tasks/:id',asyncHandler(async (req,res)=>{
    const id = Number(req.params.id);
    const task =mockTasks.find((task)=> task.id===id);
    if (task){
        Object.keys(req.body).forEach((key)=>{
            task[key]=req.body[key];
        });
        await task.save();
        res.send(task);
    }else{
        res.status(404).send({message:'cannot find given id'});
    }

}));

app.delete('/tasks/:id',asyncHandler(async(req,res)=>{
    const id=Number(req.params.id);
    const task= await Task.findByIdAndDelete(id);
    if(task){
        res.sendStatus(204);
        }else{
        res.status(404).send({message:'Cannot find given id.'});
    }
}));


app.listen(process.env.PORT || 3000, ()=> console.log('Server Started'));