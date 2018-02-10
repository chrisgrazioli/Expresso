const express = require('express');
const employeesRouter = express.Router();

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

employeesRouter.get('/', (req, res)=>{
  db.all('SELECT * FROM Employee WHERE is_current_employee = 1', (error, employees)=>{
    if(error){
      next(error);
    }else{
      res.status(200).json({employees:employees});
    }
  });
});

employeesRouter.post('/', (req, res)=>{
  const name = req.body.employee.name,
        position = req.body.employee.position,
        wage =req.body.employee.wage,
        isCurrentEmployee = req.body.employee.isCurrentEmployee === 0 ? 0 : 1;
  if(!name || !position || !wage){
    res.sendStatus(400);
  }else{
    const sql = 'INSERT INTO Employee (name, position, wage, is_current_employee) VALUES ($name, $position, $wage, $isCurrentEmployee)';
    const values ={
      $name: name,
      $position: position,
      $wage: wage,
      $isCurrentEmployee: isCurrentEmployee
    };
    db.run(sql, values, function(error){
      if(error){
        next(error);
      }else{
        db.get(`SELECT * FROM Employee WHERE id = ${this.lastID}`, (error, employee)=>{
            res.status(201).json({employee: employee});
        });
      }
    });
  }
});

employeesRouter.get('/:employeeId', (req, res)=>{
  db.get('SELECT * FROM Employee WHERE id = $id',{$id:req.params.employeeId}, (error, employee)=>{
    if(error){
      res.sendStatus(404);
    }else{
      res.status(200).json({employee: employee});
    }
  });
});

module.exports = employeesRouter;
