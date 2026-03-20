import React from 'react'

import { assumeMock } from '@repo/testing'
import { render, screen } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import { MemoryRouter, useLocation } from 'react-router-dom'
import type { MockStoreEnhanced } from 'redux-mock-store'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { Language } from 'constants/languages'
import { account } from 'fixtures/account'
import { billingState } from 'fixtures/billing'
import { entitiesInitialState } from 'fixtures/entities'
import { integrationsState } from 'fixtures/integrations'
import { useAiAgentAccess } from 'hooks/aiAgent/useAiAgentAccess'
import useStoreIntegrations from 'pages/automate/common/hooks/useStoreIntegrations'
import type { RootState, StoreDispatch } from 'state/types'

import GorgiasTranslateText from '../GorgiasTranslateText'

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useLocation: jest.fn(),
    useHistory: jest.fn(),
}))

jest.mock(
    'pages/integrations/integration/components/gorgias_chat/hooks/useInstallationStatus',
    () => ({
        useInstallationStatus: () => ({
            installed: true,
            installedOnShopifyCheckout: false,
            embeddedSpqInstalled: false,
            minimumSnippetVersion: null,
        }),
    }),
)

jest.mock('pages/automate/common/hooks/useStoreIntegrations', () => ({
    __esModule: true,
    default: jest.fn(),
}))

const useLocationMock = useLocation as jest.Mock

jest.mock('hooks/aiAgent/useAiAgentAccess')
const useAiAgentAccessMock = assumeMock(useAiAgentAccess)
const mockUseStoreIntegrations = jest.mocked(useStoreIntegrations)

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

const integration = fromJS({
    id: 118,
    type: 'gorgias_chat',
    name: 'My new chat',
    meta: {
        Language: Language.EnglishUs,
        languages: [
            {
                language: Language.EnglishUs,
                primary: true,
            },
            {
                language: Language.Italian,
            },
        ],
    },
})

describe('GorgiasTranslateText', () => {
    let store: MockStoreEnhanced<Partial<RootState>, StoreDispatch>

    beforeEach(() => {
        useAiAgentAccessMock.mockReturnValue({
            hasAccess: false,
            isLoading: false,
        })

        store = mockStore({
            entities: entitiesInitialState,
            billing: fromJS(billingState),
            currentAccount: fromJS(account),
            integrations: fromJS(integrationsState),
        })
        mockUseStoreIntegrations.mockReturnValue([])
    })

    it('renders without crashing', () => {
        useLocationMock.mockReturnValue({
            pathname: '/app/settings/channels/gorgias_chat/45/languages/it',
        } as any)

        render(
            <MemoryRouter>
                <Provider store={store}>
                    <GorgiasTranslateText integration={integration} />
                </Provider>
            </MemoryRouter>,
        )
        expect(screen.getByText('Chat')).toBeInTheDocument()
    })

    // TODO. Finish the test by mocking the API calls, etc...
    // it.skip('handles language change', async () => {
    //     useLocationMock.mockReturnValue({
    //         pathname: '/app/settings/channels/gorgias_chat/45/languages/it',
    //     } as any)

    //     render(
    //         <Provider store={store}>
    //             <GorgiasTranslateText integration={integration} />
    //         </Provider>
    //     )
    //     await screen.findByText('Send us a message')
    //     fireEvent.click(screen.getByText('English - US'))
    //     fireEvent.click(screen.getByText('Italian'))
    //     await screen.findByText('Inviaci un messaggio')
    // })
})
