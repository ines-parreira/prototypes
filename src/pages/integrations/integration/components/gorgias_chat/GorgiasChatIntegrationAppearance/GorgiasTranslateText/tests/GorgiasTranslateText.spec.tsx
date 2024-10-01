import React from 'react'
import {render, screen} from '@testing-library/react'
import {Provider} from 'react-redux'
import configureMockStore, {MockStoreEnhanced} from 'redux-mock-store'
import thunk from 'redux-thunk'
import {fromJS} from 'immutable'
import * as ReactRouterDom from 'react-router-dom'

import {Language} from 'constants/languages'
import {RootState, StoreDispatch} from 'state/types'
import {billingState} from 'fixtures/billing'
import {entitiesInitialState} from 'fixtures/entities'
import {account} from 'fixtures/account'
import {integrationsState} from 'fixtures/integrations'

import GorgiasTranslateText from '../GorgiasTranslateText'

const mockHistoryPush = jest.fn()
const mockHistoryReplace = jest.fn()

jest.mock(
    'react-router',
    () =>
        ({
            ...jest.requireActual('react-router'),
            useLocation: jest.fn(),
            useHistory: () => ({
                block: jest.fn(),
                push: mockHistoryPush,
                replace: mockHistoryReplace,
            }),
        } as Record<string, any>)
)

const useLocationSpy = jest.spyOn(ReactRouterDom, 'useLocation')

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
        store = mockStore({
            entities: entitiesInitialState,
            billing: fromJS(billingState),
            currentAccount: fromJS(account),
            integrations: fromJS(integrationsState),
        })
    })

    it('renders without crashing', () => {
        useLocationSpy.mockReturnValue({
            pathname: '/app/settings/channels/gorgias_chat/45/languages/it',
        } as any)

        render(
            <Provider store={store}>
                <GorgiasTranslateText integration={integration} />
            </Provider>
        )
        expect(screen.getByText('Chat')).toBeInTheDocument()
    })

    // TODO. Finish the test by mocking the API calls, etc...
    // it.skip('handles language change', async () => {
    //     useLocationSpy.mockReturnValue({
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
