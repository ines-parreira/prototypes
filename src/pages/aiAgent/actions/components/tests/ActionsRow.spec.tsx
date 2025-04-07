import React from 'react'

import { QueryClientProvider } from '@tanstack/react-query'
import { act, fireEvent, screen, waitFor } from '@testing-library/react'
import { createMemoryHistory } from 'history'
import { ulid } from 'ulidx'

import useGetDateAndTimeFormat from 'hooks/useGetDateAndTimeFormat'
import { IntegrationType } from 'models/integration/constants'
import {
    useGetWorkflowConfigurationTemplates,
    useListTrackstarConnections,
} from 'models/workflows/queries'
import useDeleteAction from 'pages/aiAgent/actions/hooks/useDeleteAction'
import useUpsertAction from 'pages/aiAgent/actions/hooks/useUpsertAction'
import { StoreWorkflowsConfiguration } from 'pages/aiAgent/actions/types'
import useApps from 'pages/automate/actionsPlatform/hooks/useApps'
import { WorkflowConfigurationBuilder } from 'pages/automate/workflows/models/workflowConfiguration.model'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { renderWithRouter } from 'utils/testing'

import StoreTrackstarProvider from '../../providers/StoreTrackstarProvider'
import ActionsRow from '../ActionsRow'

jest.mock('pages/automate/actionsPlatform/hooks/useApps')
jest.mock('models/workflows/queries')
jest.mock('hooks/useGetDateAndTimeFormat')
jest.mock('pages/aiAgent/actions/hooks/useDeleteAction')
jest.mock('pages/aiAgent/actions/hooks/useUpsertAction')

const queryClient = mockQueryClient()

const mockUseApps = jest.mocked(useApps)
const mockUseUpsertAction = jest.mocked(useUpsertAction)
const mockUseDeleteAction = jest.mocked(useDeleteAction)
const mockUseGetDateAndTimeFormat = jest.mocked(useGetDateAndTimeFormat)
const mockUseGetWorkflowConfigurationTemplates = jest.mocked(
    useGetWorkflowConfigurationTemplates,
)
const mockUseListTrackstarConnections = jest.mocked(useListTrackstarConnections)

const b = new WorkflowConfigurationBuilder({
    id: ulid(),
    name: 'Action name',
    initialStep: {
        id: ulid(),
        kind: 'http-request',
        settings: {
            headers: {},
            method: 'GET',
            name: 'name',
            url: 'https://example.com',
            variables: [],
        },
    },
    entrypoints: [
        {
            kind: 'llm-conversation',
            trigger: 'llm-prompt',
            settings: {
                instructions: 'instructions',
                requires_confirmation: false,
            },
            deactivated_datetime: null,
        },
    ],
    triggers: [
        {
            kind: 'llm-prompt',
            settings: {
                custom_inputs: [],
                object_inputs: [],
                outputs: [],
                conditions: null,
            },
        },
    ],
    is_draft: false,
    apps: [
        {
            type: 'shopify',
        },
        {
            type: 'recharge',
        },
        {
            type: 'app',
            app_id: 'someid',
        },
        {
            type: 'app',
            app_id: 'sandbox',
        },
    ],
    available_languages: [],
})
b.insertReusableLLMPromptCallAndSelect({
    configuration_id: 'uuid1',
    configuration_internal_id: 'internal_uuid1',
    values: {},
})
b.insertReusableLLMPromptCallAndSelect({
    configuration_id: 'uuid2',
    configuration_internal_id: 'internal_uuid2',
    values: {},
})
b.insertReusableLLMPromptCallAndSelect({
    configuration_id: 'uuid3',
    configuration_internal_id: 'internal_uuid3',
    values: {},
})

const configuration = b.build() as StoreWorkflowsConfiguration

