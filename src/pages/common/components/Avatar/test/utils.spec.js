import {userPictureUrl} from '../utils'

describe('Avatar utils', () => {
    describe('fetch user picture', () => {
        const email = 'alex@gorgias.io'
        const md5 = 'b0603c6a6734698e0b93b1350c6c8286'
        const gravatarUrl = `https://www.gravatar.com/avatar/${md5}?d=blank&s=50`

        beforeEach(() => {
            expect.assertions(1)
        })

        it('should return empty with no params', () => {
            userPictureUrl()
            .then((res) => expect(res).toBe(''))
        })

        it('should return gravatar url', () => {
            userPictureUrl(email)
            .then((res) => expect(res).toBe(gravatarUrl))
        })

        it('should return custom sized gravatar', () => {
            userPictureUrl(email, 100)
            .then((res) => expect(res).toBe(gravatarUrl.replace('s=50', 's=100')))
        })
    })
})
