import {GorgiasChatMinimumSnippetVersion} from 'models/integration/types'

import reducer, {
    initialState as chatInstallationStatusInitialState,
} from '../reducer'
import {
    chatInstallationStatusFetched,
    resetChatInstallationStatus,
} from '../actions'

describe('chatInstallationStatus reducer', () => {
    it.each([
        {
            installed: true,
            minimumSnippetVersion: GorgiasChatMinimumSnippetVersion.V1,
        },
        {
            installed: false,
            minimumSnippetVersion: null,
        },
    ])('chatInstallationStatusFetched', (state) => {
        const newState = reducer(
            chatInstallationStatusInitialState,
            chatInstallationStatusFetched(state)
        )
        expect(newState).toEqual(state)
    })

    it('resetChatInstallationStatus', () => {
        const newState = reducer(
            {
                installed: !chatInstallationStatusInitialState.installed,
                minimumSnippetVersion: null,
            },
            resetChatInstallationStatus()
        )
        expect(newState).toEqual({
            installed: true,
            minimumSnippetVersion: GorgiasChatMinimumSnippetVersion.V3,
        })
    })
})
