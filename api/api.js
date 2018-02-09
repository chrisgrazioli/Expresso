const express = require('express');
const apiRouter= express.Router();
const menusRouter= require('./menus');
const employeesRouter= require('./employees');

apiRouter.use('/menus', menusRouter);
apiRouter.use('/employees', employeesRouter);

module.exports =apiRouter;
