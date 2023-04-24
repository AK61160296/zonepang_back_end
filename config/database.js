import { Sequelize } from "sequelize";
import mongoose from "mongoose";

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
  })
  .catch((err) => {
    console.error('Unable to show schemas:', err);
  });

mongoose.connect('mongodb+srv://akaview2542:2feet254233@cluster0.94pnfbs.mongodb.net/db_zonepage', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(async () => {
  console.log('MongoDB Connected');
  console.log('Database Name:', mongoose.connection.name);
}).catch((err) => console.error('Unable to connect to the database:', err));



connectDb
  .authenticate()
  .then(() => console.log('Connection has been established successfully.'))
  .catch(err => console.error('Unable to connect to the database:', err));

export { connectDb, mongoose };