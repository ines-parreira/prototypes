import React from 'react'
import {render, screen} from '@testing-library/react'
import {fromJS} from 'immutable'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {useFlags} from 'launchdarkly-react-client-sdk'
import {RootState, StoreDispatch} from 'state/types'
import {integrationsState} from 'fixtures/integrations'
import {billingState} from 'fixtures/billing'
import {account} from 'fixtures/account'
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
    })
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
const mockUseFlags = useFlags as jest.MockedFunction<typeof useFlags>

describe('GorgiasChatIntegrationLanguages', () => {
    it('should render', () => {
        render(
            <Provider store={mockStore(defaultState)}>
                <GorgiasChatIntegrationLanguages
                    loading={fromJS({})}
                    integration={fromJS({})}
                />
            </Provider>
        )
    })

    it('should render `GorgiasChatIntegrationConnectedChannel` if both `changeAutomateSettingButtomPosition` and `newChannelsView` are false', () => {
        const {rerender} = render(
            <Provider store={mockStore(defaultState)}>
                <GorgiasChatIntegrationLanguages
                    loading={fromJS({})}
                    integration={fromJS({})}
                />
            </Provider>
        )

        expect(
            screen.queryByTestId('GorgiasChatIntegrationConnectedChannel')
        ).toBeInTheDocument()

        mockUseFlags.mockReturnValue({
            'change-automate-setting-buttom-position': true,
            'new-channels-view': true,
        })

        rerender(
            <Provider store={mockStore(defaultState)}>
                <GorgiasChatIntegrationLanguages
                    loading={fromJS({})}
                    integration={fromJS({})}
                />
            </Provider>
        )

        expect(
            screen.queryByTestId('GorgiasChatIntegrationConnectedChannel')
        ).not.toBeInTheDocument()
    })
})
