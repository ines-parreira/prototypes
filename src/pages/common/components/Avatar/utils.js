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

export function userPictureUrl({email = '', size = 50, google = false}: userPictureParamsType = {}): Promise<string> {
    const cleanEmail = (email || '').toLowerCase().trim()
    if (!cleanEmail) {
        return Promise.resolve('')
    }

    return getGravatarUrl(cleanEmail, size)
        .catch(() => {
            if (google) {
                return getGoogleUrl(cleanEmail)
            }

            return ''
        })
}
