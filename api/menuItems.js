const express = require('express');
const menuItemsRouter = express.Router({mergeParams:true});
//need to figure out importing verifyMenu
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

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

const verifyMenuItem =(req, res, next)=>{
  db.get(`SELECT * FROM MenuItem WHERE id = ${req.params.menuItemId}`, (error, menuItem)=>{
    if(error){
      next(error);
    }else if(!menuItem){
      res.sendStatus(404);
    }else{
      req.menuItem = menuItem;
      next();
    }
  });
};


menuItemsRouter.get('/',verifyMenu, (req, res, next)=>{
  db.all(`SELECT * FROM MenuItem WHERE menu_id = ${req.params.menuId}`, (error, menuItems)=>{
    if(error){
      next(error);
    }else{
      return res.status(200).json({menuItems:menuItems});
    }
  });
});

// api/menus/:menuId/menuItems
menuItemsRouter.post('/', verifyMenu, (req, res, next)=>{
  const name = req.body.menuItem.name,
        description = req.body.menuItem.description,
        inventory = req.body.menuItem.inventory,
        price = req.body.menuItem.price,
        menuId= req.params.menuId;
  if(!name || !description || !inventory ||!price){
    res.sendStatus(400);
  }else{
    const sql='INSERT INTO MenuItem (name, description, inventory, price) VALUES ($name, $description, $inventory, $price)';

    const values ={
      $name: name,
      $description: description,
      $inventory: inventory,
      $price:price
    };
    db.run(sql, values, function(error){
      if(error){
        next(error);
      }else{
        db.get(`SELECT * FROM MenuItem WHERE id = ${this.lastID}`, (error, menuItem)=>{
          if(error){
            next(error);
          }else{
            res.status(201).json({menuItem : menuItem});
          }
        });
      }
    });
  }
});
// n
menuItemsRouter.put('/:menuItemId', verifyMenu, verifyMenuItem, (req, res, next)=>{
  const name = req.body.menuItem.name,
        description = req.body.menuItem.description,
        inventory = req.body.menuItem.inventory,
        price = req.body.menuItem.price,
        menuId= req.params.menuId; // perhaps try menuItem.menuId
  if(!name || !description || !inventory ||!price){
    res.sendStatus(400);
  }else{
    const sql='UPDATE MenuItem SET name = $name, description = $description, inventory = $inventory, price = $price, menu_id = $menuId WHERE id = $menuItemId';

    const values ={
      $name: name,
      $description: description,
      $inventory: inventory,
      $price: price,
      $menuId: menuId,
      $menuItemId: req.params.menuItemId
    };
    db.run(sql, values, function(error){
      if(error){
        next(error);
      }else{
        db.get(`SELECT * FROM MenuItem WHERE id = ${req.params.menuItemId}`, (error, menuItem)=>{
          if(error){
            next(error);
          }else{
            res.status(200).json({menuItem : menuItem});
          }
        });
      }
    });
  }
});

menuItemsRouter.delete('/:menuItemId',verifyMenu, verifyMenuItem, (req, res, next)=>{
  db.run(`DELETE FROM MenuItem WHERE id = ${req.params.menuItemId}`, function(error){
    if(error){
      next(error);
    }else{
      res.sendStatus(204);
    }
  });
});

module.exports= menuItemsRouter;
