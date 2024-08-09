/* eslint-disable @typescript-eslint/no-unsafe-return */
import React from 'react'
import {fireEvent, screen, waitFor} from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect'
import {createDragDropManager} from 'dnd-core'
import {HTML5Backend} from 'react-dnd-html5-backend'
import {DndProvider} from 'react-dnd'
import {act} from 'react-dom/test-utils'
import {useFlags} from 'launchdarkly-react-client-sdk'
import {renderWithQueryClientProvider} from 'tests/reactQueryTestingUtils'
import {FeatureFlagKey} from 'config/featureFlags'
import {FlowsSettings} from '../components/FlowsSettings'

const manager = createDragDropManager(HTML5Backend, undefined, undefined)
jest.mock('launchdarkly-react-client-sdk')
const mockUseFlags = useFlags as jest.MockedFunction<typeof useFlags>
describe('FeatureSettings', () => {
    test('renders the component with all props', () => {
        renderWithQueryClientProvider(
            <DndProvider manager={manager}>
                <FlowsSettings
                    channelType="chat"
                    shopType="shopify"
                    shopName="Shop Name"
                    enabledQuickResponses={0}
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
        )

        expect(screen.getByText('Flow 1')).toBeInTheDocument()
    })

    it('updates the state when a flow is dragged', () => {
        renderWithQueryClientProvider(
            <DndProvider manager={manager}>
                <FlowsSettings
                    channelType="chat"
                    shopType="shopify"
                    shopName="Shop Name"
                    enabledQuickResponses={0}
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
        )

        // role of "i"
        const flow1 = screen.getByText(/Flow 1/i)
        const flow2 = screen.getByText(/Flow 2/i)

        expect(flow1).toBeInTheDocument()
        expect(flow2).toBeInTheDocument()

        const spy = jest.spyOn(React, 'useState')
        expect(spy).not.toHaveBeenCalled()
        fireEvent.dragStart(flow1)
        fireEvent.dragEnter(flow2)
        fireEvent.dragEnd(flow2)
        expect(spy).toHaveBeenCalled()
    })

    it('filters when search query is entered', async () => {
        renderWithQueryClientProvider(
            <DndProvider manager={manager}>
                <FlowsSettings
                    channelType="chat"
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
        )

        // open dropdown
        const addFlowButton = screen.getByRole('button', {name: /add flow/i})
        fireEvent.click(addFlowButton)
        const searchInput = screen.getByPlaceholderText(/Search flows/i)
        fireEvent.change(searchInput, {target: {value: 'Flow 1'}})
        await act(async () => {
            await waitFor(
                () => {
                    expect(screen.getByText('Flow 1')).toBeInTheDocument()
                    expect(screen.queryByText('Flow 2')).toBeNull()
                },
                {timeout: 1000}
            )
        })
    })

    it('should call onChange when a flow is selected', () => {
        const onChange = jest.fn()
        renderWithQueryClientProvider(
            <DndProvider manager={manager}>
                <FlowsSettings
                    channelType="chat"
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
        )

        // open dropdown
        const addFlowButton = screen.getByRole('button', {name: /add flow/i})
        fireEvent.click(addFlowButton)
        const flow1 = screen.getByText(/Flow 1/i)
        fireEvent.click(flow1)
        expect(onChange).toHaveBeenCalledWith([
            {
                workflow_id: '1',
                enabled: true,
            },
        ])
    })

    it('calls onChange whenever flow is deleted', () => {
        const onChange = jest.fn()
        renderWithQueryClientProvider(
            <DndProvider manager={manager}>
                <FlowsSettings
                    channelType="chat"
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
        )
        const closeButton = screen.getAllByRole('button', {name: /close/i})[0]
        closeButton.click()
        expect(onChange).toHaveBeenCalledWith([])
    })

    it('should disable the add flow button when limit is reached', async () => {
        renderWithQueryClientProvider(
            <DndProvider manager={manager}>
                <FlowsSettings
                    channelType="chat"
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
        )

        const addFlowButton = screen.getByRole('button', {name: /add flow/i})
        expect(addFlowButton).toHaveAttribute('aria-disabled', 'true')

        await act(async () => {
            fireEvent.mouseEnter(addFlowButton)
            await waitFor(() => {
                expect(
                    screen.getByText(
                        /reached the maximum number of Quick Responses and Flows to display on this channel/i
                    )
                ).toBeInTheDocument()
            })
        })
    })

    it.each([[true], [false]])(
        'Should render text based on the quick response sunset flag if true',
        (flag) => {
            mockUseFlags.mockReturnValue({
                [FeatureFlagKey.SunsetQuickResponses]: flag,
            })
            const {getByText, queryByText} = renderWithQueryClientProvider(
                <DndProvider manager={manager}>
                    <FlowsSettings
                        channelType="chat"
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
            )
            if (flag) {
                expect(
                    getByText(
                        `Display up to 6 Flows on your Chat to proactively resolve top customer requests.`
                    )
                ).toBeInTheDocument()
            } else {
                expect(
                    queryByText(
                        `Display up to 6 Flows on your Chat to proactively resolve top customer requests.`
                    )
                ).not.toBeInTheDocument()
            }
        }
    )

    it('should take into account the enabledQuickResponses prop and disable the add-flow button', () => {
        renderWithQueryClientProvider(
            <DndProvider manager={manager}>
                <FlowsSettings
                    channelType="chat"
                    shopType="shopify"
                    shopName="Shop Name"
                    enabledQuickResponses={3}
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
                    ]}
                    onChange={jest.fn()}
                />
            </DndProvider>
        )

        const addFlowButton = screen.getByRole('button', {name: /add flow/i})
        expect(addFlowButton).toHaveAttribute('aria-disabled', 'true')
    })
})
