import app from "./app";
import 'dotenv/config';
const port = process.env.PORT || 3200;


app.listen(port, () =>{
    console.log(`${port} Server running`)
})
