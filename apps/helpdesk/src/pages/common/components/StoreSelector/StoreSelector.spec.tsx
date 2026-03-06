import React from 'react'

import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { THEME_NAME } from '@gorgias/design-tokens'

import * as themeHooks from '../../../../core/theme'
import { IntegrationType } from '../../../../models/integration/constants'
import type { StoreIntegration } from '../../../../models/integration/types'
import StoreSelector from './StoreSelector'

jest.mock('../../../../core/theme', () => ({
    ...jest.requireActual('../../../../core/theme'),
    useTheme: jest.fn(),
}))

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
    const mockUseTheme = themeHooks.useTheme as jest.MockedFunction<
        typeof themeHooks.useTheme
    >

    beforeEach(() => {
        jest.clearAllMocks()
        mockUseTheme.mockReturnValue({
            name: THEME_NAME.Light,
            resolvedName: THEME_NAME.Light,
            tokens: {} as any,
        })
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
            expect(
                screen.getByRole('button', { name: /Shopify Store/i }),
            ).toBeInTheDocument()
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
            expect(
                screen.getByRole('button', { name: /Select a store/i }),
            ).toBeInTheDocument()
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
            expect(
                screen.getByRole('button', { name: /All Stores/i }),
            ).toBeInTheDocument()
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

            expect(screen.queryByRole('button')).not.toBeInTheDocument()

            const inlineContainer = container.querySelector(
                '.inlineStoreContainer',
            )
            expect(inlineContainer).toBeInTheDocument()

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

            await user.click(button)

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

            await user.click(button)

            const options = screen.getAllByRole('option')
            const bigCommerceOption = options.find((option) =>
                option.textContent?.includes('BigCommerce Store'),
            )

            await user.click(bigCommerceOption!)

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

            await user.click(button)
            await waitFor(() => {
                expect(screen.getAllByRole('option')).toHaveLength(2)
            })

            await user.click(button)
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

            await user.click(button)
            await waitFor(() => {
                const options = screen.getAllByRole('option')
                expect(options).toHaveLength(3)
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

            await user.click(button)

            const options = screen.getAllByRole('option')
            const allStoresOption = options.find((option) =>
                option.textContent?.includes('All Stores'),
            )

            await user.click(allStoresOption!)
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

            await user.click(button)
            await waitFor(() => {
                const options = screen.getAllByRole('option')
                expect(options).toHaveLength(2)

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
            await user.click(button)

            await waitFor(() => {
                expect(screen.getByRole('searchbox')).toBeInTheDocument()
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
            await user.click(button)

            await waitFor(() => {
                expect(screen.queryByRole('searchbox')).not.toBeInTheDocument()
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

            const { container } = render(
                <StoreSelector
                    integrations={mockIntegrations}
                    selected={mockShopifyIntegration}
                    onChange={mockOnChange}
                    shouldShowActiveStatus={mockShowActiveStatus}
                />,
            )

            const dots = container.querySelectorAll('[data-name="dot"]')
            expect(dots.length).toBeGreaterThanOrEqual(1)
            expect(mockShowActiveStatus).toHaveBeenCalledWith(
                mockShopifyIntegration,
            )
        })

        it('displays status indicator for selected store when inactive', () => {
            mockShowActiveStatus.mockReturnValue(false)

            const { container } = render(
                <StoreSelector
                    integrations={mockIntegrations}
                    selected={mockShopifyIntegration}
                    onChange={mockOnChange}
                    shouldShowActiveStatus={mockShowActiveStatus}
                />,
            )

            const dots = container.querySelectorAll('[data-name="dot"]')
            expect(dots.length).toBeGreaterThanOrEqual(1)
            expect(mockShowActiveStatus).toHaveBeenCalledWith(
                mockShopifyIntegration,
            )
        })

        it('does not display status indicator when shouldShowActiveStatus returns undefined', () => {
            mockShowActiveStatus.mockReturnValue(undefined)

            const { container } = render(
                <StoreSelector
                    integrations={mockIntegrations}
                    selected={mockShopifyIntegration}
                    onChange={mockOnChange}
                    shouldShowActiveStatus={mockShowActiveStatus}
                />,
            )

            expect(
                container.querySelectorAll('[data-name="dot"]'),
            ).toHaveLength(0)
        })

        it('does not display status indicator when shouldShowActiveStatus is not provided', () => {
            const { container } = render(
                <StoreSelector
                    integrations={mockIntegrations}
                    selected={mockShopifyIntegration}
                    onChange={mockOnChange}
                />,
            )

            expect(
                container.querySelectorAll('[data-name="dot"]'),
            ).toHaveLength(0)
        })

        it('displays status indicators in dropdown for each store', async () => {
            const user = userEvent.setup()
            mockShowActiveStatus.mockImplementation((integration) => {
                return integration.id === 1
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
            await user.click(button)

            await waitFor(() => {
                const dots = document.querySelectorAll('[data-name="dot"]')
                expect(dots.length).toBeGreaterThanOrEqual(3)

                expect(mockShowActiveStatus).toHaveBeenCalledWith(
                    mockShopifyIntegration,
                )
                expect(mockShowActiveStatus).toHaveBeenCalledWith(
                    mockBigCommerceIntegration,
                )
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
            await user.click(button)

            await waitFor(() => {
                expect(
                    document.querySelectorAll('[data-name="dot"]'),
                ).toHaveLength(0)
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
            await user.click(button)

            await waitFor(() => {
                const options = screen.getAllByRole('option')
                expect(options).toHaveLength(1)
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
            await user.click(button)

            await waitFor(() => {
                const options = screen.getAllByRole('option')
                expect(options).toHaveLength(2)
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
            await user.click(button)

            await waitFor(() => {
                const options = screen.getAllByRole('option')
                expect(options).toHaveLength(2)
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
            await user.click(button)

            await waitFor(() => {
                const options = screen.getAllByRole('option')
                expect(options).toHaveLength(2)
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
            await user.click(button)

            await waitFor(() => {
                const options = screen.getAllByRole('option')
                expect(options).toHaveLength(2)
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

            const button = screen.getByRole('button')
            expect(button).toBeInTheDocument()
            expect(button).toBeDisabled()

            expect(
                within(button).getByText('Shopify Store'),
            ).toBeInTheDocument()
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

            expect(screen.queryByRole('button')).not.toBeInTheDocument()

            expect(screen.getByText('Shopify Store')).toBeInTheDocument()

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

            const button = screen.getByRole('button')
            expect(button).toBeInTheDocument()
            expect(button).toBeDisabled()

            expect(
                within(button).getByText('Shopify Store'),
            ).toBeInTheDocument()
        })

        it('renders as inline element with status indicator when provided', () => {
            const mockShowActiveStatus = jest.fn().mockReturnValue(true)

            const { container } = render(
                <StoreSelector
                    integrations={mockSingleIntegration}
                    selected={mockShopifyIntegration}
                    onChange={mockOnChange}
                    singleStoreInline
                    shouldShowActiveStatus={mockShowActiveStatus}
                />,
            )

            expect(screen.queryByRole('button')).not.toBeInTheDocument()

            const dots = container.querySelectorAll('[data-name="dot"]')
            expect(dots.length).toBeGreaterThanOrEqual(1)
        })

        it('renders disabled button without chevron icon for single store', () => {
            render(
                <StoreSelector
                    integrations={mockSingleIntegration}
                    selected={mockShopifyIntegration}
                    onChange={mockOnChange}
                />,
            )

            const button = screen.getByRole('button')
            expect(button).toBeInTheDocument()
            expect(button).toBeDisabled()
        })

        it('renders chevron icon for multiple stores', () => {
            render(
                <StoreSelector
                    integrations={mockIntegrations}
                    selected={mockShopifyIntegration}
                    onChange={mockOnChange}
                />,
            )

            const button = screen.getByRole('button')
            expect(button).toBeInTheDocument()
            expect(button).not.toBeDisabled()
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

            const button = screen.getByRole('button')
            expect(button).toBeInTheDocument()
            expect(button).not.toBeDisabled()

            expect(
                within(button).getByText('Shopify Store'),
            ).toBeInTheDocument()
        })
    })

    describe('classic theme override', () => {
        it('applies dark dropdown styles when applyClassicThemeOverride is true and theme is classic', () => {
            mockUseTheme.mockReturnValue({
                name: THEME_NAME.Classic,
                resolvedName: THEME_NAME.Classic,
                tokens: {} as any,
            })

            const { container } = render(
                <StoreSelector
                    integrations={mockIntegrations}
                    selected={mockShopifyIntegration}
                    onChange={mockOnChange}
                    applyClassicThemeOverride
                />,
            )

            const wrapper = container.firstChild as HTMLElement
            expect(wrapper.className).toContain('darkDropdown')
        })

        it('does not apply dark dropdown styles when applyClassicThemeOverride is false', () => {
            mockUseTheme.mockReturnValue({
                name: THEME_NAME.Classic,
                resolvedName: THEME_NAME.Classic,
                tokens: {} as any,
            })

            const { container } = render(
                <StoreSelector
                    integrations={mockIntegrations}
                    selected={mockShopifyIntegration}
                    onChange={mockOnChange}
                    applyClassicThemeOverride={false}
                />,
            )

            const wrapper = container.firstChild as HTMLElement
            expect(wrapper.className).not.toContain('darkDropdown')
        })

        it('does not apply dark dropdown styles when theme is not classic', () => {
            mockUseTheme.mockReturnValue({
                name: THEME_NAME.Light,
                resolvedName: THEME_NAME.Light,
                tokens: {} as any,
            })

            const { container } = render(
                <StoreSelector
                    integrations={mockIntegrations}
                    selected={mockShopifyIntegration}
                    onChange={mockOnChange}
                    applyClassicThemeOverride
                />,
            )

            const wrapper = container.firstChild as HTMLElement
            expect(wrapper.className).not.toContain('darkDropdown')
        })

        it('does not apply dark dropdown styles by default when prop is not provided', () => {
            mockUseTheme.mockReturnValue({
                name: THEME_NAME.Classic,
                resolvedName: THEME_NAME.Classic,
                tokens: {} as any,
            })

            const { container } = render(
                <StoreSelector
                    integrations={mockIntegrations}
                    selected={mockShopifyIntegration}
                    onChange={mockOnChange}
                />,
            )

            const wrapper = container.firstChild as HTMLElement
            expect(wrapper.className).not.toContain('darkDropdown')
        })
    })
})
