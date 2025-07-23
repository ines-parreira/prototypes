import React from 'react'

import { act, fireEvent, screen, waitFor } from '@testing-library/react'

import { FeatureFlagKey } from 'config/featureFlags'
import { useFlag } from 'core/flags'
import {
    nodeHelpers,
    renderVisualBuilder,
} from 'pages/automate/workflows/utils/testVisualBuilderScaffolding'

jest.mock('core/flags', () => ({
    useFlag: jest.fn(),
}))

const mockUseFlag = useFlag as jest.MockedFunction<typeof useFlag>

describe('<NodeMenu />', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        // Default mock for all other feature flags
        mockUseFlag.mockImplementation((flag, defaultValue) => {
            if (flag === FeatureFlagKey.LiquidTemplateStep) {
                return { actions: false, actionsPlatform: false, flows: false }
            }
            return defaultValue
        })
    })

    describe('LiquidTemplateMenuItem visibility', () => {
        it('should show LiquidTemplateMenuItem when flows flag is enabled', async () => {
            // Mock the flag to have flows: true
            mockUseFlag.mockImplementation((flag, defaultValue) => {
                if (flag === FeatureFlagKey.LiquidTemplateStep) {
                    return {
                        actions: false,
                        actionsPlatform: false,
                        flows: true,
                    }
                }
                return defaultValue
            })

            renderVisualBuilder({
                builderType: 'workflow',
                nodes: [
                    nodeHelpers.channelTrigger('trigger', 'trigger1'),
                    nodeHelpers.end('end', 'end1'),
                ],
                nodeEditingId: null,
            })

            // Find and click the add button to open the menu
            const addButton = document.querySelector(
                '[data-testid="rf__edge-add-button"]',
            )
            if (addButton) {
                act(() => {
                    fireEvent.click(addButton)
                })

                await waitFor(() => {
                    expect(
                        screen.getByText('Liquid template'),
                    ).toBeInTheDocument()
                    expect(
                        screen.getByText(
                            'Use Liquid templates to transform data',
                        ),
                    ).toBeInTheDocument()
                })
            }
        })

        it('should hide LiquidTemplateMenuItem when flows flag is disabled', async () => {
            // Mock the flag to have flows: false
            mockUseFlag.mockImplementation((flag, defaultValue) => {
                if (flag === FeatureFlagKey.LiquidTemplateStep) {
                    return {
                        actions: false,
                        actionsPlatform: false,
                        flows: false,
                    }
                }
                return defaultValue
            })

            renderVisualBuilder({
                builderType: 'workflow',
                nodes: [
                    nodeHelpers.channelTrigger('trigger', 'trigger1'),
                    nodeHelpers.end('end', 'end1'),
                ],
                nodeEditingId: null,
            })

            // Find and click the add button to open the menu
            const addButton = document.querySelector(
                '[data-testid="rf__edge-add-button"]',
            )
            if (addButton) {
                act(() => {
                    fireEvent.click(addButton)
                })

                await waitFor(() => {
                    // Other menu items should still be present
                    expect(
                        screen.getByText('Multiple choice'),
                    ).toBeInTheDocument()
                    expect(
                        screen.getByText('Collect text reply'),
                    ).toBeInTheDocument()

                    // But liquid template should not be visible
                    expect(
                        screen.queryByText('Liquid template'),
                    ).not.toBeInTheDocument()
                    expect(
                        screen.queryByText(
                            'Use Liquid templates to transform data',
                        ),
                    ).not.toBeInTheDocument()
                })
            }
        })

        it('should hide LiquidTemplateMenuItem when feature flag is undefined or not retrievable', async () => {
            // Mock the flag to return undefined (simulating flag not retrievable)
            mockUseFlag.mockImplementation((flag, defaultValue) => {
                if (flag === FeatureFlagKey.LiquidTemplateStep) {
                    return undefined
                }
                return defaultValue
            })

            renderVisualBuilder({
                builderType: 'workflow',
                nodes: [
                    nodeHelpers.channelTrigger('trigger', 'trigger1'),
                    nodeHelpers.end('end', 'end1'),
                ],
                nodeEditingId: null,
            })

            // Find and click the add button to open the menu
            const addButton = document.querySelector(
                '[data-testid="rf__edge-add-button"]',
            )
            if (addButton) {
                act(() => {
                    fireEvent.click(addButton)
                })

                await waitFor(() => {
                    // Other menu items should still be present
                    expect(
                        screen.getByText('Multiple choice'),
                    ).toBeInTheDocument()

                    // But liquid template should not be visible
                    expect(
                        screen.queryByText('Liquid template'),
                    ).not.toBeInTheDocument()
                    expect(
                        screen.queryByText(
                            'Use Liquid templates to transform data',
                        ),
                    ).not.toBeInTheDocument()
                })
            }
        })

        it('should hide LiquidTemplateMenuItem when feature flag object is malformed', async () => {
            // Mock the flag to return a malformed object
            mockUseFlag.mockImplementation((flag, defaultValue) => {
                if (flag === FeatureFlagKey.LiquidTemplateStep) {
                    return { actions: true } // Missing flows property
                }
                return defaultValue
            })

            renderVisualBuilder({
                builderType: 'workflow',
                nodes: [
                    nodeHelpers.channelTrigger('trigger', 'trigger1'),
                    nodeHelpers.end('end', 'end1'),
                ],
                nodeEditingId: null,
            })

            // Find and click the add button to open the menu
            const addButton = document.querySelector(
                '[data-testid="rf__edge-add-button"]',
            )
            if (addButton) {
                act(() => {
                    fireEvent.click(addButton)
                })

                await waitFor(() => {
                    // Other menu items should still be present
                    expect(
                        screen.getByText('Multiple choice'),
                    ).toBeInTheDocument()

                    // But liquid template should not be visible (flows is undefined/falsy)
                    expect(
                        screen.queryByText('Liquid template'),
                    ).not.toBeInTheDocument()
                    expect(
                        screen.queryByText(
                            'Use Liquid templates to transform data',
                        ),
                    ).not.toBeInTheDocument()
                })
            }
        })

        it('should show LiquidTemplateMenuItem only when flows is specifically true', async () => {
            // Test that actions and actionsPlatform being true don't affect the display
            mockUseFlag.mockImplementation((flag, defaultValue) => {
                if (flag === FeatureFlagKey.LiquidTemplateStep) {
                    return { actions: true, actionsPlatform: true, flows: true }
                }
                return defaultValue
            })

            renderVisualBuilder({
                builderType: 'workflow',
                nodes: [
                    nodeHelpers.channelTrigger('trigger', 'trigger1'),
                    nodeHelpers.end('end', 'end1'),
                ],
                nodeEditingId: null,
            })

            // Find and click the add button to open the menu
            const addButton = document.querySelector(
                '[data-testid="rf__edge-add-button"]',
            )
            if (addButton) {
                act(() => {
                    fireEvent.click(addButton)
                })

                await waitFor(() => {
                    expect(
                        screen.getByText('Liquid template'),
                    ).toBeInTheDocument()
                    expect(
                        screen.getByText(
                            'Use Liquid templates to transform data',
                        ),
                    ).toBeInTheDocument()
                })
            }
        })

        it('should hide LiquidTemplateMenuItem when flows is false even if other flags are true', async () => {
            // Test that only flows flag matters for the display
            mockUseFlag.mockImplementation((flag, defaultValue) => {
                if (flag === FeatureFlagKey.LiquidTemplateStep) {
                    return {
                        actions: true,
                        actionsPlatform: true,
                        flows: false,
                    }
                }
                return defaultValue
            })

            renderVisualBuilder({
                builderType: 'workflow',
                nodes: [
                    nodeHelpers.channelTrigger('trigger', 'trigger1'),
                    nodeHelpers.end('end', 'end1'),
                ],
                nodeEditingId: null,
            })

            // Find and click the add button to open the menu
            const addButton = document.querySelector(
                '[data-testid="rf__edge-add-button"]',
            )
            if (addButton) {
                act(() => {
                    fireEvent.click(addButton)
                })

                await waitFor(() => {
                    // Other menu items should still be present
                    expect(
                        screen.getByText('Multiple choice'),
                    ).toBeInTheDocument()

                    // But liquid template should not be visible
                    expect(
                        screen.queryByText('Liquid template'),
                    ).not.toBeInTheDocument()
                    expect(
                        screen.queryByText(
                            'Use Liquid templates to transform data',
                        ),
                    ).not.toBeInTheDocument()
                })
            }
        })
    })

    describe('Feature flag default behavior', () => {
        it('should call useFlag with correct parameters and default value', () => {
            renderVisualBuilder({
                builderType: 'workflow',
                nodes: [
                    nodeHelpers.channelTrigger('trigger', 'trigger1'),
                    nodeHelpers.end('end', 'end1'),
                ],
                nodeEditingId: null,
            })

            expect(mockUseFlag).toHaveBeenCalledWith(
                FeatureFlagKey.LiquidTemplateStep,
                { actions: false, actionsPlatform: false, flows: false },
            )
        })
    })
})
