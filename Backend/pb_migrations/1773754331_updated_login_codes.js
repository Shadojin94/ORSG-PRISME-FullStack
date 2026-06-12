/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("login_codes")

  // update: `used` ne doit pas etre requis (PB traite false comme valeur vide)
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "ma5brgc4",
    "name": "used",
    "type": "bool",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {}
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("login_codes")

  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "ma5brgc4",
    "name": "used",
    "type": "bool",
    "required": true,
    "presentable": false,
    "unique": false,
    "options": {}
  }))

  return dao.saveCollection(collection)
})
