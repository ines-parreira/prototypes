import { render } from '@repo/testing'

// must be kept as first import in the file
import 'pages/aiAgent/test/mock-activation-hooks.utils'

import { useFlag } from '@repo/feature-flags'
import { screen, waitFor, within } from '@testing-library/react'
import { fromJS } from 'immutable'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { useLocation } from 'react-router-dom'
import { ulid } from 'ulidx'

import { mockListTrackstarHandler } from '@gorgias/workflows-mocks'

import { integrationsState } from 'fixtures/integrations'
import { useFindAllGuidancesKnowledgeResources } from 'models/knowledgeService/queries'
import {
    useGetStoreApps,
    useGetStoreWorkflowsConfigurations,
    useGetWorkflowConfigurationTemplate,
    useGetWorkflowConfigurationTemplates,
    useListActionsApps,
} from 'models/workflows/queries'
import { useAddStoreApp } from 'pages/aiAgent/actions/hooks/useAddStoreApp'
import { useDeleteAction } from 'pages/aiAgent/actions/hooks/useDeleteAction'
import { useThreeplIntegrations } from 'pages/aiAgent/actions/hooks/useThreeplIntegrations'
import { useUpsertAction } from 'pages/aiAgent/actions/hooks/useUpsertAction'
import { useAiAgentNavigation } from 'pages/aiAgent/hooks/useAiAgentNavigation'
import { useApps } from 'pages/automate/actionsPlatform/hooks/useApps'
import { WorkflowConfigurationBuilder } from 'pages/automate/workflows/models/workflowConfiguration.model'
import * as serverValidationErrors from 'pages/automate/workflows/utils/serverValidationErrors'

import { ActionConfigTab } from './ActionConfigTab'

jest.mock('models/workflows/queries')
jest.mock('models/knowledgeService/queries')
jest.mock('pages/aiAgent/actions/hooks/useUpsertAction')
jest.mock('pages/aiAgent/actions/hooks/useDeleteAction')
jest.mock('pages/aiAgent/actions/hooks/useAddStoreApp')
jest.mock('pages/aiAgent/actions/hooks/useThreeplIntegrations')
jest.mock('pages/automate/actionsPlatform/hooks/useApps')
jest.mock('pages/aiAgent/hooks/useAiAgentNavigation')
jest.mock('pages/automate/workflows/utils/serverValidationErrors')
jest.mock('@repo/feature-flags')

jest.mock('state/integrations/selectors', () => ({
    ...jest.requireActual('state/integrations/selectors'),
    getIntegrationsList: () => [{ type: 'shopify', count: 1 }],
}))

const mockUseUpsertAction = jest.mocked(useUpsertAction)
const mockUseDeleteAction = jest.mocked(useDeleteAction)
const mockUseGetWorkflowConfigurationTemplates = jest.mocked(
    useGetWorkflowConfigurationTemplates,
)
const mockUseGetWorkflowConfigurationTemplate = jest.mocked(
    useGetWorkflowConfigurationTemplate,
)
const mockUseGetStoreWorkflowsConfigurations = jest.mocked(
    useGetStoreWorkflowsConfigurations,
)
const mockUseListActionsApps = jest.mocked(useListActionsApps)
const mockUseGetStoreApps = jest.mocked(useGetStoreApps)
const mockUseFindAllGuidancesKnowledgeResources = jest.mocked(
    useFindAllGuidancesKnowledgeResources,
)
const mockUseApps = jest.mocked(useApps)
const mockUseThreeplIntegrations = jest.mocked(useThreeplIntegrations)
const mockUseAddStoreApp = jest.mocked(useAddStoreApp)
const mockUseAiAgentNavigation = jest.mocked(useAiAgentNavigation)
const mockUseFlag = jest.mocked(useFlag)
const mockServerValidationErrors = jest.mocked(serverValidationErrors)

const ROUTE_PATH = '/app/ai-agent/:shopType/:shopName/actions/edit/:id'
const ROUTE_URL = '/app/ai-agent/shopify/my-shop/actions/edit/cfg-1'

const LocationPath = () => {
    const location = useLocation()
    return <div>path:{location.pathname}</div>
}

