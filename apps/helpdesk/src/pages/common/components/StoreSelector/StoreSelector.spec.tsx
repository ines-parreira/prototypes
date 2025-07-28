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

        it('does not render when selected is undefined', () => {
            const { container } = render(
                <StoreSelector
                    integrations={mockIntegrations}
                    selected={undefined}
                    onChange={mockOnChange}
                />,
            )

            expect(container.firstChild).toBeNull()
        })

        it('displays empty string when integration name is not available', () => {
            const integrationWithoutName = {
                id: 3,
                name: '',
                type: IntegrationType.Shopify,
            } as StoreIntegration

            render(
                <StoreSelector
                    integrations={[integrationWithoutName]}
                    selected={integrationWithoutName}
                    onChange={mockOnChange}
                />,
            )

            const button = screen.getByRole('button')
            expect(button).toBeInTheDocument()
            // The button should still render but with empty text
            expect(button.textContent).toContain('arrow_drop_down')
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
})
