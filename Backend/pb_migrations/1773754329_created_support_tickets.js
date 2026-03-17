/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const collection = new Collection({
    "id": "49g9tnbeg74nv32",
    "created": "2026-03-17 13:32:09.759Z",
    "updated": "2026-03-17 13:32:09.759Z",
    "name": "support_tickets",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "yyj3dafn",
        "name": "subject",
        "type": "text",
        "required": true,
        "presentable": false,
        "unique": false,
        "options": {
          "min": 3,
          "max": 200,
          "pattern": ""
        }
      },
      {
        "system": false,
        "id": "t04vnf35",
        "name": "description",
        "type": "text",
        "required": true,
        "presentable": false,
        "unique": false,
        "options": {
          "min": 10,
          "max": null,
          "pattern": ""
        }
      },
      {
        "system": false,
        "id": "bqq7stes",
        "name": "priority",
        "type": "select",
        "required": true,
        "presentable": false,
        "unique": false,
        "options": {
          "maxSelect": 1,
          "values": [
            "low",
            "medium",
            "high",
            "critical"
          ]
        }
      },
      {
        "system": false,
        "id": "n4fo4hkb",
        "name": "category",
        "type": "select",
        "required": true,
        "presentable": false,
        "unique": false,
        "options": {
          "maxSelect": 1,
          "values": [
            "account",
            "generation",
            "bug",
            "question",
            "other"
          ]
        }
      },
      {
        "system": false,
        "id": "olcaufae",
        "name": "status",
        "type": "select",
        "required": true,
        "presentable": false,
        "unique": false,
        "options": {
          "maxSelect": 1,
          "values": [
            "open",
            "in_progress",
            "resolved",
            "closed"
          ]
        }
      },
      {
        "system": false,
        "id": "94jktq5m",
        "name": "user",
        "type": "relation",
        "required": true,
        "presentable": false,
        "unique": false,
        "options": {
          "collectionId": "_pb_users_auth_",
          "cascadeDelete": false,
          "minSelect": null,
          "maxSelect": 1,
          "displayFields": null
        }
      },
      {
        "system": false,
        "id": "s1lij9sd",
        "name": "admin_notes",
        "type": "text",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "min": null,
          "max": null,
          "pattern": ""
        }
      }
    ],
    "indexes": [],
    "listRule": "@request.auth.id != \"\" && user = @request.auth.id",
    "viewRule": "@request.auth.id != \"\" && user = @request.auth.id",
    "createRule": "@request.auth.id != \"\"",
    "updateRule": null,
    "deleteRule": null,
    "options": {}
  });

  return Dao(db).saveCollection(collection);
}, (db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("49g9tnbeg74nv32");

  return dao.deleteCollection(collection);
})
