import {getAvatar, getAvatarFromCache} from '../utils'
import {mockImageOnload} from '../../../../../tests/utils'

describe('Avatar utils', () => {
    const email = 'alex@gorgias.io'
    const md5 = 'b0603c6a6734698e0b93b1350c6c8286'
    const gravatarUrl = `https://www.gravatar.com/avatar/${md5}?d=404&s=50`

    beforeEach(() => {
        expect.assertions(1)
    })

    mockImageOnload()
    describe('fetch avatar', () => {
        it('should return empty with no params', async () => {
            const res = await getAvatar()
            expect(res).toEqual(null)
        })

        it('should return gravatar url', async () => {
            const res = await getAvatar({email})
            expect(res).toEqual(gravatarUrl)
        })

        it('should return `null` because the email is invalid', async () => {
            const res = await getAvatar({email: 'invalidEmail@'})
            expect(res).toEqual(null)
        })

        it('should return custom sized gravatar', async () => {
            const res = await getAvatar({email, size: 100})
            expect(res).toEqual(gravatarUrl.replace('s=50', 's=100'))
        })
    })

    describe('get avatar from cache', () => {
        it('should return `undefined` because there is no avatar cached for this email`', async () => {
            expect(getAvatarFromCache('newEmail@example.com')).toBeUndefined()
        })

        it('should return `null` from cache because there is no avatar for this email`', async () => {
            const invalidEmail = '12e12e12e@'
            await getAvatar({email: invalidEmail})
            expect(getAvatarFromCache(invalidEmail)).toBeNull()
        })

        it('should return picture from cache', () => {
            return getAvatar({email})
                .then(() => getAvatarFromCache(email, 50))
                .then((res) => expect(res).toEqual(gravatarUrl))
        })

        it('should return picture url from cache with a different sizes', () => {
            return getAvatar({email, size: 50})
                .then(() => getAvatarFromCache(email, 100))
                .then((res) =>
                    expect(res).toEqual(gravatarUrl.replace('s=50', 's=100'))
                )
        })
    })
})
