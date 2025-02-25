import md5 from 'md5'

export type AvatarParamsType = {
    email?: string
    size?: number
}

export function getInitials(
    name: Maybe<string>,
    useFirstInitialOnly?: boolean,
): string {
    if (!name) {
        return ''
    }

    const splitName = name.split(' ').filter((text) => text.length > 0)

    if (splitName.length === 1 || (useFirstInitialOnly && splitName.length)) {
        return splitName[0][0]
    } else if (splitName.length > 1) {
        return `${splitName[0][0]}${splitName[1][0]}`
    }

    return ''
}

function getGravatarUrl(email = ''): Promise<string> {
    return new Promise((resolve, reject) => {
        const gravatarUrl = `https://www.gravatar.com/avatar/${md5(
            email,
        )}?d=404`
        const img = new Image()
        img.onload = () => {
            // d=404; return 404 if no gravatar
            return resolve(gravatarUrl)
        }
        img.onerror = reject
        img.src = gravatarUrl
    })
}

const avatarCache: { [key: string]: Maybe<string> } = {}

function cleanEmail(email: Maybe<string>): string {
    return (email || '').toLowerCase().trim()
}

export function getAvatarFromCache(email: string, size: number): Maybe<string> {
    const url = avatarCache[cleanEmail(email)]
    return url ? `${url}&s=${size}` : url
}

export function getAvatar({
    email = '',
    size = 50,
}: AvatarParamsType = {}): Promise<Maybe<string>> {
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
