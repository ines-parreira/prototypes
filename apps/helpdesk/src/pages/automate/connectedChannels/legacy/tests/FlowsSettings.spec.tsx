/* eslint-disable @typescript-eslint/no-unsafe-return */
import React from 'react'

import { fireEvent, screen, waitFor } from '@testing-library/react'
import { createDragDropManager } from 'dnd-core'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { act } from 'react-dom/test-utils'
import { MemoryRouter } from 'react-router-dom'

import useLanguagesMismatchWarnings from 'pages/automate/workflows/hooks/useLanguagesMismatchWarnings'
import { renderWithQueryClientProvider } from 'tests/reactQueryTestingUtils'
import { DndProvider } from 'utils/wrappers/DndProvider'

import { FlowsSettings } from '../components/FlowsSettings'

const manager = createDragDropManager(HTML5Backend, undefined, undefined)
jest.mock('pages/automate/workflows/hooks/useLanguagesMismatchWarnings')

const mockUseLanguagesMismatchWarnings =
    useLanguagesMismatchWarnings as jest.MockedFunction<
        typeof useLanguagesMismatchWarnings
    >

const channelMock = {
    type: 'chat',
    value: {
        deleted_datetime: null,
        meta: {
            shop_type: 'shopify',
            wizard: {
                installation_method: 'manual',
                status: 'published',
                step: 'installation',
            },
            shop_integration_id: 8,
            shop_name: 'itay-store-two',
            shopify_integration_ids: [],
            preferences: {
                email_capture_enforcement: 'optional',
                hide_on_mobile: false,
                email_capture_enabled: true,
                send_chat_transcript: true,
                hide_outside_business_hours: false,
                control_ticket_volume: false,
                live_chat_availability: 'auto-based-on-agent-availability',
                auto_responder: {
                    enabled: true,
                    reply: 'reply-dynamic',
                },
                privacy_policy_disclaimer_enabled: false,
                display_campaigns_hidden_chat: false,
                offline_mode_enabled_datetime: null,
            },
            language: 'en-US',
            app_id: '25',
            languages: [
                {
                    language: 'en-US',
                    primary: true,
                },
            ],
        },
        http: null,
        deactivated_datetime: null,
        application_id: null,
        name: '[E2E] 24/06/17_10:45:16 local chro 00',
        uri: '/api/integrations/15/',
        decoration: {
            avatar_type: 'team-members',
            launcher: {
                type: 'icon',
            },
            background_color_style: 'gradient',
            conversation_color: '#115cb5',
            position: {
                alignment: 'bottom-right',
                offsetX: 0,
                offsetY: 0,
            },
            introduction_text: 'How can we help?',
            offline_introduction_text: 'We will be back soon',
            avatar: {
                image_type: 'agent-picture',
                name_type: 'agent-first-name',
            },
            main_color: '#115cb5',
        },
        locked_datetime: null,
        created_datetime: '2024-06-17T10:45:34.203519+00:00',
        type: 'gorgias_chat',
        id: 15,
        description: null,
        updated_datetime: '2024-07-12T12:44:21.004402+00:00',
        managed: false,
    },
}

