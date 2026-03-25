import { screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { createDragDropManager } from 'dnd-core'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { MemoryRouter } from 'react-router-dom'

import { TicketChannel } from 'business/types/ticket'
import { useListWorkflowEntryPoints } from 'models/workflows/queries'
import type { SelfServiceChatChannel } from 'pages/automate/common/hooks/useSelfServiceChatChannels'
import useLanguagesMismatchWarnings from 'pages/automate/workflows/hooks/useLanguagesMismatchWarnings'
import { useGorgiasChatCreationWizardContext } from 'pages/integrations/integration/components/gorgias_chat/revamp/components/ChatPreviewPanel/hooks/useChatPreviewPanel'
import { useIsAutomateSettings } from 'settings/automate/hooks/useIsAutomateSettings'
import { renderWithQueryClientProvider } from 'tests/reactQueryTestingUtils'
import { DndProvider } from 'utils/wrappers/DndProvider'

import { FlowsSettings } from './FlowsSettings'
import type { Workflow, WorkflowConfiguration } from './types'

const manager = createDragDropManager(HTML5Backend, undefined, undefined)

jest.mock('pages/automate/workflows/hooks/useLanguagesMismatchWarnings')
jest.mock('settings/automate/hooks/useIsAutomateSettings')
jest.mock('models/workflows/queries', () => ({
    useListWorkflowEntryPoints: jest.fn(),
}))
jest.mock(
    'pages/integrations/integration/components/gorgias_chat/revamp/components/ChatPreviewPanel/hooks/useChatPreviewPanel',
)

const mockHistoryPush = jest.fn()
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useHistory: () => ({
        push: mockHistoryPush,
    }),
}))

const mockUseLanguagesMismatchWarnings =
    useLanguagesMismatchWarnings as jest.MockedFunction<
        typeof useLanguagesMismatchWarnings
    >

const mockUseIsAutomateSettings = useIsAutomateSettings as jest.MockedFunction<
    typeof useIsAutomateSettings
>

const mockUseListWorkflowEntryPoints =
    useListWorkflowEntryPoints as jest.MockedFunction<
        typeof useListWorkflowEntryPoints
    >

const mockUseGorgiasChatCreationWizardContext =
    useGorgiasChatCreationWizardContext as jest.MockedFunction<
        typeof useGorgiasChatCreationWizardContext
    >

const mockChannel: SelfServiceChatChannel = {
    type: TicketChannel.Chat,
    value: {
        id: 1,
        name: 'Test Chat',
        meta: {
            app_id: 'test-app-id',
            shop_name: 'test-shop',
            shop_type: 'shopify',
            language: 'en-US',
            languages: [{ language: 'en-US', primary: true }],
        },
    } as any,
}

const mockWorkflowEntrypoints = [
    { workflow_id: 'workflow-1' },
    { workflow_id: 'workflow-2' },
    { workflow_id: 'workflow-3' },
]

const mockConfigurations: WorkflowConfiguration[] = [
    { id: 'workflow-1', name: 'Order Status Flow' } as WorkflowConfiguration,
    { id: 'workflow-2', name: 'Return Request Flow' } as WorkflowConfiguration,
    { id: 'workflow-3', name: 'Shipping Info Flow' } as WorkflowConfiguration,
]

const defaultProps = {
    workflowEntrypoints: mockWorkflowEntrypoints,
    configurations: mockConfigurations,
    automationSettingsWorkflows: [] as Workflow[],
    primaryLanguage: 'en-US',
    shopName: 'test-shop',
    shopType: 'shopify',
    channelType: 'chat',
    channel: mockChannel,
    onChange: jest.fn(),
}

const renderComponent = (props: Partial<typeof defaultProps> = {}) => {
    return renderWithQueryClientProvider(
        <MemoryRouter>
            <DndProvider manager={manager}>
                <FlowsSettings {...defaultProps} {...props} />
            </DndProvider>
        </MemoryRouter>,
    )
}

