import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { history } from '@repo/routing'
import { QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import { Router } from 'react-router-dom'
import configureMockStore from 'redux-mock-store'

import { SHOPIFY_INTEGRATION_TYPE } from 'constants/integration'
import { entitiesInitialState } from 'fixtures/entities'
import { user } from 'fixtures/users'
import type { RootState, StoreDispatch } from 'state/types'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'

import GorgiasChatIntegrationAppearance from '../index'

const mockStore = configureMockStore<RootState, StoreDispatch>()

const defaultState = {
    agents: fromJS({
        all: [user],
    }),
    entities: entitiesInitialState,
    integrations: fromJS({
        integrations: [
            {
                id: 1,
                name: 'myStore1',
                type: SHOPIFY_INTEGRATION_TYPE,
                meta: {
                    shop_name: 'myStore1',
                },
            },
        ],
    }),
} as unknown as RootState

jest.mock('@repo/feature-flags')
const mockUseFlag = useFlag as jest.MockedFunction<typeof useFlag>

jest.mock('lodash/uniqueId', () => (id?: string) => `${id || ''}42`)

jest.mock('pages/common/forms/FileField', () => {
    type MockedProps = {
        required: boolean
    }

    const FileFieldMocked = ({ required }: MockedProps) => {
        return (
            <div>
                FileField component is required ? {required ? 'true' : 'false'}
            </div>
        )
    }

    return {
        __esModule: true,
        default: FileFieldMocked,
    }
})

jest.mock('../../GorgiasChatIntegrationConnectedChannel', () => () => {
    return <div data-testid="GorgiasChatIntegrationConnectedChannel" />
})

jest.mock(
    'pages/integrations/integration/components/gorgias_chat/GorgiasChatIntegrationHeader',
    () => () => {
        return <div data-testid="GorgiasChatIntegrationHeader" />
    },
)

const mockClient = mockQueryClient()

const minProps = {
    integration: fromJS({}),
    isUpdate: false,
    actions: {
        updateOrCreateIntegration: jest.fn(() => Promise.resolve()),
        deleteIntegration: jest.fn(() => Promise.resolve()),
        createGorgiasChatIntegration: jest.fn(() => Promise.resolve()),
    } as any,
    loading: fromJS({ updateIntegration: false }),
    currentUser: fromJS({ name: 'John Doe' }),
}

describe('<GorgiasChatIntegrationAppearance />', () => {
    const realCSS = global.CSS

    beforeEach(() => {
        jest.resetAllMocks()

        const fixedDate = new Date('2019-06-24')
        jest.spyOn(Date, 'now').mockImplementation(() => fixedDate.getTime())

        global.CSS = {
            ...global.CSS,
            supports: (): boolean => true,
            escape: realCSS?.escape,
        }
    })

    afterEach(() => {
        global.CSS = realCSS
    })

    it('should render the legacy component when ChatSettingsRevamp flag is disabled', () => {
        mockUseFlag.mockImplementation((key, defaultValue) => {
            if (key === FeatureFlagKey.ChatSettingsRevamp) {
                return false
            }
            return defaultValue
        })

        render(
            <Router history={history}>
                <QueryClientProvider client={mockClient}>
                    <Provider store={mockStore(defaultState)}>
                        <GorgiasChatIntegrationAppearance {...minProps} />
                    </Provider>
                </QueryClientProvider>
            </Router>,
        )

        expect(screen.queryByText(/REVAMP VERSION/)).not.toBeInTheDocument()
        expect(screen.getByText('Chat title')).toBeInTheDocument()
    })

    it('should render the revamp component when ChatSettingsRevamp flag is enabled', () => {
        mockUseFlag.mockImplementation((key, defaultValue) => {
            if (key === FeatureFlagKey.ChatSettingsRevamp) {
                return true
            }
            return defaultValue
        })

        render(
            <Router history={history}>
                <QueryClientProvider client={mockClient}>
                    <Provider store={mockStore(defaultState)}>
                        <GorgiasChatIntegrationAppearance {...minProps} />
                    </Provider>
                </QueryClientProvider>
            </Router>,
        )

        expect(
            screen.getByRole('heading', { name: 'Settings' }),
        ).toBeInTheDocument()
    })
})
