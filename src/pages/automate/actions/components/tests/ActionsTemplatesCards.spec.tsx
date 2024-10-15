import React from 'react'
import {screen} from '@testing-library/react'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {Provider} from 'react-redux'
import {QueryClientProvider} from '@tanstack/react-query'
import {useFlags} from 'launchdarkly-react-client-sdk'
import {mockQueryClient} from 'tests/reactQueryTestingUtils'
import {renderWithRouter} from 'utils/testing'
import ActionsTemplatesCards from '../ActionsTemplatesCards'

const mockStore = configureMockStore([thunk])
const mockUseFlags = jest.mocked(useFlags)

const queryClient = mockQueryClient()

describe('<ActionsTemplatesCards />', () => {
    beforeEach(() => {
        jest.resetAllMocks()
        mockUseFlags.mockReturnValue({})
    })

    it('should render custom Action form ', () => {
        const templateConfigurations = {
            account_id: 1,
            name: 'test template',
            internal_id: '1',
            id: '1',
            initial_step_id: '',
            is_draft: false,
            entrypoints: [
                {
                    kind: 'llm-conversation' as const,
                    trigger: 'llm-prompt' as const,
                    settings: {
                        instructions: 'test',
                        requires_confirmation: false,
                    },
                    deactivated_datetime: null,
                },
            ],
            triggers: [
                {
                    kind: 'llm-prompt' as const,
                    settings: {
                        custom_inputs: [],
                        object_inputs: [],
                        outputs: [],
                    },
                },
            ],
            steps: [],
            transitions: [],
            available_languages: [],
            created_datetime: new Date().toISOString(),
            updated_datetime: new Date().toISOString(),
            apps: [{type: 'app' as const, app_id: '1'}],
        }
        renderWithRouter(
            <Provider store={mockStore()}>
                <QueryClientProvider client={queryClient}>
                    <ActionsTemplatesCards
                        templateConfigurations={[templateConfigurations]}
                    />
                </QueryClientProvider>
            </Provider>,
            {
                path: `:shopType/:shopName/ai-agent/actions/new`,
                route: 'shopify/test-shop/ai-agent/actions/new',
            }
        )

        expect(screen.getByText('test template')).toBeInTheDocument()
    })
})
