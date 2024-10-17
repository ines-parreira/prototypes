import React from 'react'
import {screen} from '@testing-library/react'
import {QueryClientProvider} from '@tanstack/react-query'
import thunk from 'redux-thunk'
import configureMockStore from 'redux-mock-store'
import {Provider} from 'react-redux'
import {fromJS} from 'immutable'
import {dummyAppListData} from 'fixtures/apps'
import {renderWithRouter} from 'utils/testing'
import {mockQueryClient} from 'tests/reactQueryTestingUtils'
import {useGetApps, useGetAppsByIds} from 'models/integration/queries'
import {
    useGetWorkflowConfigurationTemplates,
    useListActionsApps,
} from 'models/workflows/queries'
import {RootState} from 'state/types'
import useDeleteAction from '../../hooks/useDeleteAction'
import useUpsertAction from '../../hooks/useUpsertAction'
import ActionsList from '../ActionsList'

jest.mock('models/integration/queries')
jest.mock('models/workflows/queries')
jest.mock('../../hooks/useDeleteAction')
jest.mock('../../hooks/useUpsertAction')

const mockStore = configureMockStore([thunk])
const queryClient = mockQueryClient()

const mockUseGetApps = jest.mocked(useGetApps)
const mockUseGetAppsByIds = jest.mocked(useGetAppsByIds)
const mockUseListActionsApps = jest.mocked(useListActionsApps)
const mockUseUpsertAction = jest.mocked(useUpsertAction)
const mockUseDeleteAction = jest.mocked(useDeleteAction)
const mockUseGetWorkflowConfigurationTemplates = jest.mocked(
    useGetWorkflowConfigurationTemplates
)

describe('<ActionsList />', () => {
    it('should render component', () => {
        mockUseGetApps.mockReturnValue({
            data: [dummyAppListData],
            isInitialLoading: false,
        } as unknown as ReturnType<typeof useGetApps>)

        mockUseListActionsApps.mockReturnValue({
            data: [],
            isInitialLoading: false,
        } as unknown as ReturnType<typeof useListActionsApps>)

        mockUseGetWorkflowConfigurationTemplates.mockReturnValue({
            data: [],
            isInitialLoading: false,
        } as unknown as ReturnType<
            typeof mockUseGetWorkflowConfigurationTemplates
        >)

        mockUseDeleteAction.mockReturnValue({
            mutate: jest.fn(),
            isLoading: false,
            isSuccess: false,
        } as unknown as ReturnType<typeof useDeleteAction>)

        mockUseUpsertAction.mockReturnValue({
            mutate: jest.fn(),
            isLoading: false,
            isSuccess: false,
        } as unknown as ReturnType<typeof useUpsertAction>)

        mockUseGetAppsByIds.mockReturnValue([])
        const storeState = {
            integrations: fromJS({
                integrations: [
                    {
                        type: 'shopify',
                        meta: {
                            shop_name: 'shop-name',
                            oauth: {status: 'success'},
                        },
                    },
                ],
            }),
        } as RootState

        const actionConfiguration = {
            account_id: 1,
            name: 'test',
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
            <Provider store={mockStore(storeState)}>
                <QueryClientProvider client={queryClient}>
                    <ActionsList actions={[actionConfiguration]} />
                </QueryClientProvider>
            </Provider>
        )

        expect(screen.getByText('test')).toBeInTheDocument()
    })
})
