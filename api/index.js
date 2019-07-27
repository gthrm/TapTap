import axios from "axios";
import { auth } from "../etc/config.json";

export default {
    getPhoto() {
        const request = axios.create({
            headers: {
                "Cache-Control": "no-cache"
            }
        });
        return request.get(`https://api.unsplash.com/photos/?client_id=${auth}`);
    }
}