// @flow
import md5 from 'md5'
import jsonp from 'jsonp'
import _get from 'lodash/get'

type userPictureParamsType = {
    email: string,
    size: number,
    google: boolean
}

function getGravatarUrl(email: string = '', size: number = 50) {
    return new Promise((resolve, reject) => {
        const gravatarUrl = `https://www.gravatar.com/avatar/${md5(email)}?d=404&s=${size}`
        const img = new Image()
        img.onload = () => {
            // s=width=height=50px
            // d=404; return 404 if no gravatar
            return resolve(gravatarUrl)
        }
        img.onerror = reject
        img.src = gravatarUrl
    })
}

function getGoogleUrl(email: string) {
    return new Promise((resolve, reject) => {
        const googleUrl = `https://picasaweb.google.com/data/entry/api/user/${encodeURIComponent(email)}?alt=json-in-script`

        jsonp(googleUrl, {timeout: 2000}, function (err, data) {
            if (err) {
                return reject(err)
            }

            return resolve(_get(data, ['entry', 'gphoto$thumbnail', '$t']) || '')
        })
    })
}

const avatarCache = {}

function cleanEmail (email): string {
    return (email || '').toLowerCase().trim()
}

export function userPictureFromCache(email: string): {isCached: boolean, url?: string} {
    return avatarCache[cleanEmail(email)] || {isCached: false}
}

export function userPicture({email = '', size = 50, google = false}: userPictureParamsType = {}): Promise<{
    url: string,
    isCached: boolean,
}> {
    const mail = cleanEmail(email)
    if (!mail) {
        return Promise.resolve({
            url: '',
            isCached: false
        })
    }

    return getGravatarUrl(mail, size)
        .catch(() => {
            if (google) {
                return getGoogleUrl(mail)
            }

            return Promise.reject()
        })
        .then((url) => {
            // add to cache
            avatarCache[mail] = {
                isCached: true,
                url,
            }

            return avatarCache[mail]
        })
        .catch(() => {
            avatarCache[mail] = {isCached: true}
            return avatarCache[mail]
        })
}
