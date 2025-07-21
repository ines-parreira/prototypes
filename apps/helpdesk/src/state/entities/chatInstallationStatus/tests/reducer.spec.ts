import { GorgiasChatMinimumSnippetVersion } from 'models/integration/types'

import {
    chatInstallationStatusFetched,
    resetChatInstallationStatus,
} from '../actions'
import reducer, {
    initialState as chatInstallationStatusInitialState,
} from '../reducer'

describe('chatInstallationStatus reducer', () => {
    it.each([
        {
            installed: true,
            installedOnShopifyCheckout: true,
            minimumSnippetVersion: GorgiasChatMinimumSnippetVersion.V1,
        },
        {
            installed: false,
            installedOnShopifyCheckout: false,
            minimumSnippetVersion: null,
        },
    ])('chatInstallationStatusFetched', (state) => {
        const newState = reducer(
            chatInstallationStatusInitialState,
            chatInstallationStatusFetched(state),
        )
        expect(newState).toEqual(state)
    })

    it('resetChatInstallationStatus', () => {
        const newState = reducer(
            {
                installed: !chatInstallationStatusInitialState.installed,
                installedOnShopifyCheckout:
                    !chatInstallationStatusInitialState.installedOnShopifyCheckout,
                minimumSnippetVersion: null,
            },
            resetChatInstallationStatus(),
        )
        expect(newState).toEqual({
            installed: chatInstallationStatusInitialState.installed,
            installedOnShopifyCheckout:
                chatInstallationStatusInitialState.installedOnShopifyCheckout,
            minimumSnippetVersion: GorgiasChatMinimumSnippetVersion.V3,
        })
    })
})
