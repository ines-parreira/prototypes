import type { ReactNode } from 'react'

import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'

import { ThemeProvider } from 'core/theme'
import { mockStore } from 'utils/testing'

import { ShopifyVariablesDropdown } from '../ShopifyVariablesDropdown'

jest.mock('@gorgias/axiom', () => {
    const actual = jest.requireActual('@gorgias/axiom')
    return {
        ...actual,
        LegacyTooltip: ({ children }: { children: ReactNode }) => (
            <span data-testid="tooltip">{children}</span>
        ),
    }
})

jest.mock('../ShopifyMetafieldVariablePicker', () => ({
    ShopifyMetafieldVariablePicker: ({ onCloseParentMenu, onSelect }: any) => (
        <button
            type="button"
            onClick={() => {
                onSelect?.('{{metafield.value}}')
                onCloseParentMenu?.()
            }}
        >
            Shopify metafields
        </button>
    ),
}))

const defaultProps = {
    categoryName: 'Test Category',
    variables: [
        { name: 'Variable 1', value: '{{var1}}' },
        { name: 'Variable 2', value: '{{var2}}', tooltip: 'Tooltip for var2' },
    ],
    categoryIndex: 0,
    onInsertText: jest.fn(),
}

const renderComponent = (props: Partial<typeof defaultProps> = {}) => {
    return render(
        <Provider store={mockStore({})}>
            <ThemeProvider>
                <ShopifyVariablesDropdown {...defaultProps} {...props} />
            </ThemeProvider>
        </Provider>,
    )
}

describe('<ShopifyVariablesDropdown />', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('renders the dropdown toggle with category name', () => {
        renderComponent()

        expect(
            screen.getByRole('button', { name: /test category/i }),
        ).toBeInTheDocument()
    })

    it('calls onInsertText with the variable value when dropdown item is clicked', async () => {
        const user = userEvent.setup()
        const onInsertText = jest.fn()
        renderComponent({ onInsertText })

        await user.click(screen.getByRole('button', { name: /test category/i }))
        await user.click(screen.getByText('Variable 1'))

        expect(onInsertText).toHaveBeenCalledWith('{{var1}}')
    })

    it('calls onInsertText with correct value for different variables', async () => {
        const user = userEvent.setup()
        const onInsertText = jest.fn()
        renderComponent({ onInsertText })

        await user.click(screen.getByRole('button', { name: /test category/i }))
        await user.click(screen.getByText('Variable 2'))

        expect(onInsertText).toHaveBeenCalledWith('{{var2}}')
    })

    it('closes the dropdown when ShopifyMetafieldVariablePicker calls onCloseParentMenu', async () => {
        const user = userEvent.setup()
        const onInsertText = jest.fn()
        renderComponent({ onInsertText })

        const toggleButton = screen.getByRole('button', {
            name: /test category/i,
        })
        await user.click(toggleButton)

        expect(toggleButton).toHaveAttribute('aria-expanded', 'true')

        await user.click(screen.getByText('Shopify metafields'))

        await waitFor(() => {
            expect(toggleButton).toHaveAttribute('aria-expanded', 'false')
        })
    })

    it('renders tooltip when variable has tooltip property', async () => {
        const user = userEvent.setup()
        renderComponent()

        await user.click(screen.getByRole('button', { name: /test category/i }))

        const tooltips = screen.getAllByTestId('tooltip')
        expect(tooltips).toHaveLength(1)
        expect(tooltips[0]).toHaveTextContent('Tooltip for var2')
    })

    it('does not render tooltip when variable has no tooltip property', async () => {
        const user = userEvent.setup()
        const variablesWithoutTooltip = [
            { name: 'No Tooltip Var', value: '{{noTooltip}}' },
        ]
        renderComponent({ variables: variablesWithoutTooltip })

        await user.click(screen.getByRole('button', { name: /test category/i }))

        expect(screen.getByText('No Tooltip Var')).toBeInTheDocument()
        expect(screen.queryByTestId('tooltip')).not.toBeInTheDocument()
    })
})
