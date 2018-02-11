const express = require('express');
const menusRouter = express.Router({mergeParams:true});
const menuItemsRouter = require('./menuItems');

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite')

menusRouter.use('/:menuId/menu-items', menuItemsRouter);

menusRouter.get('/', (req, res, next)=>{
  db.all('SELECT * FROM Menu', (error, menus)=>{
    if(error){
      next(error);
    }else{
      res.status(200).json({menus:menus});
    }
  });
});

menusRouter.post('/', (req, res, next)=>{
  const title = req.body.menu.title;
  if(!title){
    res.sendStatus(400);
  }else{
    db.run('INSERT INTO Menu (title) VALUES ($title)', {$title: title}, function(error){
      if(error){
        next(error);
      }else{
        db.get(`SELECT * FROM Menu WHERE id = ${this.lastID}`, (error, menu)=>{
          if(error){
            next(error);
          }else{
            res.status(201).json({menu:menu});
          }
        });
      }
    });
  }
});

const verifyMenu =(req, res, next)=>{
  db.get(`SELECT * FROM Menu WHERE id = ${req.params.menuId}`, (error, menu)=>{
    if(error){
      next(error);
    }else if(!menu){
      res.sendStatus(404);
    }else{
      req.menu=menu;
      next();
    }
  });
};

menusRouter.get('/:menuId', verifyMenu, (req, res, next)=>{
  res.status(200).json({menu:req.menu});
});

menusRouter.put('/:menuId', verifyMenu, (req, res, next)=>{
  const title = req.body.menu.title;
  if(!title){
    res.sendStatus(400);
  }
  db.run(`UPDATE Menu SET title = $title WHERE Menu.id = ${req.params.menuId}`, {$title: title}, function(error){
    if(error){
      next(error);
    }else{
      db.get(`SELECT * FROM Menu WHERE Menu.id = ${req.params.menuId}`, (error, menu)=>{
        if(error){
          next(error);
        }else{
          res.status(200).json({menu:menu});
        }
      });
    }
  });
});

menusRouter.delete('/:menuId',(req, res, next)=>{
  db.get(`SELECT * FROM MenuItem WHERE MenuItem.menu_id = ${req.params.menuId}`,(error,menuItem)=>{
    if(error){
      next(error);
    }else if(menuItem){
      res.sendStatus(400);
    }else{
      db.run(`DELETE FROM Menu WHERE id = ${req.params.menuId}`, function(error){
        if(error){
          next(error);
        }else{
          res.sendStatus(204);
        }
      });
    }
  });
});

module.exports= menusRouter;
