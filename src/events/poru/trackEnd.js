export default {
    name: "trackEnd",
    description: "Emitted when a track ends.",
    async run(player) {
        try {
            if (player.message) {
                player.message?.delete()
            }
        } catch (e) {
            console.error(e)
        }
    }
}