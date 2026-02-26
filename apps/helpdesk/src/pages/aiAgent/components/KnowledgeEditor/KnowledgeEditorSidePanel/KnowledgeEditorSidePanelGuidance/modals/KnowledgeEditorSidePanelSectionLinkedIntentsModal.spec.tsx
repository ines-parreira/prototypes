import { useState } from 'react'

import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { useResourceMetrics } from 'domains/reporting/models/queryFactories/knowledge/knowledgeInsightsMetrics'

import { KnowledgeEditorSidePanelSectionLinkedIntentsModal } from './KnowledgeEditorSidePanelSectionLinkedIntentsModal'

const mockPersistLinkedIntents = jest.fn()

const mockIntentGroups = [
    {
        name: 'Order',
        children: [
            {
                name: 'status',
                intent: 'order::status',
                is_available: true,
            },
            {
                name: 'cancel',
                intent: 'order::cancel',
                is_available: true,
            },
            {
                name: 'missing item',
                intent: 'order::missing-item',
                is_available: false,
                used_by_article: {
                    id: 99,
                    title: 'Other guidance',
                    version: 3,
                },
            },
        ],
    },
    {
        name: 'Shipping',
        children: [
            {
                name: 'delay',
                intent: 'shipping::delay',
                is_available: true,
            },
        ],
    },
]

const mockUseGetArticleTranslationIntents = jest.fn(
    () =>
        ({
            data: { intents: mockIntentGroups },
            isLoading: false,
            isError: false,
            refetch: jest.fn(),
        }) as {
            data: { intents: typeof mockIntentGroups } | undefined
            isLoading: boolean
            isError: boolean
            refetch: jest.Mock
        },
)
const mockUseResourceMetrics = useResourceMetrics as jest.Mock

type MockGuidanceStoreState = {
    guidanceArticle: {
        id: number
        locale: string
    }
    config: {
        guidanceHelpCenter: {
            id: number
            shop_integration_id: number
        }
    }
    state: {
        guidance: {
            id: number
            locale: string
            intents: string[] | null
        }
        isUpdating: boolean
    }
}

const createMockGuidanceStoreState = (): MockGuidanceStoreState => ({
    guidanceArticle: { id: 123, locale: 'en' },
    config: { guidanceHelpCenter: { id: 456, shop_integration_id: 1 } },
    state: {
        guidance: {
            id: 123,
            locale: 'en',
            intents: [],
        },
        isUpdating: false,
    },
})

let mockGuidanceStoreState = createMockGuidanceStoreState()

jest.mock('models/helpCenter/queries', () => ({
    useGetArticleTranslationIntents: (...args: unknown[]) =>
        mockUseGetArticleTranslationIntents(...(args as [])),
}))

jest.mock(
    'domains/reporting/models/queryFactories/knowledge/knowledgeInsightsMetrics',
    () => ({
        useResourceMetrics: jest.fn(),
        getLast28DaysDateRange: jest.fn(() => ({
            start_datetime: '2025-01-01T00:00:00.000Z',
            end_datetime: '2025-01-28T00:00:00.000Z',
        })),
    }),
)

jest.mock('hooks/useAppSelector', () => jest.fn(() => 'America/New_York'))

jest.mock(
    'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorGuidance/context',
    () => ({
        useGuidanceStore: (selector: (state: unknown) => unknown) =>
            selector(mockGuidanceStoreState),
    }),
)

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useParams: () => ({ shopName: 'test-shop' }),
}))

jest.mock('../hooks/usePersistLinkedIntents', () => ({
    usePersistLinkedIntents: () => ({
        persistLinkedIntents: mockPersistLinkedIntents,
        isUpdating: mockGuidanceStoreState.state.isUpdating,
        isAutoSaving: false,
    }),
}))

const renderComponent = ({
    isOpen = true,
    onClose = jest.fn(),
}: {
    isOpen?: boolean
    onClose?: jest.Mock
} = {}) =>
    render(
        <KnowledgeEditorSidePanelSectionLinkedIntentsModal
            isOpen={isOpen}
            onClose={onClose}
        />,
    )

