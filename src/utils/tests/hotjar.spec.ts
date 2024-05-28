import {InitHotjarParams, identifyUser} from 'utils/hotjar'
import {account} from 'fixtures/account'
import {user} from 'fixtures/users'

window.hj = jest.fn()

describe('hotjar', () => {
    describe('initHotjar', () => {
        const clientVersion = 'foo'
        const serverVersion = 'bar'
        const defaultParams: InitHotjarParams = {
            clientVersion,
            serverVersion,
            currentAccount: account,
            currentUser: user,
        }
        it('should call identify command on the Hotjar client', () => {
            identifyUser(defaultParams)

            expect(window.hj).toHaveBeenCalledWith(
                'identify',
                user.id.toString(),
                {
                    email: user.email,
                    domain: account.domain,
                    clientVersion,
                    serverVersion,
                }
            )
        })
    })
})
