
import { radeon as client } from "../index.js";

export default async (role) => {
    let r = role.replace(/[<@>]/g, '');
    let user;
    if (!isNaN(Number(r))) {
        user = await client.users.fetch(r);
    } else if (typeof r === 'string') {
        user = client.users.cache.find(u => u.id === r || u.username === r || u.tag === r);
    } else {
        user = null;
    }
    
    return user;
};
