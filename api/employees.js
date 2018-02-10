const express = require('express');
const employeesRouter = express.Router();

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

employeesRouter.param('/:employeeId', (req, res, next, employeeId)=>{
  db.get('SELECT * FROM Employee WHERE id = $id',{$id:employeeId}, (error, employee)=>{
    if(error){
      next(error);
    }else if(!employee){
      res.sendStatus(404);
    }else{
      req.employee = employee;
      next();
    }
  });
});

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

employeesRouter.get('/:employeeId', (req, res, next)=>{
  db.get('SELECT * FROM Employee WHERE id = $id',{$id:req.params.employeeId}, (error, employee)=>{
    if(error){
      next(error);
    }else if(!employee){
      res.sendStatus(404);
    }else{
      res.status(200).json({employee: employee});
    }
  });
});

const validateEmployee = (req, res, next)=>{
  console.log(req.body.employee);
  if(!req.body.employee.name ||
    !req.body.employee.position ||
    !req.body.employee.wage){
    return res.sendStatus(400);
  }else{
    next();
  }
};

employeesRouter.put('/:employeeId', validateEmployee, (req, res, next)=>{
  const name= req.body.employee.name,
        position= req.body.employee.position,
        wage= req.body.employee.wage,
        isCurrentEmployee= req.body.employee.isCurrentEmployee;
  const sql='UPDATE Employee SET name = $name, position = $position, wage = $wage, is_current_employee = $isCurrentEmployee WHERE Employee.id = $id';
  const values ={
    $name: name,
    $position: position,
    $wage : wage,
    $isCurrentEmployee : 1,
    $id : req.params.employeeId
  };
  db.run(sql, values, function(error){
    if(error){
      next(error);
    }else{
      db.get('SELECT * FROM Employee WHERE Employee.id = $id',{$id : req.params.employeeId}, (error, employee)=>{
        res.status(200).json({employee : employee});
      });
    }
  });
});

//employeesRouter.delete('/:employeeId', (req, res, next)=>{
  //req.employee.id //from employeesRouter.param
//});

module.exports = employeesRouter;
