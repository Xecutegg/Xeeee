import clientConfig from "../database/models/clientConfig.js";
export async function isUserBlock(id) {
    try {
        const config = await clientConfig.findOne({
            'blocklistusers.id': id
        }).exec();

        if (config) {
            const isBlocked = config.blocklistusers.some(user => user.id === id);
            return isBlocked;
        }

        return false;
    } catch (error) {
        console.error("Error checking if user is blocked:", error);
        return false;
    }
}
