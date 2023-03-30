import { Sequelize } from "sequelize";

const connectDb = new Sequelize({
  database: 'db_zonepang',
  username: 'zonepang',
  password: '4Ko6my901300!9qa',
  dialect: 'mysql',
  host: '159.65.131.15',
  port: '3306',
  logging: false
});

connectDb.showAllSchemas()
  .then((schemas) => {
    console.log(schemas);
  })
  .catch((err) => {
    console.error('Unable to show schemas:', err);
  });

connectDb
  .authenticate()
  .then(() => console.log('Connection has been established successfully.'))
  .catch(err => console.error('Unable to connect to the database:', err));


export { connectDb };