const express = require('express');
const PORT = process.env.PORT || 8080;
const favicon = require('serve-favicon');

let app = express();
app.use(favicon(__dirname + '/public/favicon.ico'))

app.get('/', (req, res)=>{
	res.send('Todo API Root Bacon');
})

app.listen(PORT, (req, res)=>{
	console.log(`Listening on PORT ${PORT}`)
})