import React from 'react'

import { render } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { account } from 'fixtures/account'
import { billingState } from 'fixtures/billing'
import { integrationsState } from 'fixtures/integrations'
import { RootState, StoreDispatch } from 'state/types'

import GorgiasChatIntegrationLanguages from '../GorgiasChatIntegrationLanguages'

jest.mock(
    '../components/GorgiasChatIntegrationLanguagesTable/useGorgiasChatIntegrationLanguagesTable',
    () => ({
        useGorgiasChatIntegrationLanguagesTable: jest.fn(() => ({
            languagesRows: [],
            languagesAvailable: [],
            addLanguage: jest.fn(),
            updateDefaultLanguage: jest.fn(),
            deleteLanguage: jest.fn(),
        })),
    }),
)

jest.mock('../../GorgiasChatIntegrationConnectedChannel', () => () => (
    <div data-testid="GorgiasChatIntegrationConnectedChannel" />
))

const defaultState: Partial<RootState> = {
    integrations: fromJS(integrationsState),
    billing: fromJS(billingState),
    currentAccount: fromJS(account),
    entities: {
        chatInstallationStatus: {
            installed: true,
        },
    } as any,
}
jest.mock('launchdarkly-react-client-sdk')

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

describe('GorgiasChatIntegrationLanguages', () => {
    it('should render', () => {
        render(
            <Provider store={mockStore(defaultState)}>
                <GorgiasChatIntegrationLanguages
                    loading={fromJS({})}
                    integration={fromJS({})}
                />
            </Provider>,
        )
    })
})
