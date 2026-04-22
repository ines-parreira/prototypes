import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { ThemeProvider } from 'core/theme'

import { useSkillsArticles } from '../../hooks/useSkillsArticles'
import type { TransformedArticle } from '../../types'
import { LinkToSkillModal } from './LinkToSkillModal'

jest.mock('../../hooks/useSkillsArticles')
jest.mock(
    'pages/settings/helpCenter/hooks/useStoreIntegrationByShopName',
    () => ({
        useStoreIntegrationByShopName: jest.fn(() => ({ id: 1 })),
    }),
)

Element.prototype.getAnimations = jest.fn(() => [])

const mockUseSkillsArticles = useSkillsArticles as jest.Mock

const mockArticles: TransformedArticle[] = [
    {
        id: 1,
        title: 'Order status, tracking or delivery timing',
        intents: [{ name: 'order::status', formattedName: 'Order / Status' }],
        status: 'enabled',
        metrics: {
            tickets: 1290,
            handoverTickets: 100,
            csat: 4.5,
            resourceSourceSetId: 1,
        },
    },
    {
        id: 2,
        title: 'Order cancellations',
        intents: [
            { name: 'order::cancel', formattedName: 'Order / Cancel' },
            { name: 'order::refund', formattedName: 'Order / Refund' },
        ],
        status: 'enabled',
        metrics: {
            tickets: 672,
            handoverTickets: 50,
            csat: 4.0,
            resourceSourceSetId: 2,
        },
    },
    {
        id: 3,
        title: 'Shipping address updates',
        intents: [],
        status: 'enabled',
    },
]

const mockStore = configureMockStore([thunk])

describe('LinkToSkillModal', () => {
    const defaultProps = {
        isOpen: true,
        intentId: 'order::payment',
        helpCenterId: 123,
        shopName: 'test-shop',
        onClose: jest.fn(),
        onConfirm: jest.fn(),
    }

    const renderComponent = (
        props: Partial<Parameters<typeof LinkToSkillModal>[0]> = {},
    ) => {
        const store = mockStore({})
        return render(
            <Provider store={store}>
                <ThemeProvider>
                    <LinkToSkillModal {...defaultProps} {...props} />
                </ThemeProvider>
            </Provider>,
        )
    }

    beforeEach(() => {
        jest.clearAllMocks()
        mockUseSkillsArticles.mockReturnValue({
            articles: mockArticles,
            isLoading: false,
            isError: false,
            isMetricsLoading: false,
            isMetricsError: false,
            metricsDateRange: {},
        })
    })

    it('should display all articles including ones that already have the intent linked', () => {
        renderComponent({ intentId: 'order::status' })

        expect(
            screen.getByText('Order status, tracking or delivery timing'),
        ).toBeInTheDocument()
        expect(screen.getByText('Order cancellations')).toBeInTheDocument()
        expect(screen.getByText('Shipping address updates')).toBeInTheDocument()
    })

    it('renders the modal title with correct text', () => {
        renderComponent()

        expect(
            screen.getByText('Link intent to existing skill'),
        ).toBeInTheDocument()
    })

    it('should call onConfirm with intentId and full article when Review and test is clicked', async () => {
        const user = userEvent.setup()
        const onConfirm = jest.fn()
        renderComponent({ onConfirm })

        await user.click(screen.getByText('Order cancellations'))
        await user.click(
            screen.getByRole('button', { name: /^review and test$/i }),
        )

        expect(onConfirm).toHaveBeenCalledWith(
            'order::payment',
            mockArticles[1],
        )
    })

    it('should filter articles based on search term', async () => {
        const user = userEvent.setup()
        renderComponent()

        await user.type(
            screen.getByPlaceholderText('Search...'),
            'cancellations',
        )

        expect(screen.getByText('Order cancellations')).toBeInTheDocument()
        expect(
            screen.queryByText('Order status, tracking or delivery timing'),
        ).not.toBeInTheDocument()
    })

    it('should toggle row selection when Enter key is pressed', async () => {
        const user = userEvent.setup()
        renderComponent()

        const option = screen.getByRole('option', {
            name: /Order cancellations/i,
        })
        option.focus()
        await user.keyboard('{Enter}')

        expect(option).toHaveAttribute('aria-selected', 'true')
    })

    it('should show overflow intent count for articles with more than 2 intents', () => {
        mockUseSkillsArticles.mockReturnValue({
            articles: [
                {
                    id: 4,
                    title: 'Multi-intent skill',
                    intents: [
                        {
                            name: 'order::cancel',
                            formattedName: 'Order / Cancel',
                        },
                        {
                            name: 'order::refund',
                            formattedName: 'Order / Refund',
                        },
                        {
                            name: 'shipping::delay',
                            formattedName: 'Shipping / Delay',
                        },
                    ],
                    status: 'enabled',
                },
            ],
            isLoading: false,
            isError: false,
            isMetricsLoading: false,
            isMetricsError: false,
            metricsDateRange: {},
        })
        renderComponent()

        expect(screen.getByText('+1')).toBeInTheDocument()
    })
})
