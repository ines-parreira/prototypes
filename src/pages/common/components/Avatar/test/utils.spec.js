import {userPicture, userPictureFromCache} from '../utils'

describe('Avatar utils', () => {
    const email = 'alex@gorgias.io'
    const md5 = 'b0603c6a6734698e0b93b1350c6c8286'
    const gravatarUrl = `https://www.gravatar.com/avatar/${md5}?d=404&s=50`

    beforeEach(() => {
        expect.assertions(1)
    })

    describe('fetch user picture', () => {
        it('should return empty with no params', () => {
            return userPicture()
            .then((res) => expect(res).toEqual({
                url: '',
                isCached: false
            }))
        })

        it('should return gravatar url', () => {
            return userPicture({email})
            .then((res) => expect(res).toEqual({
                url: gravatarUrl,
                isCached: true
            }))
        })

        it('should return custom sized gravatar', () => {
            return userPicture({
                size: 100,
                email
            })
            .then((res) => expect(res).toEqual({
                url: gravatarUrl.replace('s=50', 's=100'),
                isCached: true
            }))
        })
    })

    describe('get avatar from cache', () => {
        it('should return picture from cache', () => {
            return userPicture({email})
            .then(() => userPictureFromCache(email))
            .then((res) => expect(res).toEqual({
                url: gravatarUrl,
                isCached: true
            }))
        })
    })
})
