import { createRoot } from "react-dom/client";//直接从react-dom引入的话是引入不到的
import App from './App'

const root = createRoot(document.getElementById("root"));
root.render(<App />)