describe('KnowledgeEditorSidePanelSectionLinkedIntentsModal', () => {
    beforeEach(() => {
        mockGuidanceStoreState = createMockGuidanceStoreState()
        mockUseGetArticleTranslationIntents.mockReturnValue({
            data: { intents: mockIntentGroups },
            isLoading: false,
            isError: false,
            refetch: jest.fn(),
        })
        mockUseResourceMetrics.mockReturnValue({
            data: {
                intents: [
                    { intent: 'order::status', ticketCount: 1337 },
                    { intent: 'order::cancel', ticketCount: 678 },
                    { intent: 'order::missing-item', ticketCount: 245 },
                    { intent: 'shipping::delay', ticketCount: 20 },
                ],
            },
            isLoading: false,
            isError: false,
        })
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    it('renders available intents and selection count', () => {
        renderComponent()

        const modal = screen.getByRole('dialog')
        expect(
            within(modal).getByRole('heading', { name: 'Link intents' }),
        ).toBeInTheDocument()
        expect(
            within(modal).getByRole('searchbox', { name: 'Search intents' }),
        ).toBeInTheDocument()
        expect(
            within(modal).getByText('0 of 4 intents selected'),
        ).toBeInTheDocument()
        expect(within(modal).getByText('Suggested')).toBeInTheDocument()
        expect(
            within(modal).getAllByRole('checkbox', { name: 'order/status' }),
        ).toHaveLength(2)
        expect(
            within(modal).getAllByRole('checkbox', { name: 'order/cancel' }),
        ).toHaveLength(2)
        expect(within(modal).getAllByText('1337').length).toBeGreaterThan(0)
        expect(within(modal).getAllByText('678').length).toBeGreaterThan(0)
    })

    it('shows suggested intents as the top two by ticket count', () => {
        mockUseResourceMetrics.mockReturnValue({
            data: {
                intents: [
                    { intent: 'order::status', ticketCount: 900 },
                    { intent: 'order::cancel', ticketCount: 100 },
                    { intent: 'order::missing-item', ticketCount: 500 },
                    { intent: 'shipping::delay', ticketCount: 1200 },
                ],
            },
            isLoading: false,
            isError: false,
        })

        renderComponent()

        const modal = screen.getByRole('dialog')
        const intentCheckboxes = within(modal).getAllByRole('checkbox', {
            name: /.+\/.+/,
        })

        expect(intentCheckboxes[0]).toHaveAccessibleName('shipping/delay')
        expect(intentCheckboxes[1]).toHaveAccessibleName('order/status')
    })

    it('orders intents in a group by availability, then ticket count descending', async () => {
        const user = userEvent.setup()
        mockUseResourceMetrics.mockReturnValue({
            data: {
                intents: [
                    { intent: 'order::status', ticketCount: 100 },
                    { intent: 'order::cancel', ticketCount: 900 },
                    { intent: 'order::missing-item', ticketCount: 500 },
                    { intent: 'shipping::delay', ticketCount: 50 },
                ],
            },
            isLoading: false,
            isError: false,
        })

        renderComponent()

        const modal = screen.getByRole('dialog')
        await user.type(
            within(modal).getByRole('searchbox', { name: 'Search intents' }),
            'order',
        )

        const orderIntentCheckboxes = within(modal).getAllByRole('checkbox', {
            name: /^order\//,
        })

        expect(orderIntentCheckboxes[0]).toHaveAccessibleName('order/cancel')
        expect(orderIntentCheckboxes[1]).toHaveAccessibleName('order/status')
        expect(orderIntentCheckboxes[2]).toHaveAccessibleName(
            'order/missing-item',
        )
    })

    it('reads selected intents from guidance store', () => {
        mockGuidanceStoreState.state.guidance.intents = ['order::status']

        renderComponent()

        const modal = screen.getByRole('dialog')
        expect(
            within(modal).getByText('1 of 4 intents selected'),
        ).toBeInTheDocument()
        expect(
            within(modal).getAllByRole('checkbox', { name: 'order/status' })[0],
        ).toBeChecked()
    })

    it('filters intents by search input', async () => {
        const user = userEvent.setup()
        renderComponent()

        const modal = screen.getByRole('dialog')
        const searchInput = within(modal).getByRole('searchbox', {
            name: 'Search intents',
        })

        await user.type(searchInput, 'shipping')

        expect(within(modal).getByText('shipping/delay')).toBeInTheDocument()
        expect(
            within(modal).queryByText('order/status'),
        ).not.toBeInTheDocument()
    })

    it('filters intents by raw intent key', async () => {
        const user = userEvent.setup()
        renderComponent()

        const modal = screen.getByRole('dialog')
        const searchInput = within(modal).getByRole('searchbox', {
            name: 'Search intents',
        })

        await user.type(searchInput, 'order::status')

        expect(within(modal).getByText('order/status')).toBeInTheDocument()
        expect(
            within(modal).queryByText('shipping/delay'),
        ).not.toBeInTheDocument()
    })

    it('orders intents alphabetically when ticket counts are equal', async () => {
        const user = userEvent.setup()
        mockUseResourceMetrics.mockReturnValue({
            data: {
                intents: [
                    { intent: 'order::status', ticketCount: 500 },
                    { intent: 'order::cancel', ticketCount: 500 },
                    { intent: 'order::missing-item', ticketCount: 100 },
                    { intent: 'shipping::delay', ticketCount: 50 },
                ],
            },
            isLoading: false,
            isError: false,
        })

        renderComponent()

        const modal = screen.getByRole('dialog')
        await user.type(
            within(modal).getByRole('searchbox', { name: 'Search intents' }),
            'order',
        )

        const orderIntentCheckboxes = within(modal).getAllByRole('checkbox', {
            name: /^order\//,
        })

        expect(orderIntentCheckboxes[0]).toHaveAccessibleName('order/cancel')
        expect(orderIntentCheckboxes[1]).toHaveAccessibleName('order/status')
    })

    it('renders unavailable intents as disabled with explanatory caption', () => {
        renderComponent()

        const modal = screen.getByRole('dialog')
        const disabledCheckbox = within(modal).getAllByRole('checkbox', {
            name: 'order/missing-item',
        })[0]

        expect(disabledCheckbox).toBeDisabled()
        expect(
            within(modal).getByText('Already linked to another guidance'),
        ).toBeInTheDocument()
    })

    it('selects all available intents when selecting a group', async () => {
        const user = userEvent.setup()
        renderComponent()

        const modal = screen.getByRole('dialog')
        await user.click(within(modal).getByRole('checkbox', { name: 'Order' }))

        const orderStatusCheckboxes = within(modal).getAllByRole('checkbox', {
            name: 'order/status',
        })
        const orderCancelCheckboxes = within(modal).getAllByRole('checkbox', {
            name: 'order/cancel',
        })

        orderStatusCheckboxes.forEach((checkbox) =>
            expect(checkbox).toBeChecked(),
        )
        orderCancelCheckboxes.forEach((checkbox) =>
            expect(checkbox).toBeChecked(),
        )
        expect(
            within(modal).getAllByRole('checkbox', {
                name: 'order/missing-item',
            })[0],
        ).not.toBeChecked()
    })

    it('calls persistLinkedIntents with selected intent ids on save', async () => {
        const user = userEvent.setup()
        const onClose = jest.fn()
        renderComponent({ onClose })

        const modal = screen.getByRole('dialog')
        await user.click(
            within(modal).getAllByRole('checkbox', { name: 'order/status' })[0],
        )
        await user.click(within(modal).getByRole('button', { name: 'Save' }))

        expect(mockPersistLinkedIntents).toHaveBeenCalledTimes(1)
        expect(mockPersistLinkedIntents).toHaveBeenCalledWith(
            ['order::status'],
            expect.any(Function),
        )
    })

    it('renders skeleton loading state when intents are loading', () => {
        mockUseGetArticleTranslationIntents.mockReturnValue({
            data: undefined,
            isLoading: true,
            isError: false,
            refetch: jest.fn(),
        })

        renderComponent()

        expect(
            within(screen.getByRole('dialog')).getByLabelText(
                'Loading intents',
            ),
        ).toBeInTheDocument()
        expect(
            within(screen.getByRole('dialog')).queryByText(
                'Loading intents...',
            ),
        ).not.toBeInTheDocument()
    })

    it('retries loading intents from error state', async () => {
        const user = userEvent.setup()
        const refetch = jest.fn()

        mockUseGetArticleTranslationIntents.mockReturnValue({
            data: undefined,
            isLoading: false,
            isError: true,
            refetch,
        })

        renderComponent()

        const modal = screen.getByRole('dialog')
        await user.click(
            within(modal).getByRole('button', { name: 'Try again' }),
        )

        expect(refetch).toHaveBeenCalledTimes(1)
    })

    it('resets search state when modal is closed and reopened', async () => {
        const user = userEvent.setup()

        const ModalHarness = () => {
            const [isOpen, setIsOpen] = useState(false)

            return (
                <>
                    <button onClick={() => setIsOpen(true)}>Open modal</button>
                    {isOpen && (
                        <KnowledgeEditorSidePanelSectionLinkedIntentsModal
                            isOpen={isOpen}
                            onClose={() => setIsOpen(false)}
                        />
                    )}
                </>
            )
        }

        render(<ModalHarness />)

        await user.click(screen.getByRole('button', { name: 'Open modal' }))

        let searchInput = within(screen.getByRole('dialog')).getByRole(
            'searchbox',
            {
                name: 'Search intents',
            },
        )

        await user.type(searchInput, 'shipping')
        expect(searchInput).toHaveValue('shipping')

        await user.click(
            within(screen.getByRole('dialog')).getByRole('button', {
                name: 'Cancel',
            }),
        )

        await user.click(screen.getByRole('button', { name: 'Open modal' }))

        searchInput = within(screen.getByRole('dialog')).getByRole(
            'searchbox',
            {
                name: 'Search intents',
            },
        )

        expect(searchInput).toHaveValue('')
    })
})
