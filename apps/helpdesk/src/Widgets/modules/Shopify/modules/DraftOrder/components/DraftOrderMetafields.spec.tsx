import { logEvent, SegmentEvent } from '@repo/logging'
import { fireEvent, render, screen } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'

import WrappedDraftOrderMetafields, {
    DraftOrderMetafields,
} from './DraftOrderMetafields'

jest.mock('@repo/logging', () => ({
    logEvent: jest.fn(),
    SegmentEvent: {
        ShopifyMetafieldsOpenDraftOrder: 'shopify_metafields_open_draft_order',
    },
}))

const mockLogEvent = logEvent as jest.MockedFunction<typeof logEvent>

const mockStore = configureMockStore()
const store = mockStore({
    currentAccount: fromJS({ domain: 'domain' }),
})

const renderWithProviders = (ui: React.ReactElement) => {
    return render(<Provider store={store}>{ui}</Provider>)
}

describe('DraftOrderMetafields', () => {
    describe('empty state', () => {
        it.each([
            {
                scenario: 'metafields is undefined',
                metafields: undefined,
            },
            {
                scenario: 'metafields is empty array',
                metafields: [],
            },
        ])('should render info message when $scenario', ({ metafields }) => {
            renderWithProviders(
                <DraftOrderMetafields metafields={metafields} />,
            )

            expect(
                screen.getByText('Draft order has no metafields populated.'),
            ).toBeInTheDocument()
        })
    })

    describe('successful data rendering', () => {
        it('should render metafields when data is available', () => {
            const metafields = [
                {
                    type: 'single_line_text_field' as const,
                    namespace: 'custom',
                    key: 'custom_field_1',
                    value: 'value_1',
                },
                {
                    type: 'single_line_text_field' as const,
                    namespace: 'custom',
                    key: 'custom_field_2',
                    value: 'value_2',
                },
            ]

            renderWithProviders(
                <DraftOrderMetafields metafields={metafields} />,
            )

            expect(screen.getByText('Custom Field 1:')).toBeInTheDocument()
            expect(screen.getByText('value_1')).toBeInTheDocument()
            expect(screen.getByText('Custom Field 2:')).toBeInTheDocument()
            expect(screen.getByText('value_2')).toBeInTheDocument()
        })

        it('should render all metafields from the props', () => {
            const metafields = Array.from({ length: 5 }, (_, i) => ({
                type: 'single_line_text_field' as const,
                namespace: 'custom',
                key: `field_${i + 1}`,
                value: `value_${i + 1}`,
            }))

            renderWithProviders(
                <DraftOrderMetafields metafields={metafields} />,
            )

            for (let i = 1; i <= 5; i++) {
                expect(screen.getByText(`Field ${i}:`)).toBeInTheDocument()
                expect(screen.getByText(`value_${i}`)).toBeInTheDocument()
            }
        })
    })
})

describe('WrappedDraftOrderMetafields', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should render expanded by default with MetafieldsContainer wrapper', () => {
        const metafields = [
            {
                type: 'single_line_text_field' as const,
                namespace: 'custom',
                key: 'custom_field_1',
                value: 'value_1',
            },
        ]

        renderWithProviders(
            <WrappedDraftOrderMetafields metafields={metafields} />,
        )

        expect(screen.getByText('Draft Order Metafields')).toBeInTheDocument()
        expect(screen.getByTitle('Fold this card')).toBeInTheDocument()
        expect(screen.getByText('Custom Field 1:')).toBeInTheDocument()
        expect(screen.getByText('value_1')).toBeInTheDocument()
    })

    it('should log segment event when reopened after being collapsed', () => {
        renderWithProviders(<WrappedDraftOrderMetafields metafields={[]} />)

        const foldButton = screen.getByTitle('Fold this card')
        fireEvent.click(foldButton)

        expect(mockLogEvent).not.toHaveBeenCalled()

        const unfoldButton = screen.getByTitle('Unfold this card')
        fireEvent.click(unfoldButton)

        expect(mockLogEvent).toHaveBeenCalledWith(
            SegmentEvent.ShopifyMetafieldsOpenDraftOrder,
        )
    })

    it('should collapse when toggle button is clicked', () => {
        const metafields = [
            {
                type: 'single_line_text_field' as const,
                namespace: 'custom',
                key: 'custom_field_1',
                value: 'value_1',
            },
        ]

        renderWithProviders(
            <WrappedDraftOrderMetafields metafields={metafields} />,
        )

        expect(screen.getByText('Custom Field 1:')).toBeInTheDocument()
        expect(screen.getByText('value_1')).toBeInTheDocument()

        const toggleButton = screen.getByTitle('Fold this card')
        fireEvent.click(toggleButton)

        expect(screen.queryByText('Custom Field 1:')).not.toBeInTheDocument()
        expect(screen.queryByText('value_1')).not.toBeInTheDocument()
    })
})
