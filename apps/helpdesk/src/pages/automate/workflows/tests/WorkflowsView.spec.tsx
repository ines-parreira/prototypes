import { QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import { MemoryRouter, Route } from 'react-router-dom'
import configureMockStore from 'redux-mock-store'

import { useFlag } from 'core/flags'
import { billingState } from 'fixtures/billing'
import { IntegrationType } from 'models/integration/constants'
import {
    useDeleteWorkflowConfiguration,
    useDuplicateWorkflowConfiguration,
    useGetWorkflowConfigurations,
} from 'models/workflows/queries'
import type { RootState, StoreDispatch } from 'state/types'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { renderWithDnD, renderWithRouterAndDnD } from 'utils/testing'

import useStoreWorkflows from '../hooks/useStoreWorkflows'
import { useStoreWorkflowsApi } from '../hooks/useStoreWorkflowsApi'
import WorkflowsView from '../WorkflowsView'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>()
const queryClient = mockQueryClient()

jest.mock('models/workflows/queries', () => ({
    useGetWorkflowConfigurations: jest.fn(),
    useDuplicateWorkflowConfiguration: jest.fn(),
    useDeleteWorkflowConfiguration: jest.fn(),
}))
jest.mock('../hooks/useStoreWorkflows.ts')
jest.mock('core/flags')
jest.mock('../hooks/useStoreWorkflowsApi')

function getIntegration(id: number, type: IntegrationType) {
    return {
        id,
        type,
        name: `My Phone Integration ${id}`,
        meta: {
            emoji: '',
            phone_number_id: id,
            shop_name: 'ShopName',
        },
    }
}

const defaultState = {
    integrations: fromJS({
        integrations: [getIntegration(1, IntegrationType.Shopify)],
    }),
    billing: fromJS(billingState),
} as RootState

const useStoreWorkflowsMock = useStoreWorkflows as jest.MockedFunction<
    typeof useStoreWorkflows
>
const mockedUseWorkflowConfigurations = jest.mocked(
    useGetWorkflowConfigurations,
)

const mockedUseDuplicateWorkflowConfiguration = jest.mocked(
    useDuplicateWorkflowConfiguration,
)
const mockedUseDeleteWorkflowConfiguration = jest.mocked(
    useDeleteWorkflowConfiguration,
)

const mockUseFlag = useFlag as jest.Mock
const moackAppendWorkflowInStore = jest.fn()
const mockRemoveWorkflowFromStore = jest.fn()
const mockDuplicateWorkflow = jest.fn()
const legacyBaseUrl = '/app/automation/shopType/shopName/flows'
const revampBaseUrl = '/app/settings/flows/shopType/shopName'

describe('<WorkflowsView />', () => {
    beforeEach(() => {
        mockedUseWorkflowConfigurations.mockReturnValue({
            isLoading: false,
            data: [],
        } as unknown as ReturnType<typeof useGetWorkflowConfigurations>)

        mockedUseDuplicateWorkflowConfiguration.mockReturnValue({
            mutateAsync: jest.fn(),
            isLoading: false,
        } as unknown as ReturnType<typeof useDuplicateWorkflowConfiguration>)

        mockedUseDeleteWorkflowConfiguration.mockReturnValue({
            mutateAsync: jest.fn(),
            isLoading: false,
        } as unknown as ReturnType<typeof useDeleteWorkflowConfiguration>)

        const mockStoreWorkflowsApi = {
            isUpdatePending: false,
            duplicateWorkflow: mockDuplicateWorkflow,
            removeWorkflowFromStore: mockRemoveWorkflowFromStore,
            appendWorkflowInStore: moackAppendWorkflowInStore,
            workflowConfigurationById: {},
            isFetchPending: false,
        }
        const mockUseStoreWorkflowsApi =
            useStoreWorkflowsApi as jest.MockedFunction<
                typeof useStoreWorkflowsApi
            >

        mockUseStoreWorkflowsApi.mockReturnValue(mockStoreWorkflowsApi)
    })

    it('should display skeleton while workflow entrypoints are being fetched', async () => {
        useStoreWorkflowsMock.mockReturnValue({
            isFetchPending: true,
            workflows: [],
            storeIntegrationId: 1,
        })

        renderWithRouterAndDnD(
            <Provider store={mockStore(defaultState)}>
                <QueryClientProvider client={queryClient}>
                    <WorkflowsView
                        shopName=""
                        shopType=""
                        goToEditWorkflowPage={jest.fn()}
                        goToWorkflowTemplatesPage={jest.fn()}
                        goToNewWorkflowPage={jest.fn()}
                        goToNewWorkflowFromTemplatePage={jest.fn()}
                        notifyMerchant={jest.fn()}
                    />
                </QueryClientProvider>
            </Provider>,
        )

        await waitFor(() => {
            expect(screen.getByText('Loading...')).toBeInTheDocument()
        })
    })

    it('should display actual rows once workflow entrypoints have been fetched', async () => {
        useStoreWorkflowsMock.mockReturnValue({
            isFetchPending: false,
            workflows: [
                {
                    id: 'a',
                    internal_id: 'a',
                    name: 'a',
                    available_languages: [],
                    is_draft: false,
                    entrypoint: { label: '', label_tkey: '' },
                    steps: [],
                    initial_step_id: '',
                    created_datetime: '2023-12-22T10:41:08.337Z',
                    updated_datetime: '2023-12-22T10:41:08.337Z',
                    deleted_datetime: null,
                },
                {
                    id: 'b',
                    internal_id: 'b',
                    name: 'b',
                    available_languages: [],
                    is_draft: false,
                    entrypoint: { label: '', label_tkey: '' },
                    steps: [],
                    initial_step_id: '',
                    created_datetime: '2023-12-22T10:41:08.337Z',
                    updated_datetime: '2023-12-22T10:41:08.337Z',
                    deleted_datetime: null,
                },
            ],
            storeIntegrationId: 1,
        })

        renderWithDnD(
            <MemoryRouter initialEntries={[legacyBaseUrl]}>
                <Route path={legacyBaseUrl}>
                    <Provider store={mockStore(defaultState)}>
                        <QueryClientProvider client={queryClient}>
                            <WorkflowsView
                                shopName="ShopName"
                                shopType="shopify"
                                goToEditWorkflowPage={jest.fn()}
                                goToWorkflowTemplatesPage={jest.fn()}
                                goToNewWorkflowPage={jest.fn()}
                                goToNewWorkflowFromTemplatePage={jest.fn()}
                                notifyMerchant={jest.fn()}
                            />
                        </QueryClientProvider>
                    </Provider>
                </Route>
            </MemoryRouter>,
        )

        await waitFor(async () => {
            const skeletonRows = screen.queryAllByTestId(
                'shopper-flows-skeleton-row',
            )
            expect(skeletonRows.length).toBe(0)

            await screen.findByText('a')
            await screen.findByText('b')
        })
    })

    it('should render correctly with legacy path', async () => {
        mockUseFlag.mockReturnValue(true)

        useStoreWorkflowsMock.mockReturnValue({
            isFetchPending: false,
            workflows: [
                {
                    id: 'a',
                    internal_id: 'a',
                    name: 'a',
                    available_languages: [],
                    is_draft: false,
                    entrypoint: { label: '', label_tkey: '' },
                    steps: [],
                    initial_step_id: '',
                    created_datetime: '2023-12-22T10:41:08.337Z',
                    updated_datetime: '2023-12-22T10:41:08.337Z',
                    deleted_datetime: null,
                },
            ],
            storeIntegrationId: 1,
        })

        renderWithDnD(
            <MemoryRouter initialEntries={[legacyBaseUrl]}>
                <Route path={legacyBaseUrl}>
                    <Provider store={mockStore(defaultState)}>
                        <QueryClientProvider client={queryClient}>
                            <WorkflowsView
                                shopName="ShopName"
                                shopType="shopify"
                                goToEditWorkflowPage={jest.fn()}
                                goToWorkflowTemplatesPage={jest.fn()}
                                goToNewWorkflowPage={jest.fn()}
                                goToNewWorkflowFromTemplatePage={jest.fn()}
                                notifyMerchant={jest.fn()}
                            />
                        </QueryClientProvider>
                    </Provider>
                </Route>
            </MemoryRouter>,
        )

        await waitFor(() => {
            expect(screen.getByText('Flows')).toBeInTheDocument()
            expect(screen.queryByText('Create Custom Flow')).toBeInTheDocument()
            expect(
                screen.queryByText('Create From Template'),
            ).toBeInTheDocument()
        })
        const deleteIcon = screen.getByTitle('Delete')
        fireEvent.click(deleteIcon)
        const tooltip = await screen.findByRole('tooltip')
        const deleteButton = within(tooltip).getByText('Delete')
        fireEvent.click(deleteButton)

        expect(mockRemoveWorkflowFromStore).toHaveBeenCalledWith('a', 1)
    })

    it('should render correctly with revamp path', async () => {
        mockUseFlag.mockReturnValue(true)

        useStoreWorkflowsMock.mockReturnValue({
            isFetchPending: false,
            workflows: [
                {
                    id: 'a',
                    internal_id: 'a',
                    name: 'a',
                    available_languages: [],
                    is_draft: false,
                    entrypoint: { label: '', label_tkey: '' },
                    steps: [],
                    initial_step_id: '',
                    created_datetime: '2023-12-22T10:41:08.337Z',
                    updated_datetime: '2023-12-22T10:41:08.337Z',
                    deleted_datetime: null,
                },
            ],
            storeIntegrationId: 1,
        })

        renderWithDnD(
            <MemoryRouter initialEntries={[revampBaseUrl]}>
                <Route path={revampBaseUrl}>
                    <Provider store={mockStore(defaultState)}>
                        <QueryClientProvider client={queryClient}>
                            <WorkflowsView
                                shopName="ShopName"
                                shopType="shopify"
                                goToEditWorkflowPage={jest.fn()}
                                goToWorkflowTemplatesPage={jest.fn()}
                                goToNewWorkflowPage={jest.fn()}
                                goToNewWorkflowFromTemplatePage={jest.fn()}
                                notifyMerchant={jest.fn()}
                            />
                        </QueryClientProvider>
                    </Provider>
                </Route>
            </MemoryRouter>,
        )

        await waitFor(() => {
            expect(screen.queryByText('Create Custom Flow')).toBeInTheDocument()
            expect(
                screen.queryByText('Create From Template'),
            ).toBeInTheDocument()
        })
    })

    it('should render correctly when workflowslength is 0', async () => {
        mockUseFlag.mockReturnValue(true)

        useStoreWorkflowsMock.mockReturnValue({
            isFetchPending: false,
            workflows: [],
            storeIntegrationId: 1,
        })

        renderWithDnD(
            <MemoryRouter initialEntries={[legacyBaseUrl]}>
                <Route path={legacyBaseUrl}>
                    <Provider store={mockStore(defaultState)}>
                        <QueryClientProvider client={queryClient}>
                            <WorkflowsView
                                shopName="ShopName"
                                shopType="shopify"
                                goToEditWorkflowPage={jest.fn()}
                                goToWorkflowTemplatesPage={jest.fn()}
                                goToNewWorkflowPage={jest.fn()}
                                goToNewWorkflowFromTemplatePage={jest.fn()}
                                notifyMerchant={jest.fn()}
                            />
                        </QueryClientProvider>
                    </Provider>
                </Route>
            </MemoryRouter>,
        )

        await waitFor(() => {
            expect(screen.getByText('Flows')).toBeInTheDocument()
            expect(screen.queryByText('Create Custom Flow')).toBeInTheDocument()
            expect(
                screen.queryByText('Create From Template'),
            ).toBeInTheDocument()
            expect(
                document.querySelector(
                    '[data-candu-id="flows-empty-state-banner-description"]',
                ),
            ).toBeInTheDocument()
        })
    })

    it('should not render header elements when on a non-root route', () => {
        useStoreWorkflowsMock.mockReturnValue({
            isFetchPending: false,
            workflows: [],
            storeIntegrationId: 1,
        })

        renderWithDnD(
            <MemoryRouter initialEntries={[`${legacyBaseUrl}/templates`]}>
                <Route path={`${legacyBaseUrl}/templates`}>
                    <Provider store={mockStore(defaultState)}>
                        <QueryClientProvider client={queryClient}>
                            <WorkflowsView
                                shopName="ShopName"
                                shopType="shopify"
                                goToEditWorkflowPage={jest.fn()}
                                goToWorkflowTemplatesPage={jest.fn()}
                                goToNewWorkflowPage={jest.fn()}
                                goToNewWorkflowFromTemplatePage={jest.fn()}
                                notifyMerchant={jest.fn()}
                            />
                        </QueryClientProvider>
                    </Provider>
                </Route>
            </MemoryRouter>,
        )

        expect(screen.queryByText('Flows')).not.toBeInTheDocument()
        expect(screen.queryByText('Create Custom Flow')).not.toBeInTheDocument()
        expect(
            screen.queryByText('Create From Template'),
        ).not.toBeInTheDocument()
    })
})
