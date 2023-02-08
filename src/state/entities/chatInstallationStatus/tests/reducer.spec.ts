import reducer, {
    initialState as chatInstallationStatusInitialState,
} from '../reducer'
import {
    chatInstallationStatusFetched,
    resetChatInstallationStatus,
} from '../actions'

describe('chatInstallationStatus reducer', () => {
    it.each([true, false])(
        'chatInstallationStatusFetched (to installed:%s)',
        (state) => {
            const newState = reducer(
                chatInstallationStatusInitialState,
                chatInstallationStatusFetched({installed: state})
            )
            expect(newState).toEqual({installed: state})
        }
    )

    it('resetChatInstallationStatus', () => {
        const newState = reducer(
            {installed: !chatInstallationStatusInitialState.installed},
            resetChatInstallationStatus()
        )
        expect(newState).toEqual({installed: true})
    })
})