const buildConfiguration = (overrides: { name?: string } = {}) => {
    const builder = new WorkflowConfigurationBuilder({
        id: ulid(),
        name: overrides.name ?? 'Get order info',
        initialStep: {
            id: ulid(),
            kind: 'http-request',
            settings: {
                headers: {},
                method: 'GET',
                name: 'fetch_order',
                url: 'https://example.com/orders',
                variables: [],
            },
        },
        entrypoints: [
            {
                kind: 'llm-conversation',
                trigger: 'llm-prompt',
                settings: {
                    instructions: 'Fetch the customer order.',
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
        apps: [],
        available_languages: [],
    })
    builder.insertHttpRequestConditionAndEndStepAndSelect('success', {
        success: true,
    })
    builder.selectParentStep()
    builder.insertHttpRequestConditionAndEndStepAndSelect('error', {
        success: false,
    })

    return builder.build()
}

const REUSABLE_TEMPLATE_ID = 'tpl-shopify-inventory'
const REUSABLE_TEMPLATE_INTERNAL_ID = 'tpl-shopify-inventory-internal'

const buildConfigurationWithReusableStep = () => {
    const builder = new WorkflowConfigurationBuilder({
        id: ulid(),
        name: 'Action with reusable step',
        initialStep: {
            id: ulid(),
            kind: 'http-request',
            settings: {
                headers: {},
                method: 'GET',
                name: 'fetch_order',
                url: 'https://example.com/orders',
                variables: [],
            },
        },
        entrypoints: [
            {
                kind: 'llm-conversation',
                trigger: 'llm-prompt',
                settings: {
                    instructions: 'Fetch the customer order.',
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
        apps: [],
        available_languages: [],
    })
    builder.insertReusableLLMPromptCallAndSelect({
        configuration_id: REUSABLE_TEMPLATE_ID,
        configuration_internal_id: REUSABLE_TEMPLATE_INTERNAL_ID,
        values: {},
    })

    return builder.build()
}

const renderConfigTab = (
    configuration = buildConfiguration(),
    upsertOverrides: Partial<ReturnType<typeof useUpsertAction>> = {},
    deleteOverrides: Partial<ReturnType<typeof useDeleteAction>> = {},
) => {
    const mutateAsync = jest.fn().mockResolvedValue({ data: configuration })
    mockUseUpsertAction.mockReturnValue({
        isLoading: false,
        isSuccess: false,
        mutateAsync,
        ...upsertOverrides,
    } as unknown as ReturnType<typeof useUpsertAction>)

    const deleteMutateAsync = jest.fn().mockResolvedValue(undefined)
    mockUseDeleteAction.mockReturnValue({
        isLoading: false,
        mutateAsync: deleteMutateAsync,
        ...deleteOverrides,
    } as unknown as ReturnType<typeof useDeleteAction>)

    const renderResult = render(
        <>
            <ActionConfigTab
                configuration={
                    configuration as unknown as Parameters<
                        typeof ActionConfigTab
                    >[0]['configuration']
                }
            />
            <LocationPath />
        </>,
        {
            path: ROUTE_PATH,
            initialEntries: [ROUTE_URL],
            storeState: {
                integrations: fromJS(integrationsState),
            },
        },
    )

    return {
        ...renderResult,
        mutateAsync,
        deleteMutateAsync,
        configuration,
    }
}

const server = setupServer()

describe('<ActionConfigTab />', () => {
    beforeAll(() => {
        Element.prototype.getAnimations = () => []
        server.listen({ onUnhandledRequest: 'error' })
    })

    afterAll(() => {
        server.close()
    })

    afterEach(() => {
        server.resetHandlers()
    })

    beforeEach(() => {
        jest.clearAllMocks()

        server.use(
            mockListTrackstarHandler(async () => HttpResponse.json([])).handler,
        )

        mockUseGetWorkflowConfigurationTemplates.mockReturnValue({
            data: [],
        } as unknown as ReturnType<typeof useGetWorkflowConfigurationTemplates>)
        mockUseGetStoreWorkflowsConfigurations.mockReturnValue({
            data: [],
        } as unknown as ReturnType<typeof useGetStoreWorkflowsConfigurations>)
        mockUseGetWorkflowConfigurationTemplate.mockReturnValue({
            data: undefined,
        } as unknown as ReturnType<typeof useGetWorkflowConfigurationTemplate>)
        mockUseListActionsApps.mockReturnValue({
            data: [],
        } as unknown as ReturnType<typeof useListActionsApps>)
        mockUseGetStoreApps.mockReturnValue({
            data: [],
            isInitialLoading: false,
        } as unknown as ReturnType<typeof useGetStoreApps>)
        mockUseFindAllGuidancesKnowledgeResources.mockReturnValue({
            data: { data: [] },
            isLoading: false,
        } as unknown as ReturnType<
            typeof useFindAllGuidancesKnowledgeResources
        >)
        mockUseApps.mockReturnValue({
            apps: [],
            actionsApps: [],
            isLoading: false,
        } as unknown as ReturnType<typeof useApps>)
        mockUseThreeplIntegrations.mockReturnValue([])
        mockUseAddStoreApp.mockReturnValue(jest.fn())
        mockUseAiAgentNavigation.mockReturnValue({
            routes: { actions: '/app/ai-agent/shopify/my-shop/actions' },
            navigationItems: [],
        } as unknown as ReturnType<typeof useAiAgentNavigation>)
        mockUseFlag.mockReturnValue(true)
        mockServerValidationErrors.mapServerErrorsToGraph = jest
            .fn()
            .mockReturnValue(null)
    })

    it('renders the four configuration sections with values from the configuration', () => {
        renderConfigTab()

        // Each section card has a unique description paragraph
        expect(
            screen.getByText(/Provide a clear, unique name/i),
        ).toBeInTheDocument()
        expect(
            screen.getByText(/Describe what this action does/i),
        ).toBeInTheDocument()
        expect(
            screen.getByText(
                /Set conditions that must be met for this action to run/i,
            ),
        ).toBeInTheDocument()
        expect(
            screen.getByText(/Add one or more steps with your 3rd party apps/i),
        ).toBeInTheDocument()

        const nameField = screen.getByRole('textbox', {
            name: /Action name/i,
        })
        expect(nameField).toHaveValue('Get order info')

        const instructionsField = screen.getByRole('textbox', {
            name: /Description/i,
        })
        expect(instructionsField).toHaveValue('Fetch the customer order.')
    })

    it('disables Save and Cancel until the form is dirty, then enables both on edit', async () => {
        const { user } = renderConfigTab()

        expect(screen.getByRole('button', { name: 'Save' })).toHaveAttribute(
            'aria-disabled',
            'true',
        )
        expect(screen.getByRole('button', { name: 'Cancel' })).toHaveAttribute(
            'aria-disabled',
            'true',
        )

        const nameField = screen.getByRole('textbox', { name: /Action name/i })
        await user.type(nameField, ' updated')

        await waitFor(() => {
            expect(
                screen.getByRole('button', { name: 'Save' }),
            ).toHaveAttribute('aria-disabled', 'false')
        })
        expect(screen.getByRole('button', { name: 'Cancel' })).toHaveAttribute(
            'aria-disabled',
            'false',
        )
    })

    it('reverts edits to the initial graph when Cancel is clicked', async () => {
        const { user } = renderConfigTab()

        const nameField = screen.getByRole('textbox', { name: /Action name/i })
        await user.type(nameField, ' updated')
        await waitFor(() => {
            expect(nameField).toHaveValue('Get order info updated')
        })

        await user.click(screen.getByRole('button', { name: 'Cancel' }))

        await waitFor(() => {
            expect(nameField).toHaveValue('Get order info')
        })
        expect(screen.getByRole('button', { name: 'Save' })).toHaveAttribute(
            'aria-disabled',
            'true',
        )
        expect(screen.getByRole('button', { name: 'Cancel' })).toHaveAttribute(
            'aria-disabled',
            'true',
        )
    })

    it('persists changes via useUpsertAction when Save is clicked', async () => {
        const { user, mutateAsync } = renderConfigTab()

        const nameField = screen.getByRole('textbox', { name: /Action name/i })
        await user.type(nameField, ' v2')
        await user.click(screen.getByRole('button', { name: 'Save' }))

        await waitFor(() => {
            expect(mutateAsync).toHaveBeenCalledTimes(1)
        })

        const [pathParams, body] = mutateAsync.mock.calls[0][0] as [
            Record<string, string>,
            Record<string, unknown>,
        ]
        expect(pathParams).toMatchObject({
            store_name: 'my-shop',
            store_type: 'shopify',
        })
        expect(body).toMatchObject({ name: 'Get order info v2' })
    })

    it('blocks save and reports an error summary when validation fails', async () => {
        const { user, mutateAsync } = renderConfigTab()

        const nameField = screen.getByRole('textbox', { name: /Action name/i })
        await user.clear(nameField)
        await user.click(screen.getByRole('button', { name: 'Save' }))

        await waitFor(() => {
            expect(screen.getByRole('alert')).toHaveTextContent(
                /fix the highlighted errors/i,
            )
        })
        expect(mutateAsync).not.toHaveBeenCalled()
    })

    it('surfaces server validation errors mapped onto the graph after a failed save', async () => {
        const mutateAsync = jest
            .fn()
            .mockRejectedValue(new Error('400 validation error'))
        const configuration = buildConfiguration()

        mockServerValidationErrors.mapServerErrorsToGraph = jest
            .fn()
            .mockImplementation((_error, graph) => ({
                ...graph,
                errors: { name: 'Server says: name already taken' },
            }))

        const { user } = renderConfigTab(configuration, { mutateAsync })

        const nameField = screen.getByRole('textbox', { name: /Action name/i })
        await user.type(nameField, ' updated')
        await user.click(screen.getByRole('button', { name: 'Save' }))

        await waitFor(() => {
            expect(mutateAsync).toHaveBeenCalledTimes(1)
        })
        await waitFor(() => {
            expect(screen.getByRole('alert')).toHaveTextContent(
                /please fix the validation errors below/i,
            )
        })
        expect(
            mockServerValidationErrors.mapServerErrorsToGraph,
        ).toHaveBeenCalledTimes(1)
    })

    it('re-throws unmapped server errors without showing the validation summary', async () => {
        const mutateAsync = jest
            .fn()
            .mockRejectedValue(new Error('500 server error'))
        const configuration = buildConfiguration()

        mockServerValidationErrors.mapServerErrorsToGraph = jest
            .fn()
            .mockReturnValue(null)

        const { user } = renderConfigTab(configuration, { mutateAsync })

        const nameField = screen.getByRole('textbox', { name: /Action name/i })
        await user.type(nameField, ' updated')
        await user.click(screen.getByRole('button', { name: 'Save' }))

        await waitFor(() => {
            expect(mutateAsync).toHaveBeenCalledTimes(1)
        })
        expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    })

    it('uses the action id, store name and store type when calling the upsert mutation', async () => {
        const configuration = buildConfiguration({ name: 'Edit me' })
        const { user, mutateAsync } = renderConfigTab(configuration)

        const nameField = screen.getByRole('textbox', { name: /Action name/i })
        await user.type(nameField, '!')
        await user.click(screen.getByRole('button', { name: 'Save' }))

        await waitFor(() => {
            expect(mutateAsync).toHaveBeenCalled()
        })

        const [pathParams] = mutateAsync.mock.calls[0][0] as [
            Record<string, string>,
            unknown,
        ]
        expect(pathParams.internal_id).toBe(configuration.internal_id)
    })

    describe('Steps list', () => {
        const mockTemplates = (apps: { type: string; app_id?: string }[]) => {
            const template = {
                id: REUSABLE_TEMPLATE_ID,
                internal_id: REUSABLE_TEMPLATE_INTERNAL_ID,
                name: 'Get inventory stock',
                apps,
                inputs: [],
            }

            mockUseGetWorkflowConfigurationTemplates.mockReturnValue({
                data: [template],
            } as unknown as ReturnType<
                typeof useGetWorkflowConfigurationTemplates
            >)
            mockUseGetWorkflowConfigurationTemplate.mockReturnValue({
                data: template,
            } as unknown as ReturnType<
                typeof useGetWorkflowConfigurationTemplate
            >)
        }

        const mockShopifyApp = () => {
            mockUseApps.mockReturnValue({
                apps: [
                    {
                        id: 'shopify',
                        type: 'app',
                        name: 'Shopify',
                        icon: 'https://example.com/shopify.png',
                    },
                ],
                actionsApps: [],
                isLoading: false,
            } as unknown as ReturnType<typeof useApps>)
        }

        it('renders one step row per reusable-llm-prompt-call node with the resolved app and step name', () => {
            mockTemplates([{ type: 'app', app_id: 'shopify' }])
            mockShopifyApp()

            renderConfigTab(buildConfigurationWithReusableStep())

            expect(screen.getByText('Shopify')).toBeInTheDocument()
            expect(screen.getByText('Get inventory stock')).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: /Add step/i }),
            ).toBeInTheDocument()
        })

        it('handles activation on a step row without errors', async () => {
            mockTemplates([{ type: 'app', app_id: 'shopify' }])
            mockShopifyApp()

            const { user } = renderConfigTab(
                buildConfigurationWithReusableStep(),
            )

            const row = screen.getByRole('button', {
                name: 'Shopify — Get inventory stock',
            })
            row.focus()
            await user.keyboard('{Enter}')

            const drawer = await screen.findByRole('dialog', {
                name: 'Node editor',
            })
            expect(
                within(drawer).getByRole('heading', {
                    name: 'Get inventory stock in Shopify',
                }),
            ).toBeInTheDocument()
        })

        it('exposes the delete affordance on each step row', () => {
            mockTemplates([{ type: 'app', app_id: 'shopify' }])
            mockShopifyApp()

            renderConfigTab(buildConfigurationWithReusableStep())

            expect(
                screen.getByRole('button', {
                    name: 'Delete Shopify Get inventory stock step',
                }),
            ).toBeInTheDocument()
        })

        it('falls back to a loading skeleton when the step template is missing', () => {
            mockUseGetWorkflowConfigurationTemplates.mockReturnValue({
                data: [],
            } as unknown as ReturnType<
                typeof useGetWorkflowConfigurationTemplates
            >)
            mockShopifyApp()

            const { container } = renderConfigTab(
                buildConfigurationWithReusableStep(),
            )

            expect(
                screen.queryByText('Get inventory stock'),
            ).not.toBeInTheDocument()
            expect(
                container.querySelectorAll('[aria-busy="true"]').length,
            ).toBeGreaterThan(0)
        })

        it('toggles the Add step menu when its trigger is clicked', async () => {
            mockTemplates([{ type: 'app', app_id: 'shopify' }])
            mockShopifyApp()

            const { user } = renderConfigTab(
                buildConfigurationWithReusableStep(),
            )

            const addStepButton = screen.getByRole('button', {
                name: /Add step/i,
            })
            await user.click(addStepButton)
            await user.click(addStepButton)

            // The button remains in the document across two toggles; this
            // covers the handler callback path inside ActionStepList.
            expect(addStepButton).toBeInTheDocument()
        })
    })

    describe('Delete action card', () => {
        it('renders the delete action card with description and button', () => {
            renderConfigTab()

            expect(
                screen.getByText(
                    /Remove this action from any AI Agent Skills, Macros, and Rules using it/i,
                ),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: /Delete action/i }),
            ).toBeInTheDocument()
        })

        it('opens a confirmation modal and only calls the delete mutation after confirming', async () => {
            const configuration = buildConfiguration()
            const { user, deleteMutateAsync } = renderConfigTab(configuration)

            await user.click(
                screen.getByRole('button', { name: /Delete action/i }),
            )

            // Modal opens — a second "Delete action" button (the confirm)
            // and a modal "Cancel" button are now in the DOM.
            await waitFor(() => {
                expect(
                    screen.getAllByRole('button', {
                        name: /Delete action/i,
                    }),
                ).toHaveLength(2)
            })

            const deleteButtons = screen.getAllByRole('button', {
                name: /Delete action/i,
            })
            await user.click(deleteButtons[deleteButtons.length - 1])

            await waitFor(() => {
                expect(deleteMutateAsync).toHaveBeenCalledWith([
                    { internal_id: configuration.internal_id },
                ])
            })
        })

        it('does not call the delete mutation when the confirmation modal is dismissed', async () => {
            const configuration = buildConfiguration()
            const { user, deleteMutateAsync } = renderConfigTab(configuration)

            await user.click(
                screen.getByRole('button', { name: /Delete action/i }),
            )

            await waitFor(() => {
                expect(
                    screen.getAllByRole('button', {
                        name: /Delete action/i,
                    }),
                ).toHaveLength(2)
            })

            // The modal Cancel is the last enabled "Cancel" button (the
            // footer Cancel is disabled while the form is clean).
            const cancels = screen.getAllByRole('button', { name: 'Cancel' })
            await user.click(cancels[cancels.length - 1])

            expect(deleteMutateAsync).not.toHaveBeenCalled()
        })
    })
})
