import { describe, expect, it, vi } from 'vitest'

import type { InitHotjarParams } from '../hotjar'
import { identifyUser } from '../hotjar'

const hotjarMock = vi.fn()
const windowWithHotjar = window as Window & {
    hj?: typeof hotjarMock
}

describe('hotjar', () => {
    const clientVersion = 'foo'
    const serverVersion = 'bar'
    const defaultParams: InitHotjarParams = {
        clientVersion,
        serverVersion,
        currentAccount: {
            domain: 'acme.gorgias.com',
            status: {
                status: 'active',
            },
        },
        currentUser: {
            email: 'test@gorgias.com',
            id: 42,
        },
    }

    beforeEach(() => {
        windowWithHotjar.hj = hotjarMock
    })

    afterEach(() => {
        vi.clearAllMocks()
    })

    describe('identifyUser', () => {
        it('should call identify command on the Hotjar client', () => {
            identifyUser(defaultParams)

            expect(hotjarMock).toHaveBeenCalledWith('identify', '42', {
                account_status: 'active',
                automate_plan: undefined,
                email: 'test@gorgias.com',
                domain: 'acme.gorgias.com',
                clientVersion,
                serverVersion,
            })
        })

        it('should include the automate plan if available', () => {
            identifyUser({
                ...defaultParams,
                automatePlan: {
                    name: 'automate-USD5',
                },
            })

            expect(hotjarMock).toHaveBeenCalledWith('identify', '42', {
                account_status: 'active',
                automate_plan: 'automate-USD5',
                email: 'test@gorgias.com',
                domain: 'acme.gorgias.com',
                clientVersion,
                serverVersion,
            })
        })

        it('should fallback to undefined if account status is not available', () => {
            identifyUser({
                ...defaultParams,
                currentAccount: {
                    ...defaultParams.currentAccount,
                    status: undefined,
                },
            })

            expect(hotjarMock).toHaveBeenCalledWith('identify', '42', {
                account_status: undefined,
                automate_plan: undefined,
                email: 'test@gorgias.com',
                domain: 'acme.gorgias.com',
                clientVersion,
                serverVersion,
            })
        })
    })
})
