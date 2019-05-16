// @flow
import md5 from 'md5'

type avatarParamsType = {
    email: string,
    size: number
}

function getGravatarUrl(email: string = '') {
    return new Promise((resolve, reject) => {
        const gravatarUrl = `https://www.gravatar.com/avatar/${md5(email)}?d=404`
        const img = new Image()
        img.onload = () => {
            // d=404; return 404 if no gravatar
            return resolve(gravatarUrl)
        }
        img.onerror = reject
        img.src = gravatarUrl
    })
}

const avatarCache = {}

function cleanEmail (email): string {
    return (email || '').toLowerCase().trim()
}

export function getAvatarFromCache(email: string, size: number): ?string {
    const url = avatarCache[cleanEmail(email)]
    return url ? `${url}&s=${size}` : url
}

export function getAvatar({email = '', size = 50}: avatarParamsType = {}): Promise<?string> {
    const mail = cleanEmail(email)
    if (!mail) {
        return Promise.resolve(null)
    }

    return getGravatarUrl(mail)
        .then((url) => {
            avatarCache[mail] = url
            return `${url}&s=${size}`
        })
        .catch(() => {
            avatarCache[mail] = null
            return null
        })
}