describe('<ActionsRow />', () => {
    beforeEach(() => {
        mockUseApps.mockReturnValue({
            apps: [
                {
                    icon: '/assets/img/integrations/someid.png',
                    id: 'someid',
                    name: 'Some App',
                    type: IntegrationType.App,
                },
                {
                    icon: '/assets/img/integrations/recharge.png',
                    id: 'recharge',
                    name: 'Recharge',
                    type: IntegrationType.Recharge,
                },
                {
                    icon: '/assets/img/integrations/shopify.png',
                    id: 'shopify',
                    name: 'Shopify',
                    type: IntegrationType.Shopify,
                },
                {
                    icon: '/assets/img/integrations/sandbox.png',
                    id: 'sandbox',
                    name: 'Sandbox',
                    type: IntegrationType.App,
                },
            ],
            isLoading: false,
            actionsApps: [
                {
                    id: 'sandbox',
                    auth_type: 'trackstar',
                    auth_settings: {
                        integration_name: 'sandbox',
                    },
                },
            ],
        })
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
        mockUseGetDateAndTimeFormat.mockReturnValue('MM/DD/YYYY')
        mockUseGetWorkflowConfigurationTemplates.mockReturnValue({
            data: [
                {
                    id: 'uuid1',
                    apps: [
                        {
                            app_id: 'someid',
                            type: IntegrationType.App,
                        },
                    ],
                },
                {
                    id: 'uuid2',
                    apps: [
                        {
                            app_id: 'recharge',
                            type: IntegrationType.Recharge,
                        },
                    ],
                },
                {
                    id: 'uuid3',
                    apps: [
                        {
                            app_id: 'shopify',
                            type: IntegrationType.Shopify,
                        },
                    ],
                },
                {
                    id: 'uuid4',
                    apps: [
                        {
                            app_id: 'sandbox',
                            type: IntegrationType.App,
                            auth_type: 'trackstar',
                            auth_settings: {
                                integration_name: 'sandbox',
                            },
                        },
                    ],
                },
            ],
        } as unknown as ReturnType<typeof useGetWorkflowConfigurationTemplates>)
        mockUseListTrackstarConnections.mockReturnValue({
            data: { sandbox: { integration_name: 'sandbox', error: true } },
            isLoading: false,
        } as unknown as ReturnType<typeof useListTrackstarConnections>)
    })

    it('should render component', () => {
        renderWithRouter(
            <QueryClientProvider client={queryClient}>
                <ActionsRow action={configuration} />
            </QueryClientProvider>,
        )

        expect(screen.getByText('Action name')).toBeInTheDocument()

        expect(screen.getByTitle('Shopify')).toBeInTheDocument()
        expect(screen.getByTitle('Recharge')).toBeInTheDocument()
        expect(screen.getByTitle('Some App')).toBeInTheDocument()
        expect(screen.getByTitle('HTTP request')).toBeInTheDocument()
    })

    it('should display last updated at datetime', () => {
        renderWithRouter(
            <QueryClientProvider client={queryClient}>
                <ActionsRow
                    action={{
                        ...configuration,
                        updated_datetime: '2025-01-15T14:58:19.164Z',
                    }}
                />
            </QueryClientProvider>,
        )

        expect(screen.getByText('01/15/2025')).toBeInTheDocument()
    })

    it('should toggle availability for AI Agent', () => {
        const mockUpsertAction = jest.fn()

        mockUseUpsertAction.mockReturnValue({
            mutate: mockUpsertAction,
            isLoading: false,
            isSuccess: false,
        } as unknown as ReturnType<typeof useUpsertAction>)

        renderWithRouter(
            <QueryClientProvider client={queryClient}>
                <ActionsRow action={configuration} />
            </QueryClientProvider>,
        )

        act(() => {
            fireEvent.click(screen.getByRole('switch'))
        })

        expect(mockUpsertAction).toHaveBeenCalled()
    })

    it('should redirect to edit Action page on click', () => {
        const history = createMemoryHistory({
            initialEntries: [
                `/app/automation/shopify/shopify-store/ai-agent/actions`,
            ],
        })
        const historyPushSpy = jest.spyOn(history, 'push')

        renderWithRouter(
            <QueryClientProvider client={queryClient}>
                <ActionsRow action={configuration} />
            </QueryClientProvider>,
            {
                history,
                path: '/app/automation/:shopType/:shopName/ai-agent/actions',
                route: `/app/automation/shopify/shopify-store/ai-agent/actions`,
            },
        )

        act(() => {
            fireEvent.click(screen.getByText('Action name'))
        })

        expect(historyPushSpy).toHaveBeenCalledWith(
            `/app/automation/shopify/shopify-store/ai-agent/actions/edit/${configuration.id}`,
        )
    })

    it('should delete Action', () => {
        const mockDeleteAction = jest.fn()

        mockUseDeleteAction.mockReturnValue({
            mutate: mockDeleteAction,
            isLoading: false,
            isSuccess: false,
        } as unknown as ReturnType<typeof useDeleteAction>)

        renderWithRouter(
            <QueryClientProvider client={queryClient}>
                <ActionsRow action={configuration} />
            </QueryClientProvider>,
        )

        act(() => {
            fireEvent.click(screen.getByText('delete'))
        })

        act(() => {
            fireEvent.click(screen.getByText('Delete'))
        })

        expect(mockDeleteAction).toHaveBeenCalled()
    })

    it('should display error icon when connection is lost', async () => {
        renderWithRouter(
            <QueryClientProvider client={queryClient}>
                <StoreTrackstarProvider
                    storeName="shopify-store"
                    storeType="shopify"
                >
                    <ActionsRow
                        action={{
                            ...configuration,
                            apps: configuration.apps!.filter(
                                (app) => app.type === 'app',
                            ),
                        }}
                    />
                </StoreTrackstarProvider>
            </QueryClientProvider>,
        )

        act(() => {
            fireEvent.mouseEnter(screen.getByText('error'))
        })
        await waitFor(() => {
            expect(
                screen.getByText(
                    'We lost connection with Sandbox. Reconnect to avoid disruptions with Action performance.',
                ),
            ).toBeInTheDocument()
        })
    })
})
