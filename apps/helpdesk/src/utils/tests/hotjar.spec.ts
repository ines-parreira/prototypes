import { account } from 'fixtures/account'
import { user } from 'fixtures/users'
import type { AutomatePlan } from 'models/billing/types'
import type { Account } from 'state/currentAccount/types'
import type { InitHotjarParams } from 'utils/hotjar'
import { identifyUser } from 'utils/hotjar'

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
                    account_status: 'active',
                    automate_plan: undefined,
                    email: user.email,
                    domain: account.domain,
                    clientVersion,
                    serverVersion,
                },
            )
        })

        it('should include the automate plan if available', () => {
            jest.mock('common/store', () => {
                const { fromJS } = jest.requireActual('immutable')
                return {
                    store: {
                        dispatch: jest.fn(),
                        getState: () => ({
                            billing: fromJS([]),
                        }),
                    },
                }
            })

            identifyUser({
                ...defaultParams,
                automatePlan: {
                    name: 'automate-USD5',
                } as unknown as AutomatePlan,
            })

            expect(window.hj).toHaveBeenCalledWith(
                'identify',
                user.id.toString(),
                {
                    account_status: 'active',
                    automate_plan: 'automate-USD5',
                    email: user.email,
                    domain: account.domain,
                    clientVersion,
                    serverVersion,
                },
            )
        })

        it('should fallback to undefined if account status is not available', () => {
            identifyUser({
                ...defaultParams,
                currentAccount: {
                    ...account,
                    status: undefined,
                } as unknown as Account,
            })

            expect(window.hj).toHaveBeenCalledWith(
                'identify',
                user.id.toString(),
                {
                    account_status: undefined,
                    automate_plan: undefined,
                    email: user.email,
                    domain: account.domain,
                    clientVersion,
                    serverVersion,
                },
            )
        })
    })
})