describe('FlowsSettings', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockUseLanguagesMismatchWarnings.mockReturnValue({
            getLanguagesMismatchWarning: jest.fn().mockReturnValue(null),
        })
        mockUseIsAutomateSettings.mockReturnValue(false)
        mockUseListWorkflowEntryPoints.mockReturnValue({} as any)
        mockUseGorgiasChatCreationWizardContext.mockReturnValue({
            displayPage: jest.fn(),
        } as any)
    })

    describe('rendering', () => {
        it('should render the Add flow button', () => {
            renderComponent()

            expect(
                screen.getByRole('button', { name: /add flow/i }),
            ).toBeInTheDocument()
        })

        it('should render enabled workflows in the list', () => {
            renderComponent({
                automationSettingsWorkflows: [
                    { workflow_id: 'workflow-1', enabled: true },
                    { workflow_id: 'workflow-2', enabled: true },
                ],
            })

            expect(screen.getByText('Order Status Flow')).toBeInTheDocument()
            expect(screen.getByText('Return Request Flow')).toBeInTheDocument()
        })

        it('should not render disabled workflows in the list', () => {
            renderComponent({
                automationSettingsWorkflows: [
                    { workflow_id: 'workflow-1', enabled: true },
                    { workflow_id: 'workflow-2', enabled: false },
                ],
            })

            expect(screen.getByText('Order Status Flow')).toBeInTheDocument()
            expect(
                screen.queryByText('Return Request Flow'),
            ).not.toBeInTheDocument()
        })
    })

    describe('add flow dropdown', () => {
        it('should open dropdown when Add flow button is clicked', async () => {
            const user = userEvent.setup()
            renderComponent({
                automationSettingsWorkflows: [
                    { workflow_id: 'workflow-1', enabled: false },
                ],
            })

            const addButton = screen.getByRole('button', { name: /add flow/i })
            await user.click(addButton)

            await waitFor(() => {
                expect(
                    screen.getByText('Order Status Flow'),
                ).toBeInTheDocument()
            })
        })

        it('should show available (non-enabled) workflows in dropdown', async () => {
            const user = userEvent.setup()
            renderComponent({
                automationSettingsWorkflows: [
                    { workflow_id: 'workflow-1', enabled: true },
                    { workflow_id: 'workflow-2', enabled: false },
                    { workflow_id: 'workflow-3', enabled: false },
                ],
            })

            const addButton = screen.getByRole('button', { name: /add flow/i })
            await user.click(addButton)

            await waitFor(() => {
                expect(
                    screen.getByText('Return Request Flow'),
                ).toBeInTheDocument()
                expect(
                    screen.getByText('Shipping Info Flow'),
                ).toBeInTheDocument()
            })
        })

        it('should disable Add flow button when all flows are enabled', () => {
            renderComponent({
                automationSettingsWorkflows: [
                    { workflow_id: 'workflow-1', enabled: true },
                    { workflow_id: 'workflow-2', enabled: true },
                    { workflow_id: 'workflow-3', enabled: true },
                ],
            })

            const addButton = screen.getByRole('button', { name: /add flow/i })
            expect(addButton).toBeAriaDisabled()
        })

        it('should call onChange with add action when flow is selected', async () => {
            const user = userEvent.setup()
            const onChange = jest.fn()
            renderComponent({
                automationSettingsWorkflows: [
                    { workflow_id: 'workflow-1', enabled: false },
                    { workflow_id: 'workflow-2', enabled: false },
                ],
                onChange,
            })

            const addButton = screen.getByRole('button', { name: /add flow/i })
            await user.click(addButton)

            await waitFor(() => {
                expect(
                    screen.getByText('Order Status Flow'),
                ).toBeInTheDocument()
            })

            await user.click(
                screen.getByRole('menuitem', { name: 'Order Status Flow' }),
            )

            expect(onChange).toHaveBeenCalledWith(
                [{ workflow_id: 'workflow-1', enabled: true }],
                'add',
            )
        })
    })

    describe('remove flow', () => {
        it('should call onChange with remove action when flow is removed', async () => {
            const user = userEvent.setup()
            const onChange = jest.fn()
            renderComponent({
                automationSettingsWorkflows: [
                    { workflow_id: 'workflow-1', enabled: true },
                    { workflow_id: 'workflow-2', enabled: true },
                ],
                onChange,
            })

            const removeButtons = screen.getAllByRole('button', {
                name: /remove/i,
            })
            await user.click(removeButtons[0])

            expect(onChange).toHaveBeenCalledWith(
                [{ workflow_id: 'workflow-2', enabled: true }],
                'remove',
            )
        })
    })

    describe('flows limit', () => {
        it('should disable Add flow button when limit is reached', () => {
            const sixWorkflows = Array.from({ length: 6 }, (_, i) => ({
                workflow_id: `workflow-${i + 1}`,
                enabled: true,
            }))

            const sixConfigurations = Array.from({ length: 6 }, (_, i) => ({
                id: `workflow-${i + 1}`,
                name: `Flow ${i + 1}`,
            })) as WorkflowConfiguration[]

            const sixEntrypoints = Array.from({ length: 6 }, (_, i) => ({
                workflow_id: `workflow-${i + 1}`,
            }))

            renderComponent({
                automationSettingsWorkflows: sixWorkflows,
                configurations: sixConfigurations,
                workflowEntrypoints: sixEntrypoints,
            })

            const addButton = screen.getByRole('button', { name: /add flow/i })
            expect(addButton).toBeAriaDisabled()
        })

        it('should enable Add flow button when under the limit', () => {
            renderComponent({
                automationSettingsWorkflows: [
                    { workflow_id: 'workflow-1', enabled: true },
                ],
            })

            const addButton = screen.getByRole('button', { name: /add flow/i })
            expect(addButton).not.toBeAriaDisabled()
        })
    })

    describe('edit flow navigation', () => {
        it('should navigate to correct edit URL for automation page', async () => {
            const user = userEvent.setup()
            mockUseIsAutomateSettings.mockReturnValue(false)
            renderComponent({
                automationSettingsWorkflows: [
                    { workflow_id: 'workflow-1', enabled: true },
                ],
            })

            const editButton = screen.getByRole('button', {
                name: /edit order status flow/i,
            })
            await user.click(editButton)

            expect(mockHistoryPush).toHaveBeenCalledWith(
                '/app/automation/shopify/test-shop/flows/edit/workflow-1',
            )
        })

        it('should navigate to correct edit URL for settings page', async () => {
            const user = userEvent.setup()
            mockUseIsAutomateSettings.mockReturnValue(true)
            renderComponent({
                automationSettingsWorkflows: [
                    { workflow_id: 'workflow-1', enabled: true },
                ],
            })

            const editButton = screen.getByRole('button', {
                name: /edit order status flow/i,
            })
            await user.click(editButton)

            expect(mockHistoryPush).toHaveBeenCalledWith(
                '/app/settings/flows/shopify/test-shop/edit/workflow-1',
            )
        })
    })

    describe('language mismatch warnings', () => {
        it('should filter out flows with language mismatch errors from dropdown', async () => {
            const user = userEvent.setup()
            mockUseLanguagesMismatchWarnings.mockReturnValue({
                getLanguagesMismatchWarning: jest
                    .fn()
                    .mockImplementation((workflowId) => {
                        if (workflowId === 'workflow-1') {
                            return { type: 'error', message: 'Language error' }
                        }
                        return null
                    }),
            })

            renderComponent({
                automationSettingsWorkflows: [
                    { workflow_id: 'workflow-1', enabled: false },
                    { workflow_id: 'workflow-2', enabled: false },
                ],
            })

            const addButton = screen.getByRole('button', { name: /add flow/i })
            await user.click(addButton)

            await waitFor(() => {
                expect(
                    screen.queryByText('Order Status Flow'),
                ).not.toBeInTheDocument()
                expect(
                    screen.getByText('Return Request Flow'),
                ).toBeInTheDocument()
            })
        })
    })

    describe('workflow filtering', () => {
        it('should only show workflows that exist in both entrypoints and configurations', () => {
            renderComponent({
                workflowEntrypoints: [
                    { workflow_id: 'workflow-1' },
                    { workflow_id: 'workflow-missing' },
                ],
                configurations: [
                    {
                        id: 'workflow-1',
                        name: 'Order Status Flow',
                    } as WorkflowConfiguration,
                ],
                automationSettingsWorkflows: [
                    { workflow_id: 'workflow-1', enabled: true },
                    { workflow_id: 'workflow-missing', enabled: true },
                ],
            })

            expect(screen.getByText('Order Status Flow')).toBeInTheDocument()
        })
    })
})
