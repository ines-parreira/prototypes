import {StoreState} from 'state/types'

import {getChatInstallationStatus} from '../selectors'

const storeInstallationOk: Partial<StoreState> = {
    entities: {
        chatInstallationStatus: {
            installed: true,
        },
    } as any,
}

const storeInstallationNok: Partial<StoreState> = {
    entities: {
        chatInstallationStatus: {
            installed: false,
        },
    } as any,
}

describe('getChatInstallationStatus()', () => {
    it('returns installed:true', () => {
        expect(
            getChatInstallationStatus(storeInstallationOk as StoreState)
        ).toEqual({installed: true})
    })

    it('returns installed:false', () => {
        expect(
            getChatInstallationStatus(storeInstallationNok as StoreState)
        ).toEqual({installed: false})
    })
})
