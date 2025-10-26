import app from "./src/app.js";

import connectToSocket from "./src/controllers/socketManager.js";
import { createServer } from "node:http";


const server = createServer(app);
const io = connectToSocket(server);

app.set('port', process.env.PORT || 5000)


server.listen(app.get("port"), () => {
  console.log(` Server is running on port ${app.get("port")}`);
});