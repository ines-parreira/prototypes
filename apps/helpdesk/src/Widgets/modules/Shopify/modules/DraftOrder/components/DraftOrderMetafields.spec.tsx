import { logEvent, SegmentEvent } from '@repo/logging'
import { fireEvent, render, screen } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'

import { useListShopifyOrderMetafields } from '@gorgias/helpdesk-queries'

import WrappedDraftOrderMetafields, {
    DraftOrderMetafields,
} from './DraftOrderMetafields'

jest.mock('@repo/logging', () => ({
    logEvent: jest.fn(),
    SegmentEvent: {
        ShopifyMetafieldsOpenDraftOrder: 'shopify_metafields_open_draft_order',
    },
}))

jest.mock('@gorgias/helpdesk-queries')

const mockLogEvent = logEvent as jest.MockedFunction<typeof logEvent>
const mockUseListShopifyOrderMetafields =
    useListShopifyOrderMetafields as jest.Mock

const mockStore = configureMockStore()
const store = mockStore({
    currentAccount: fromJS({ domain: 'domain' }),
})

describe('DraftOrderMetafields', () => {
    describe('loading state', () => {
        it('should render skeleton loader while fetching metafields', () => {
            mockUseListShopifyOrderMetafields.mockReturnValue({
                isLoading: true,
                data: null,
            })

            const { container } = render(
                <Provider store={store}>
                    <DraftOrderMetafields integrationId={1} draftOrderId={1} />
                </Provider>,
            )

            const elementsByClassName =
                container.getElementsByClassName('loader')

            expect(elementsByClassName[0]).toBeInTheDocument()
            expect(mockUseListShopifyOrderMetafields).toHaveBeenCalled()
        })
    })

    describe('error state', () => {
        it('should render error message when API request fails', () => {
            mockUseListShopifyOrderMetafields.mockReturnValue({
                isError: true,
                data: null,
            })

            render(
                <Provider store={store}>
                    <DraftOrderMetafields integrationId={1} draftOrderId={1} />
                </Provider>,
            )

            expect(mockUseListShopifyOrderMetafields).toHaveBeenCalled()
            expect(
                screen.getByText('Temporarily unavailable, try again later.'),
            ).toBeInTheDocument()
        })
    })

    describe('empty state', () => {
        it.each([
            {
                scenario: 'no metafields are available',
                mockData: {
                    data: {
                        data: {
                            data: [],
                        },
                    },
                },
            },
            {
                scenario: 'data is null',
                mockData: {
                    data: null,
                },
            },
            {
                scenario: 'data is undefined',
                mockData: {
                    data: undefined,
                },
            },
            {
                scenario: 'data.data is null',
                mockData: {
                    data: {
                        data: null,
                    },
                },
            },
            {
                scenario: 'data.data is undefined',
                mockData: {
                    data: {
                        data: undefined,
                    },
                },
            },
            {
                scenario: 'data.data.data is null',
                mockData: {
                    data: {
                        data: {
                            data: null,
                        },
                    },
                },
            },
            {
                scenario: 'data.data.data is undefined',
                mockData: {
                    data: {
                        data: {
                            data: undefined,
                        },
                    },
                },
            },
        ])('should render info message when $scenario', ({ mockData }) => {
            mockUseListShopifyOrderMetafields.mockReturnValue(mockData)

            render(
                <Provider store={store}>
                    <DraftOrderMetafields integrationId={1} draftOrderId={1} />
                </Provider>,
            )

            expect(mockUseListShopifyOrderMetafields).toHaveBeenCalled()
            expect(
                screen.getByText('Draft order has no metafields populated.'),
            ).toBeInTheDocument()
        })
    })

    describe('successful data rendering', () => {
        it('should render metafields when data is available', () => {
            mockUseListShopifyOrderMetafields.mockReturnValue({
                data: {
                    data: {
                        data: [
                            {
                                type: 'single_line_text_field',
                                namespace: 'custom',
                                key: 'custom_field_1',
                                value: 'value_1',
                            },
                            {
                                type: 'single_line_text_field',
                                namespace: 'custom',
                                key: 'custom_field_2',
                                value: 'value_2',
                            },
                        ],
                    },
                },
            })

            render(
                <Provider store={store}>
                    <DraftOrderMetafields integrationId={1} draftOrderId={1} />
                </Provider>,
            )

            expect(mockUseListShopifyOrderMetafields).toHaveBeenCalled()
            expect(screen.getByText('Custom Field 1:')).toBeInTheDocument()
            expect(screen.getByText('value_1')).toBeInTheDocument()
            expect(screen.getByText('Custom Field 2:')).toBeInTheDocument()
            expect(screen.getByText('value_2')).toBeInTheDocument()
        })

        it('should render all metafields from the API response', () => {
            const manyMetafields = Array.from({ length: 5 }, (_, i) => ({
                type: 'single_line_text_field',
                namespace: 'custom',
                key: `field_${i + 1}`,
                value: `value_${i + 1}`,
            }))

            mockUseListShopifyOrderMetafields.mockReturnValue({
                data: {
                    data: {
                        data: manyMetafields,
                    },
                },
            })

            render(
                <Provider store={store}>
                    <DraftOrderMetafields integrationId={1} draftOrderId={1} />
                </Provider>,
            )

            expect(mockUseListShopifyOrderMetafields).toHaveBeenCalled()

            for (let i = 1; i <= 5; i++) {
                expect(screen.getByText(`Field ${i}:`)).toBeInTheDocument()
                expect(screen.getByText(`value_${i}`)).toBeInTheDocument()
            }
        })
    })

    describe('hook options', () => {
        it('should call hook with correct parameters and refetch options disabled', () => {
            mockUseListShopifyOrderMetafields.mockReturnValue({
                data: {
                    data: {
                        data: [],
                    },
                },
            })

            render(
                <Provider store={store}>
                    <DraftOrderMetafields
                        integrationId={123}
                        draftOrderId={456}
                    />
                </Provider>,
            )

            expect(mockUseListShopifyOrderMetafields).toHaveBeenCalledWith(
                123,
                456,
                {
                    query: {
                        refetchInterval: false,
                        refetchIntervalInBackground: false,
                        refetchOnWindowFocus: false,
                        refetchOnReconnect: false,
                        refetchOnMount: false,
                    },
                },
            )
        })
    })
})

