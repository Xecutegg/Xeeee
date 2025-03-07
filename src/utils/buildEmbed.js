import fetch from 'node-fetch';
export async function buildEmbed(options) {
    const isValidUrl = async (url) => {
        try {
            const response = await fetch(url, { method: 'HEAD' }).catch(() => null);
            return response?.ok || false;
        } catch (error) {
            return false;
        }
    };

    const exampleEmbed = {
        title: options.title || null,
        description: options.description || null,
        color: options.color || null,
        author: {
            name: options.author?.name || null
        },
        footer: {
            text: options.footer?.text || null
        },
    };

    // Check URLs in parallel
    const [isAuthorIconUrlValid, isFooterIconUrlValid, isThumbnailUrlValid, isImageUrlValid] = await Promise.all([
        isValidUrl(options.author?.iconURL),
        isValidUrl(options.footer?.iconURL),
        isValidUrl(options.thumbnail),
        isValidUrl(options.image)
    ]);

    // Assign valid URLs to the embed
    if (isAuthorIconUrlValid) {
        exampleEmbed.author.iconURL = options.author.iconURL;
    }
    if (isFooterIconUrlValid) {
        exampleEmbed.footer.iconURL = options.footer.iconURL;
    }
    if (isThumbnailUrlValid) {
        exampleEmbed.thumbnail = { url: options.thumbnail };
    }
    if (isImageUrlValid) {
        exampleEmbed.image = { url: options.image };
    }
    return exampleEmbed;
}