describe('FlowsSettings', () => {
    beforeEach(() => {
        mockUseLanguagesMismatchWarnings.mockReturnValue({
            getLanguagesMismatchWarning: jest.fn(),
        })
    })

    test('renders the component with all props', () => {
        renderWithQueryClientProvider(
            <MemoryRouter>
                <DndProvider manager={manager}>
                    <FlowsSettings
                        channelType="chat"
                        channel={channelMock as any}
                        shopType="shopify"
                        shopName="Shop Name"
                        workflowEntrypoints={[
                            {
                                workflow_id: '1',
                            },
                            {
                                workflow_id: '2',
                            },
                        ]}
                        primaryLanguage="en"
                        configurations={[
                            {
                                id: '1',
                                name: 'Flow 1',
                            } as any,
                            {
                                id: '2',
                                name: 'Flow 2',
                            },
                        ]}
                        automationSettingsWorkflows={[
                            {
                                workflow_id: '1',
                                enabled: true,
                            },
                            {
                                workflow_id: '2',
                                enabled: true,
                            },
                        ]}
                        onChange={jest.fn()}
                    />
                </DndProvider>
            </MemoryRouter>,
        )

        expect(screen.getByText('Flow 1')).toBeInTheDocument()
    })

    it('updates the state when a flow is dragged', () => {
        renderWithQueryClientProvider(
            <MemoryRouter>
                <DndProvider manager={manager}>
                    <FlowsSettings
                        channelType="chat"
                        shopType="shopify"
                        shopName="Shop Name"
                        channel={channelMock as any}
                        workflowEntrypoints={[
                            {
                                workflow_id: '1',
                            },
                            {
                                workflow_id: '2',
                            },
                        ]}
                        primaryLanguage="en"
                        configurations={[
                            {
                                id: '1',
                                name: 'Flow 1',
                            } as any,
                            {
                                id: '2',
                                name: 'Flow 2',
                            },
                        ]}
                        automationSettingsWorkflows={[
                            {
                                workflow_id: '1',
                                enabled: true,
                            },
                            {
                                workflow_id: '2',
                                enabled: true,
                            },
                        ]}
                        onChange={jest.fn()}
                    />
                </DndProvider>
            </MemoryRouter>,
        )

        // role of "i"
        const flow1 = screen.getByText(/Flow 1/i)
        const flow2 = screen.getByText(/Flow 2/i)

        expect(flow1).toBeInTheDocument()
        expect(flow2).toBeInTheDocument()
    })

    it('filters when search query is entered', async () => {
        renderWithQueryClientProvider(
            <MemoryRouter>
                <DndProvider manager={manager}>
                    <FlowsSettings
                        channelType="chat"
                        shopType="shopify"
                        shopName="Shop Name"
                        channel={channelMock as any}
                        workflowEntrypoints={[
                            {
                                workflow_id: '1',
                            },
                            {
                                workflow_id: '2',
                            },
                        ]}
                        primaryLanguage="en"
                        configurations={[
                            {
                                id: '1',
                                name: 'Flow 1',
                            } as any,
                            {
                                id: '2',
                                name: 'Flow 2',
                            },
                        ]}
                        automationSettingsWorkflows={[
                            {
                                workflow_id: '1',
                                enabled: false,
                            },
                            {
                                workflow_id: '2',
                                enabled: false,
                            },
                        ]}
                        onChange={jest.fn()}
                    />
                </DndProvider>
            </MemoryRouter>,
        )

        // open dropdown
        const addFlowButton = screen.getByRole('button', { name: /add flow/i })
        fireEvent.click(addFlowButton)
        const searchInput = screen.getByPlaceholderText(/Search flows/i)
        fireEvent.change(searchInput, { target: { value: 'Flow 1' } })
        await waitFor(
            () => {
                expect(screen.getByText('Flow 1')).toBeInTheDocument()
                expect(screen.queryByText('Flow 2')).toBeNull()
            },
            { timeout: 1000 },
        )
    })

    it('should render the correct number of enabled workflows', () => {
        renderWithQueryClientProvider(
            <MemoryRouter>
                <DndProvider manager={manager}>
                    <FlowsSettings
                        channelType="chat"
                        channel={channelMock as any}
                        shopType="shopify"
                        shopName="Shop Name"
                        workflowEntrypoints={[
                            { workflow_id: '1' },
                            { workflow_id: '2' },
                            { workflow_id: '3' },
                        ]}
                        primaryLanguage="en"
                        configurations={[
                            { id: '1', name: 'Flow 1' } as any,
                            { id: '2', name: 'Flow 2' } as any,
                            { id: '3', name: 'Flow 3' } as any,
                        ]}
                        automationSettingsWorkflows={[
                            { workflow_id: '1', enabled: true },
                            { workflow_id: '2', enabled: true },
                            { workflow_id: '3', enabled: false },
                        ]}
                        onChange={jest.fn()}
                    />
                </DndProvider>
            </MemoryRouter>,
        )

        expect(screen.getByText('Flow 1')).toBeInTheDocument()
        expect(screen.getByText('Flow 2')).toBeInTheDocument()
        expect(screen.queryByText('Flow 3')).toBeNull()
    })

    it('should open and close the dropdown when the add flow button is clicked', () => {
        renderWithQueryClientProvider(
            <MemoryRouter>
                <DndProvider manager={manager}>
                    <FlowsSettings
                        channelType="chat"
                        channel={channelMock as any}
                        shopType="shopify"
                        shopName="Shop Name"
                        workflowEntrypoints={[
                            { workflow_id: '1' },
                            { workflow_id: '2' },
                        ]}
                        primaryLanguage="en"
                        configurations={[
                            { id: '1', name: 'Flow 1' } as any,
                            { id: '2', name: 'Flow 2' } as any,
                        ]}
                        automationSettingsWorkflows={[
                            { workflow_id: '1', enabled: true },
                            { workflow_id: '2', enabled: true },
                        ]}
                        onChange={jest.fn()}
                    />
                </DndProvider>
            </MemoryRouter>,
        )

        const addFlowButton = screen.getByRole('button', { name: /add flow/i })
        fireEvent.click(addFlowButton)
        expect(screen.getByPlaceholderText(/Search Flows/i)).toBeInTheDocument()

        fireEvent.click(addFlowButton)
        expect(screen.queryByPlaceholderText(/Search Flows/i)).toBeNull()
    })

    it('should show the correct tooltip message when the add flow button is disabled', async () => {
        renderWithQueryClientProvider(
            <MemoryRouter>
                <DndProvider manager={manager}>
                    <FlowsSettings
                        channelType="chat"
                        channel={channelMock as any}
                        shopType="shopify"
                        shopName="Shop Name"
                        workflowEntrypoints={[
                            { workflow_id: '1' },
                            { workflow_id: '2' },
                            { workflow_id: '3' },
                            { workflow_id: '4' },
                            { workflow_id: '5' },
                            { workflow_id: '6' },
                        ]}
                        primaryLanguage="en"
                        configurations={[
                            { id: '1', name: 'Flow 1' } as any,
                            { id: '2', name: 'Flow 2' } as any,
                            { id: '3', name: 'Flow 3' } as any,
                            { id: '4', name: 'Flow 4' } as any,
                            { id: '5', name: 'Flow 5' } as any,
                            { id: '6', name: 'Flow 6' } as any,
                        ]}
                        automationSettingsWorkflows={[
                            { workflow_id: '1', enabled: true },
                            { workflow_id: '2', enabled: true },
                            { workflow_id: '3', enabled: true },
                            { workflow_id: '4', enabled: true },
                            { workflow_id: '5', enabled: true },
                            { workflow_id: '6', enabled: true },
                        ]}
                        onChange={jest.fn()}
                    />
                </DndProvider>
            </MemoryRouter>,
        )

        const addFlowButton = screen.getByRole('button', { name: /add flow/i })
        expect(addFlowButton).toBeAriaDisabled()

        fireEvent.mouseEnter(addFlowButton)

        waitFor(() => {
            expect(
                screen.getByText(
                    /You’ve reached the maximum number of Flows to display on this channel./i,
                ),
            ).toBeInTheDocument()
        })
    })

    it('should call onChange when a flow is selected', () => {
        const onChange = jest.fn()
        renderWithQueryClientProvider(
            <MemoryRouter>
                <DndProvider manager={manager}>
                    <FlowsSettings
                        channelType="chat"
                        channel={channelMock as any}
                        shopType="shopify"
                        shopName="Shop Name"
                        workflowEntrypoints={[
                            {
                                workflow_id: '1',
                            },
                            {
                                workflow_id: '2',
                            },
                        ]}
                        primaryLanguage="en"
                        configurations={[
                            {
                                id: '1',
                                name: 'Flow 1',
                            } as any,
                            {
                                id: '2',
                                name: 'Flow 2',
                            },
                        ]}
                        automationSettingsWorkflows={[
                            {
                                workflow_id: '1',
                                enabled: false,
                            },
                            {
                                workflow_id: '2',
                                enabled: false,
                            },
                        ]}
                        onChange={onChange}
                    />
                </DndProvider>
            </MemoryRouter>,
        )

        // open dropdown
        const addFlowButton = screen.getByRole('button', { name: /add flow/i })
        fireEvent.click(addFlowButton)
        const flow1 = screen.getByText(/Flow 1/i)
        fireEvent.click(flow1)
        expect(onChange).toHaveBeenCalledWith(
            [
                {
                    workflow_id: '1',
                    enabled: true,
                },
            ],
            'add',
        )
    })

    it('calls onChange whenever flow is deleted', () => {
        const onChange = jest.fn()
        renderWithQueryClientProvider(
            <MemoryRouter>
                <DndProvider manager={manager}>
                    <FlowsSettings
                        channelType="chat"
                        channel={channelMock as any}
                        shopType="shopify"
                        shopName="Shop Name"
                        workflowEntrypoints={[
                            {
                                workflow_id: '1',
                            },
                            {
                                workflow_id: '2',
                            },
                        ]}
                        primaryLanguage="en"
                        configurations={[
                            {
                                id: '1',
                                name: 'Flow 1',
                            } as any,
                            {
                                id: '2',
                                name: 'Flow 2',
                            },
                        ]}
                        automationSettingsWorkflows={[
                            {
                                workflow_id: '1',
                                enabled: true,
                            },
                            {
                                workflow_id: '2',
                                enabled: false,
                            },
                        ]}
                        onChange={onChange}
                    />
                </DndProvider>
            </MemoryRouter>,
        )
        const closeButton = screen.getAllByRole('button', { name: /close/i })[0]
        closeButton.click()
        expect(onChange).toHaveBeenCalledWith([], 'remove')
    })

    it('should disable the add flow button when limit is reached', async () => {
        renderWithQueryClientProvider(
            <MemoryRouter>
                <DndProvider manager={manager}>
                    <FlowsSettings
                        channelType="chat"
                        channel={channelMock as any}
                        shopType="shopify"
                        shopName="Shop Name"
                        workflowEntrypoints={[
                            {
                                workflow_id: '1',
                            },
                            {
                                workflow_id: '2',
                            },
                            {
                                workflow_id: '3',
                            },
                            {
                                workflow_id: '4',
                            },
                            {
                                workflow_id: '5',
                            },
                            {
                                workflow_id: '6',
                            },
                        ]}
                        primaryLanguage="en"
                        configurations={[
                            {
                                id: '1',
                                name: 'Flow 1',
                            } as any,
                            {
                                id: '2',
                                name: 'Flow 2',
                            },
                            {
                                id: '3',
                                name: 'Flow 3',
                            },
                            {
                                id: '4',
                                name: 'Flow 4',
                            },
                            {
                                id: '5',
                                name: 'Flow 5',
                            },
                            {
                                id: '6',
                                name: 'Flow 6',
                            },
                        ]}
                        automationSettingsWorkflows={[
                            {
                                workflow_id: '1',
                                enabled: true,
                            },
                            {
                                workflow_id: '2',
                                enabled: true,
                            },
                            {
                                workflow_id: '3',
                                enabled: true,
                            },
                            {
                                workflow_id: '4',
                                enabled: true,
                            },
                            {
                                workflow_id: '5',
                                enabled: true,
                            },
                            {
                                workflow_id: '6',
                                enabled: true,
                            },
                        ]}
                        onChange={jest.fn()}
                    />
                </DndProvider>
            </MemoryRouter>,
        )

        const addFlowButton = screen.getByRole('button', { name: /add flow/i })
        expect(addFlowButton).toBeAriaDisabled()

        await act(async () => {
            fireEvent.mouseEnter(addFlowButton)
        })

        waitFor(() => {
            expect(
                screen.getByText(
                    /reached the maximum number of Flows to display on this channel/i,
                ),
            ).toBeInTheDocument()
        })
    })

    it('Should render text based on the quick response sunset flag if true', () => {
        const { getByText } = renderWithQueryClientProvider(
            <MemoryRouter>
                <DndProvider manager={manager}>
                    <FlowsSettings
                        channelType="chat"
                        shopType="shopify"
                        channel={channelMock as any}
                        shopName="Shop Name"
                        workflowEntrypoints={[
                            {
                                workflow_id: '1',
                            },
                            {
                                workflow_id: '2',
                            },
                        ]}
                        primaryLanguage="en"
                        configurations={[
                            {
                                id: '1',
                                name: 'Flow 1',
                            } as any,
                            {
                                id: '2',
                                name: 'Flow 2',
                            },
                        ]}
                        automationSettingsWorkflows={[
                            {
                                workflow_id: '1',
                                enabled: false,
                            },
                            {
                                workflow_id: '2',
                                enabled: false,
                            },
                        ]}
                        onChange={jest.fn()}
                    />
                </DndProvider>
            </MemoryRouter>,
        )
        expect(
            getByText(
                `Display up to 6 Flows on your Chat to proactively resolve top customer requests.`,
            ),
        ).toBeInTheDocument()
    })

    it('should should show warning when there is a language mismatch', () => {
        mockUseLanguagesMismatchWarnings.mockReturnValue({
            getLanguagesMismatchWarning: jest.fn().mockReturnValue({
                message: 'Language mismatch',
                type: 'warning',
            }),
        })

        renderWithQueryClientProvider(
            <MemoryRouter>
                <DndProvider manager={manager}>
                    <FlowsSettings
                        channelType="chat"
                        channel={channelMock as any}
                        shopType="shopify"
                        shopName="Shop Name"
                        workflowEntrypoints={[
                            {
                                workflow_id: '1',
                            },
                            {
                                workflow_id: '2',
                            },
                        ]}
                        primaryLanguage="en"
                        configurations={[
                            {
                                id: '1',
                                name: 'Flow 1',
                            } as any,
                            {
                                id: '2',
                                name: 'Flow 2',
                            },
                        ]}
                        automationSettingsWorkflows={[
                            {
                                workflow_id: '1',
                                enabled: true,
                            },
                            {
                                workflow_id: '2',
                                enabled: true,
                            },
                        ]}
                        onChange={jest.fn()}
                    />
                </DndProvider>
            </MemoryRouter>,
        )

        expect(screen.getAllByText('warning')).toHaveLength(2)
    })

    it('should show warning on one flow only when there is a language mismatch', () => {
        mockUseLanguagesMismatchWarnings.mockReturnValue({
            getLanguagesMismatchWarning: jest.fn().mockReturnValue({
                message: 'Language mismatch',
                type: 'warning',
            }),
        })
        renderWithQueryClientProvider(
            <MemoryRouter>
                <DndProvider manager={manager}>
                    <FlowsSettings
                        channelType="chat"
                        channel={channelMock as any}
                        shopType="shopify"
                        shopName="Shop Name"
                        workflowEntrypoints={[
                            {
                                workflow_id: '1',
                            },
                            {
                                workflow_id: '2',
                            },
                        ]}
                        primaryLanguage="en"
                        configurations={[
                            {
                                id: '1',
                                name: 'Flow 1',
                            } as any,
                            {
                                id: '2',
                                name: 'Flow 2',
                            },
                        ]}
                        automationSettingsWorkflows={[
                            {
                                workflow_id: '1',
                                enabled: true,
                            },
                            {
                                workflow_id: '2',
                                enabled: false,
                            },
                        ]}
                        onChange={jest.fn()}
                    />
                </DndProvider>
            </MemoryRouter>,
        )
        expect(screen.getAllByText('warning')).toHaveLength(1)
    })

    it('should not show flows in the dropdown there is a language mismatch with error type', () => {
        mockUseLanguagesMismatchWarnings.mockReturnValue({
            getLanguagesMismatchWarning: jest.fn().mockReturnValue({
                message: 'Language mismatch',
                type: 'error',
            }),
        })

        renderWithQueryClientProvider(
            <MemoryRouter>
                <DndProvider manager={manager}>
                    <FlowsSettings
                        channelType="chat"
                        channel={channelMock as any}
                        shopType="shopify"
                        shopName="Shop Name"
                        workflowEntrypoints={[
                            {
                                workflow_id: '1',
                            },
                            {
                                workflow_id: '2',
                            },
                        ]}
                        primaryLanguage="en"
                        configurations={[
                            {
                                id: '1',
                                name: 'Flow 1',
                            } as any,
                            {
                                id: '2',
                                name: 'Flow 2',
                            },
                        ]}
                        automationSettingsWorkflows={[
                            {
                                workflow_id: '1',
                                enabled: false,
                            },
                            {
                                workflow_id: '2',
                                enabled: false,
                            },
                        ]}
                        onChange={jest.fn()}
                    />
                </DndProvider>
            </MemoryRouter>,
        )

        const addFlowButton = screen.getByRole('button', { name: /add flow/i })
        fireEvent.click(addFlowButton)
        expect(screen.queryByText('Flow 1')).toBeNull()
        expect(screen.queryByText('Flow 2')).toBeNull()
    })
})
