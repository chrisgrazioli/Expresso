const express = require('express');
const timesheetsRouter= express.Router({mergeParams:true});

const sqlite3=require('sqlite3');
const db= new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

timesheetsRouter.param('timesheetId', (req, res, next, timesheetId)=>{
  db.get(`SELECT * FROM Timesheet WHERE employee_id = ${timesheetId}`,(error, timesheet)=>{
    if(error){
      next(error);
    }else if(!timesheet){
      return res.sendStatus(404);
    }else{
      next();
    }
  });
});

const verifyEmployee =(req, res, next)=>{
  db.get('SELECT * FROM Employee WHERE id = $id',{$id:req.params.employeeId}, (error, employee)=>{
    if(error){
      next(error);
    }else if(!employee){
      res.sendStatus(404);
    }else{
      next();
    }
  });
};

const verifyTimesheet =(req, res, next)=>{
  db.get('SELECT * FROM Timesheet WHERE id = $timesheetId', {$timesheetId: req.params.timesheetId}, (error, timesheet)=>{
    if(error){
      next(error);
    }else if(!timesheet){
      res.sendStatus(404);
    }else{
      next();
    }
  });
};

timesheetsRouter.get('/', verifyEmployee, (req, res,next)=>{
  db.all(`SELECT * FROM Timesheet WHERE employee_id = ${req.params.employeeId}`,(error, timesheets)=>{
    if(error){
      next(error);
    }else if(!timesheets){
      res.sendStatus(404);
    }else{
      res.status(200).json({timesheets: timesheets});
    }
  });
});

timesheetsRouter.post('/', verifyEmployee, (req,res,next)=>{
  const hours =req.body.timesheet.hours,
  rate = req.body.timesheet.rate,
  date = req.body.timesheet.date,
  employeeId = req.params.employeeId;

  const sql= 'INSERT INTO Timesheet (hours, rate, date, employee_id) VALUES ($hours, $rate,$date, $employeeId)';

  const values= {
    $hours : hours,
    $rate : rate,
    $date : date,
    $employeeId : employeeId
  };
  if(!hours || !rate || !date || !employeeId){
  res.sendStatus(400);
}
  db.run(sql, values, function(error){
    if(error){
      next(error);
    }else{
      db.get(`SELECT * FROM Timesheet WHERE Timesheet.id = ${this.lastID}`, (error, timesheet)=>{
        if(error){
          next(error);
        }else{
          res.status(201).json({timesheet:timesheet});
        }
      });
    }
  });
});

timesheetsRouter.put('/:timesheetId', verifyTimesheet,verifyEmployee, (req, res, next)=>{
  const hours = req.body.timesheet.hours,
        rate = req.body.timesheet.rate,
        date = req.body.timesheet.date,
        employeeId = req.params.employeeId;

  const sql =`UPDATE Timesheet SET hours =$hours, rate = $rate, date = $date, employee_id = $employeeId WHERE Timesheet.id = ${req.params.timesheetId}`;
  const values={
    $hours : hours,
    $rate : rate,
    $date : date,
    $employeeId : employeeId
  };
  console.log('req.params.employeeId is: ' + req.params.employeeId);
  console.log('req.params.timesheetId is: ' + req.params.timesheetId);

  if(!hours || !rate || !date){
    res.sendStatus(400);
  }
  db.run(sql,values, function(error){
    if(error){
      next(error);
    }else{
      db.get(`SELECT * FROM Timesheet WHERE Timesheet.id = ${req.params.timesheetId}`, (error, timesheet)=>{
        if(error){
          next(error);
        }else{
          res.status(200).json({timesheet:timesheet});
        }
      });
    }
  });
});

module.exports = timesheetsRouter;
