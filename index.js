const express = require('express');
const bodyParser = require('body-parser');
const uuidv4 = require( 'uuid/v4' );
const dbsync = require( './dbsync.js' );

const app = express();
const port = 3000;

let database = dbsync.load();

app.use( bodyParser.json() );

app.get( '/api/:type' , (_req , _res) => {
  const type = _req.params.type.toLowerCase();
  if ( type in database ) {
    console.log( `[OK][GET] ${type} list` );
    _res.json( {
      ret: 'OK',
      data: database[type]
    } );
  } else {
    console.log( `[ERROR][GET] list` );
    _res.json( {
      ret: 'ERROR',
      error: 'Entry not found'
    } );
  }
} );

app.get( '/api/:type/:id' , (_req , _res) => {
  const id = _req.params.id.toLowerCase();
  const type = _req.params.type.toLowerCase();
  if ( (type in database) && (id in database[type]) ) {
    console.log( `[OK][GET] ${type}/${id}` );
    _res.json( {
      ret: 'OK',
      data: database[type][id]
    } );
  } else {
    console.log( `[ERROR][GET] item` );
    _res.json( {
      ret: 'ERROR',
      error: 'Entry not found'
    } );
  }
} );

app.post( '/api/:type' , (_req , _res ) => {
  // check id format:
  const check = /^[0-9a-z_-]*$/i;
  const type = _req.params.type.toLowerCase();
  if ( check.test(type) ) {
    if ( !(type in database) ) {
      database[type] = {};
    }
    const id = uuidv4();
    database[type][id] = _req.body;
    console.log( `[OK][POST] ${type}` );
    _res.json( {
      ret: 'OK',
      data: `${type}/${id}`
    } );
    dbsync.save( database );
  } else {
    console.log( `[ERROR][POST] item` );
    _res.json( {
      ret: 'ERROR',
      error: 'Invalid type format'
    } );
  }
} );

app.delete( '/api/:type/:id' , (_req , _res) => {
  const id = _req.params.id.toLowerCase();
  const type = _req.params.type.toLowerCase();
  if ( (type in database) && (id in database[type]) ) {
    delete database[type][id];
    console.log( `[OK][DELETE] ${type}/${id}` );
    _res.json( {
      ret: 'OK',
      data: `${type}/${id}`
    } );
    dbsync.save( database );
  } else {
    console.log( `[ERROR][DELETE] item` );
    _res.json( {
      ret: 'ERROR',
      error: 'Entry not found'
    } );
  }
} );

app.put( '/api/:type/:id' , (_req , _res) => {
  const id = _req.params.id.toLowerCase();
  const type = _req.params.type.toLowerCase();
  if ( (type in database) && (id in database[type]) ) {
    database[type][id] = _req.body;
    console.log( `[OK][PUT] ${type}/${id}` );
    _res.json( {
      ret: 'OK',
      data: `${type}/${id}`
    } );
    dbsync.save( database );
  } else {
    console.log( `[ERROR][PUT] item` );
    _res.json( {
      ret: 'ERROR',
      error: 'Entry not found'
    } );
  }
} );

app.use( express.static( 'public' ) );

app.listen( port , () => console.log(`Simple server listening on port ${port}!`))