describe('WrappedDraftOrderMetafields', () => {
    it('should render with MetafieldsContainer wrapper', () => {
        mockUseListShopifyOrderMetafields.mockReturnValue({
            data: {
                data: {
                    data: [
                        {
                            type: 'single_line_text_field',
                            namespace: 'custom',
                            key: 'custom_field_1',
                            value: 'value_1',
                        },
                    ],
                },
            },
        })

        render(
            <Provider store={store}>
                <WrappedDraftOrderMetafields
                    integrationId={1}
                    draftOrderId={1}
                />
            </Provider>,
        )

        expect(screen.getByText('Draft Order Metafields')).toBeInTheDocument()
        expect(screen.getByTitle('Unfold this card')).toBeInTheDocument()

        const toggleButton = screen.getByTitle('Unfold this card')
        fireEvent.click(toggleButton)

        expect(screen.getByText('Custom Field 1:')).toBeInTheDocument()
        expect(screen.getByText('value_1')).toBeInTheDocument()
    })

    it('should log segment event when onOpened is called', () => {
        mockUseListShopifyOrderMetafields.mockReturnValue({
            data: {
                data: {
                    data: [],
                },
            },
        })

        render(
            <Provider store={store}>
                <WrappedDraftOrderMetafields
                    integrationId={1}
                    draftOrderId={1}
                />
            </Provider>,
        )

        const toggleButton = screen.getByTitle('Unfold this card')
        fireEvent.click(toggleButton)

        expect(mockLogEvent).toHaveBeenCalledWith(
            SegmentEvent.ShopifyMetafieldsOpenDraftOrder,
        )
    })

    it('should render children content when container is expanded', () => {
        mockUseListShopifyOrderMetafields.mockReturnValue({
            data: {
                data: {
                    data: [
                        {
                            type: 'single_line_text_field',
                            namespace: 'custom',
                            key: 'custom_field_1',
                            value: 'value_1',
                        },
                    ],
                },
            },
        })

        render(
            <Provider store={store}>
                <WrappedDraftOrderMetafields
                    integrationId={1}
                    draftOrderId={1}
                />
            </Provider>,
        )

        expect(screen.queryByText('Custom Field 1:')).not.toBeInTheDocument()

        const toggleButton = screen.getByTitle('Unfold this card')
        fireEvent.click(toggleButton)

        expect(screen.getByText('Custom Field 1:')).toBeInTheDocument()
        expect(screen.getByText('value_1')).toBeInTheDocument()
    })
})
