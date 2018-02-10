const express = require('express');
const menusRouter = express.Router();

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite')

menusRouter.get('/menus', (req, res)=>{
  
});

module.exports= menusRouter;
