import App from "./app";
import { PORT } from "./configs";

const app = new App();
app.listen(Number(PORT) || 3000);
