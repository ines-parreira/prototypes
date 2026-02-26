import { useFlag } from '@repo/feature-flags'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { account } from 'fixtures/account'
import { billingState } from 'fixtures/billing'
import { integrationsState } from 'fixtures/integrations'
import { useAiAgentAccess } from 'hooks/aiAgent/useAiAgentAccess'
import type { RootState, StoreDispatch } from 'state/types'
import { renderWithRouter } from 'utils/testing'

import GorgiasChatIntegrationLanguages from '../GorgiasChatIntegrationLanguages'

jest.mock('@repo/feature-flags')
jest.mock('hooks/aiAgent/useAiAgentAccess')

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

jest.mock('hooks/aiAgent/useAiAgentAccess', () => ({
    useAiAgentAccess: jest.fn(),
}))

const mockUseAiAgentAccess = jest.mocked(useAiAgentAccess)
const mockUseFlag = useFlag as jest.Mock

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

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

describe('GorgiasChatIntegrationLanguages', () => {
    beforeEach(() => {
        mockUseAiAgentAccess.mockReturnValue({
            hasAccess: false,
            isLoading: false,
        })
        mockUseFlag.mockReturnValue(false)
    })

    it('should render', () => {
        renderWithRouter(
            <Provider store={mockStore(defaultState)}>
                <GorgiasChatIntegrationLanguages
                    loading={fromJS({})}
                    integration={fromJS({})}
                />
            </Provider>,
        )
    })
})
