import React from 'react'

import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { IntegrationType } from '../../../../models/integration/constants'
import { StoreIntegration } from '../../../../models/integration/types'
import StoreSelector from './StoreSelector'

const mockShopifyIntegration = {
    id: 1,
    name: 'Shopify Store',
    type: IntegrationType.Shopify,
} as StoreIntegration

const mockBigCommerceIntegration = {
    id: 2,
    name: 'BigCommerce Store',
    type: IntegrationType.BigCommerce,
} as StoreIntegration

const mockIntegrations = [mockShopifyIntegration, mockBigCommerceIntegration]

describe('StoreSelector', () => {
    const mockOnChange = jest.fn()

    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('basic functionality', () => {
        it('renders with selected store', () => {
            render(
                <StoreSelector
                    integrations={mockIntegrations}
                    selected={mockShopifyIntegration}
                    onChange={mockOnChange}
                />,
            )

            expect(screen.getByRole('button')).toBeInTheDocument()
            expect(screen.getByText('Shopify Store')).toBeInTheDocument()
        })

        it('returns null when integrations array is empty', () => {
            const { container } = render(
                <StoreSelector
                    integrations={[]}
                    selected={undefined}
                    onChange={mockOnChange}
                />,
            )

            expect(container.firstChild).toBeNull()
        })

        it('renders "Select a store" when selected is undefined', () => {
            render(
                <StoreSelector
                    integrations={mockIntegrations}
                    selected={undefined}
                    onChange={mockOnChange}
                />,
            )

            expect(screen.getByRole('button')).toBeInTheDocument()
            expect(screen.getByText('Select a store')).toBeInTheDocument()
        })

        it('renders "All Stores" when selected is null', () => {
            render(
                <StoreSelector
                    integrations={mockIntegrations}
                    selected={null}
                    onChange={mockOnChange}
                    withAllOption
                />,
            )

            expect(screen.getByRole('button')).toBeInTheDocument()
            expect(screen.getByText('All Stores')).toBeInTheDocument()
        })

        it('displays empty string when integration name is not available', () => {
            const integrationWithoutName = {
                id: 3,
                name: '',
                type: IntegrationType.Shopify,
            } as StoreIntegration

            const { container } = render(
                <StoreSelector
                    integrations={[integrationWithoutName]}
                    selected={integrationWithoutName}
                    onChange={mockOnChange}
                    singleStoreInline
                />,
            )

            // With single integration and singleStoreInline=true,
            // it renders as inline element
            expect(screen.queryByRole('button')).not.toBeInTheDocument()

            // Should have inline container with empty store name
            const inlineContainer = container.querySelector(
                '.inlineStoreContainer',
            )
            expect(inlineContainer).toBeInTheDocument()

            // Store name span should exist but be empty
            const storeName = container.querySelector('.inlineStoreName')
            expect(storeName).toBeInTheDocument()
            expect(storeName?.textContent).toBe('')
        })
    })

    describe('dropdown interactions', () => {
        it('opens dropdown when button is clicked', async () => {
            const user = userEvent.setup()

            render(
                <StoreSelector
                    integrations={mockIntegrations}
                    selected={mockShopifyIntegration}
                    onChange={mockOnChange}
                />,
            )

            const button = screen.getByRole('button')

            await act(() => user.click(button))

            await waitFor(() => {
                const options = screen.getAllByRole('option')
                expect(options).toHaveLength(2)
                expect(options[0]).toHaveTextContent('Shopify Store')
                expect(options[1]).toHaveTextContent('BigCommerce Store')
            })
        })

        it('calls onChange when store is selected', async () => {
            const user = userEvent.setup()

            render(
                <StoreSelector
                    integrations={mockIntegrations}
                    selected={mockShopifyIntegration}
                    onChange={mockOnChange}
                />,
            )

            const button = screen.getByRole('button')

            await act(() => user.click(button))

            const options = screen.getAllByRole('option')
            const bigCommerceOption = options.find((option) =>
                option.textContent?.includes('BigCommerce Store'),
            )

            await act(() => user.click(bigCommerceOption!))

            await waitFor(() => {
                expect(mockOnChange).toHaveBeenCalledWith(2)
            })
        })

        it('toggles dropdown when button is clicked multiple times', async () => {
            const user = userEvent.setup()

            render(
                <StoreSelector
                    integrations={mockIntegrations}
                    selected={mockShopifyIntegration}
                    onChange={mockOnChange}
                />,
            )

            const button = screen.getByRole('button')

            await act(() => user.click(button))
            await waitFor(() => {
                expect(screen.getAllByRole('option')).toHaveLength(2)
            })

            await act(() => user.click(button))
            await waitFor(() => {
                expect(screen.queryAllByRole('option')).toHaveLength(0)
            })
        })
    })

    describe('with all option', () => {
        it('displays "All Stores" option when withAllOption is true', async () => {
            const user = userEvent.setup()

            render(
                <StoreSelector
                    integrations={mockIntegrations}
                    selected={mockShopifyIntegration}
                    onChange={mockOnChange}
                    withAllOption
                />,
            )

            const button = screen.getByRole('button')

            await act(() => user.click(button))
            await waitFor(() => {
                const options = screen.getAllByRole('option')
                expect(options).toHaveLength(3) // All Stores + 2 integrations
                expect(options[0]).toHaveTextContent('All Stores')
            })
        })

        it('calls onChange with null when "All Stores" is selected', async () => {
            const user = userEvent.setup()

            render(
                <StoreSelector
                    integrations={mockIntegrations}
                    selected={mockShopifyIntegration}
                    onChange={mockOnChange}
                    withAllOption
                />,
            )

            const button = screen.getByRole('button')

            await act(() => user.click(button))

            const options = screen.getAllByRole('option')
            const allStoresOption = options.find((option) =>
                option.textContent?.includes('All Stores'),
            )

            await act(() => user.click(allStoresOption!))
            await waitFor(() => {
                expect(mockOnChange).toHaveBeenCalledWith(null)
            })
        })

        it('does not display "All Stores" option when withAllOption is false', async () => {
            const user = userEvent.setup()

            render(
                <StoreSelector
                    integrations={mockIntegrations}
                    selected={mockShopifyIntegration}
                    onChange={mockOnChange}
                    withAllOption={false}
                />,
            )

            const button = screen.getByRole('button')

            await act(() => user.click(button))
            await waitFor(() => {
                const options = screen.getAllByRole('option')
                expect(options).toHaveLength(2) // Only 2 integrations, no "All Stores"

                const hasAllStoresOption = options.some((option) =>
                    option.textContent?.includes('All Stores'),
                )
                expect(hasAllStoresOption).toBe(false)
            })
        })
    })

    describe('with search', () => {
        it('displays search input when withSearch is true', async () => {
            const user = userEvent.setup()

            render(
                <StoreSelector
                    integrations={mockIntegrations}
                    selected={mockShopifyIntegration}
                    onChange={mockOnChange}
                    withSearch
                />,
            )

            const button = screen.getByRole('button')
            await act(() => user.click(button))

            await waitFor(() => {
                expect(screen.getByRole('textbox')).toBeInTheDocument()
            })
        })

        it('does not display search input when withSearch is false', async () => {
            const user = userEvent.setup()

            render(
                <StoreSelector
                    integrations={mockIntegrations}
                    selected={mockShopifyIntegration}
                    onChange={mockOnChange}
                    withSearch={false}
                />,
            )

            const button = screen.getByRole('button')
            await act(() => user.click(button))

            await waitFor(() => {
                expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
            })
        })
    })

    describe('shouldShowActiveStatus prop', () => {
        const mockShowActiveStatus = jest.fn()

        beforeEach(() => {
            mockShowActiveStatus.mockClear()
        })

        it('displays status indicator for selected store when active', () => {
            mockShowActiveStatus.mockReturnValue(true)

            render(
                <StoreSelector
                    integrations={mockIntegrations}
                    selected={mockShopifyIntegration}
                    onChange={mockOnChange}
                    shouldShowActiveStatus={mockShowActiveStatus}
                />,
            )

            const statusIndicator = screen.getByAltText('status')
            expect(statusIndicator).toBeInTheDocument()
            expect(mockShowActiveStatus).toHaveBeenCalledWith(
                mockShopifyIntegration,
            )
        })

        it('displays neutral status indicator for selected store when inactive', () => {
            mockShowActiveStatus.mockReturnValue(false)

            render(
                <StoreSelector
                    integrations={mockIntegrations}
                    selected={mockShopifyIntegration}
                    onChange={mockOnChange}
                    shouldShowActiveStatus={mockShowActiveStatus}
                />,
            )

            const statusIndicator = screen.getByAltText('status')
            expect(statusIndicator).toBeInTheDocument()
            expect(mockShowActiveStatus).toHaveBeenCalledWith(
                mockShopifyIntegration,
            )
        })

        it('does not display status indicator when shouldShowActiveStatus returns undefined', () => {
            mockShowActiveStatus.mockReturnValue(undefined)

            render(
                <StoreSelector
                    integrations={mockIntegrations}
                    selected={mockShopifyIntegration}
                    onChange={mockOnChange}
                    shouldShowActiveStatus={mockShowActiveStatus}
                />,
            )

            expect(screen.queryByAltText('status')).not.toBeInTheDocument()
        })

        it('does not display status indicator when shouldShowActiveStatus is not provided', () => {
            render(
                <StoreSelector
                    integrations={mockIntegrations}
                    selected={mockShopifyIntegration}
                    onChange={mockOnChange}
                />,
            )

            expect(screen.queryByAltText('status')).not.toBeInTheDocument()
        })

        it('displays status indicators in dropdown for each store', async () => {
            const user = userEvent.setup()
            mockShowActiveStatus.mockImplementation((integration) => {
                return integration.id === 1 // Shopify is active, BigCommerce is not
            })

            render(
                <StoreSelector
                    integrations={mockIntegrations}
                    selected={mockShopifyIntegration}
                    onChange={mockOnChange}
                    shouldShowActiveStatus={mockShowActiveStatus}
                />,
            )

            const button = screen.getByRole('button')
            await act(() => user.click(button))

            await waitFor(() => {
                const statusIndicators = screen.getAllByAltText('status')
                expect(statusIndicators).toHaveLength(3) // 1 in button, 2 in dropdown

                expect(mockShowActiveStatus).toHaveBeenCalledWith(
                    mockShopifyIntegration,
                )
                expect(mockShowActiveStatus).toHaveBeenCalledWith(
                    mockBigCommerceIntegration,
                )

                statusIndicators.forEach((indicator) => {
                    expect(indicator).toBeInTheDocument()
                })
            })
        })

        it('does not display status indicators when shouldShowActiveStatus is not provided', async () => {
            const user = userEvent.setup()

            render(
                <StoreSelector
                    integrations={mockIntegrations}
                    selected={mockShopifyIntegration}
                    onChange={mockOnChange}
                />,
            )

            const button = screen.getByRole('button')
            await act(() => user.click(button))

            await waitFor(() => {
                expect(screen.queryAllByAltText('status')).toHaveLength(0)
            })
        })
    })

    describe('fullWidth prop', () => {
        it('applies fullWidth styles when fullWidth is true', () => {
            const { container } = render(
                <StoreSelector
                    integrations={mockIntegrations}
                    selected={mockShopifyIntegration}
                    onChange={mockOnChange}
                    fullWidth
                />,
            )

            const button = screen.getByRole('button')
            expect(button.className).toBeTruthy()

            expect(container.firstChild).toBeInTheDocument()
        })

        it('renders without fullWidth styles when fullWidth is false', () => {
            const { container } = render(
                <StoreSelector
                    integrations={mockIntegrations}
                    selected={mockShopifyIntegration}
                    onChange={mockOnChange}
                    fullWidth={false}
                />,
            )

            const button = screen.getByRole('button')
            expect(button.className).not.toMatch(/fullWidth/i)
            expect(button.className).not.toMatch(/buttonContainerFullWidth/i)

            expect(container.firstChild).toBeInTheDocument()
        })

        it('renders without fullWidth styles when fullWidth prop is not provided', () => {
            const { container } = render(
                <StoreSelector
                    integrations={mockIntegrations}
                    selected={mockShopifyIntegration}
                    onChange={mockOnChange}
                />,
            )

            const button = screen.getByRole('button')
            expect(button.className).not.toMatch(/fullWidth/i)
            expect(button.className).not.toMatch(/buttonContainerFullWidth/i)

            expect(container.firstChild).toBeInTheDocument()
        })
    })

    describe('hideSelectedFromDropdown prop', () => {
        it('hides selected store from dropdown when hideSelectedFromDropdown is true', async () => {
            const user = userEvent.setup()

            render(
                <StoreSelector
                    integrations={mockIntegrations}
                    selected={mockShopifyIntegration}
                    onChange={mockOnChange}
                    hideSelectedFromDropdown
                />,
            )

            const button = screen.getByRole('button')
            await act(() => user.click(button))

            await waitFor(() => {
                const options = screen.getAllByRole('option')
                expect(options).toHaveLength(1) // Only BigCommerce should be visible
                expect(options[0]).toHaveTextContent('BigCommerce Store')

                const hasShopifyOption = options.some((option) =>
                    option.textContent?.includes('Shopify Store'),
                )
                expect(hasShopifyOption).toBe(false)
            })
        })

        it('shows all stores in dropdown when hideSelectedFromDropdown is false', async () => {
            const user = userEvent.setup()

            render(
                <StoreSelector
                    integrations={mockIntegrations}
                    selected={mockShopifyIntegration}
                    onChange={mockOnChange}
                    hideSelectedFromDropdown={false}
                />,
            )

            const button = screen.getByRole('button')
            await act(() => user.click(button))

            await waitFor(() => {
                const options = screen.getAllByRole('option')
                expect(options).toHaveLength(2) // Both stores should be visible
                expect(options[0]).toHaveTextContent('Shopify Store')
                expect(options[1]).toHaveTextContent('BigCommerce Store')
            })
        })

        it('shows all stores in dropdown when hideSelectedFromDropdown is not provided', async () => {
            const user = userEvent.setup()

            render(
                <StoreSelector
                    integrations={mockIntegrations}
                    selected={mockShopifyIntegration}
                    onChange={mockOnChange}
                />,
            )

            const button = screen.getByRole('button')
            await act(() => user.click(button))

            await waitFor(() => {
                const options = screen.getAllByRole('option')
                expect(options).toHaveLength(2) // Both stores should be visible by default
                expect(options[0]).toHaveTextContent('Shopify Store')
                expect(options[1]).toHaveTextContent('BigCommerce Store')
            })
        })

        it('works correctly with withAllOption and hideSelectedFromDropdown', async () => {
            const user = userEvent.setup()

            render(
                <StoreSelector
                    integrations={mockIntegrations}
                    selected={mockShopifyIntegration}
                    onChange={mockOnChange}
                    withAllOption
                    hideSelectedFromDropdown
                />,
            )

            const button = screen.getByRole('button')
            await act(() => user.click(button))

            await waitFor(() => {
                const options = screen.getAllByRole('option')
                expect(options).toHaveLength(2) // All Stores + BigCommerce
                expect(options[0]).toHaveTextContent('All Stores')
                expect(options[1]).toHaveTextContent('BigCommerce Store')

                const hasShopifyOption = options.some((option) =>
                    option.textContent?.includes('Shopify Store'),
                )
                expect(hasShopifyOption).toBe(false)
            })
        })

        it('shows all integrations when no store is selected and hideSelectedFromDropdown is true', async () => {
            const user = userEvent.setup()

            render(
                <StoreSelector
                    integrations={mockIntegrations}
                    selected={undefined}
                    onChange={mockOnChange}
                    hideSelectedFromDropdown
                />,
            )

            const button = screen.getByRole('button')
            await act(() => user.click(button))

            await waitFor(() => {
                const options = screen.getAllByRole('option')
                expect(options).toHaveLength(2) // All stores should be visible when nothing is selected
                expect(options[0]).toHaveTextContent('Shopify Store')
                expect(options[1]).toHaveTextContent('BigCommerce Store')
            })
        })
    })

    describe('single store behavior', () => {
        const mockSingleIntegration = [mockShopifyIntegration]

        it('renders as disabled button by default for single store', () => {
            render(
                <StoreSelector
                    integrations={mockSingleIntegration}
                    selected={mockShopifyIntegration}
                    onChange={mockOnChange}
                />,
            )

            // Should render a disabled button by default
            const button = screen.getByRole('button')
            expect(button).toBeInTheDocument()
            expect(button).toHaveAttribute('aria-disabled', 'true')

            // Should render the store name
            expect(screen.getByText('Shopify Store')).toBeInTheDocument()

            // Should not have dropdown arrow for single store
            expect(
                screen.queryByText('arrow_drop_down'),
            ).not.toBeInTheDocument()
        })

        it('renders as inline element when single store and singleStoreInline is true', () => {
            const { container } = render(
                <StoreSelector
                    integrations={mockSingleIntegration}
                    selected={mockShopifyIntegration}
                    onChange={mockOnChange}
                    singleStoreInline
                />,
            )

            // Should not render a button
            expect(screen.queryByRole('button')).not.toBeInTheDocument()

            // Should render the store name inline
            expect(screen.getByText('Shopify Store')).toBeInTheDocument()

            // Should have inline container
            const inlineContainer = container.querySelector(
                '.inlineStoreContainer',
            )
            expect(inlineContainer).toBeInTheDocument()
        })

        it('renders as disabled button when single store and singleStoreInline is false', () => {
            render(
                <StoreSelector
                    integrations={mockSingleIntegration}
                    selected={mockShopifyIntegration}
                    onChange={mockOnChange}
                    singleStoreInline={false}
                />,
            )

            // Should render a disabled button
            const button = screen.getByRole('button')
            expect(button).toBeInTheDocument()
            expect(button).toHaveAttribute('aria-disabled', 'true')

            // Should render the store name
            expect(screen.getByText('Shopify Store')).toBeInTheDocument()

            // Should not have dropdown arrow for single store
            expect(
                screen.queryByText('arrow_drop_down'),
            ).not.toBeInTheDocument()
        })

        it('renders as inline element with status indicator when provided', () => {
            const mockShowActiveStatus = jest.fn().mockReturnValue(true)

            render(
                <StoreSelector
                    integrations={mockSingleIntegration}
                    selected={mockShopifyIntegration}
                    onChange={mockOnChange}
                    singleStoreInline
                    shouldShowActiveStatus={mockShowActiveStatus}
                />,
            )

            // Should not render a button
            expect(screen.queryByRole('button')).not.toBeInTheDocument()

            // Should render the status indicator
            const statusIndicator = screen.getByAltText('status')
            expect(statusIndicator).toBeInTheDocument()
        })

        it('renders disabled button without dropdown arrow for single store', () => {
            render(
                <StoreSelector
                    integrations={mockSingleIntegration}
                    selected={mockShopifyIntegration}
                    onChange={mockOnChange}
                />,
            )

            // Button should exist but be disabled and have no dropdown arrow
            const button = screen.getByRole('button')
            expect(button).toBeInTheDocument()
            expect(button).toHaveAttribute('aria-disabled', 'true')
            expect(
                screen.queryByText('arrow_drop_down'),
            ).not.toBeInTheDocument()
        })

        it('shows dropdown arrow for multiple stores', () => {
            render(
                <StoreSelector
                    integrations={mockIntegrations}
                    selected={mockShopifyIntegration}
                    onChange={mockOnChange}
                />,
            )

            // Should show dropdown arrow for multiple stores
            expect(screen.getByText('arrow_drop_down')).toBeInTheDocument()
        })

        it('renders as enabled button when single store and withAllOption is true', () => {
            render(
                <StoreSelector
                    integrations={mockSingleIntegration}
                    selected={mockShopifyIntegration}
                    onChange={mockOnChange}
                    withAllOption
                />,
            )

            // Should render an enabled button when withAllOption is true
            const button = screen.getByRole('button')
            expect(button).toBeInTheDocument()
            expect(button).not.toHaveAttribute('aria-disabled', 'true')

            // Should render the store name
            expect(screen.getByText('Shopify Store')).toBeInTheDocument()

            // Should have dropdown arrow for single store with withAllOption
            expect(screen.getByText('arrow_drop_down')).toBeInTheDocument()
        })
    })
})
