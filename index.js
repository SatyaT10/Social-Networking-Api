const express = require('express');
const app = express();
const http = require('http').Server(app);
const userRoute = require('./routes/userRoutes');


//conaction to Database using mongoDb
const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/Social-Networking');

app.use('/api',userRoute)



const port = '8000';
http.listen(port, () => console.log(`Server is Listening On port !${port}`));