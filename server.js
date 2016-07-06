const express = require('express');
let app = express();
const PORT = process.env.PORT || 8080;

app.get('/', (req, res)=>{
	res.send('Todo API Root');
})

app.listen(PORT, (req, res)=>{
	console.log(`Listening on PORT ${PORT}`)
})