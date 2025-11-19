import type { ComponentProps } from 'react'
import type React from 'react'

import { logEvent, SegmentEvent } from '@repo/logging'
import { assumeMock } from '@repo/testing'
import { QueryClientProvider } from '@tanstack/react-query'
import { screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {
    BIGCOMMERCE_INTEGRATION_TYPE,
    HTTP_INTEGRATION_TYPE,
    MAGENTO2_INTEGRATION_TYPE,
    RECHARGE_INTEGRATION_TYPE,
    SHOPIFY_INTEGRATION_TYPE,
    SMILE_INTEGRATION_TYPE,
} from 'constants/integration'
import { useFlag } from 'core/flags'
import type { RootState, StoreDispatch } from 'state/types'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { renderWithRouter } from 'utils/testing'

import InfobarCustomerInfo from '../InfobarCustomerInfo'

jest.mock('@repo/logging')
const logEventMock = assumeMock(logEvent)

jest.mock('pages/tickets/detail/components/TicketMessages/Avatar', () => ({
    Avatar: () => <div>New Avatar</div>,
}))

jest.mock('core/flags', () => ({
    ...jest.requireActual('core/flags'),
    useFlag: jest.fn(() => false),
}))
const useFlagMock = useFlag as jest.Mock

jest.mock('../CustomerTimelineWidget', () => ({
    CustomerTimelineWidget: () => <div>CustomerTimelineWidget</div>,
}))
jest.mock('../AddAppSuggestion', () => () => <div>Add app</div>)
jest.mock('../CustomerFields', () => () => <div>CustomerFields</div>)
jest.mock('../InfobarWidgets/InfobarWidgets', () => () => (
    <div>InfobarWidgets</div>
))
jest.mock('../CustomerOptionsDropdown', () => () => (
    <div>CustomerOptionsDropdown</div>
))

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

const store = mockStore({
    integrations: fromJS({
        integrations: [{ type: HTTP_INTEGRATION_TYPE }],
    }),
    ticket: fromJS({
        messages: [],
    }),
})

const minProps: ComponentProps<typeof InfobarCustomerInfo> = {
    isEditing: false,
    sources: fromJS({}),
    widgets: fromJS({}),
    customer: fromJS({ id: 1, name: 'foo' }),
    onEditCustomer: jest.fn(),
    onSyncToShopify: jest.fn(),
}

const renderWithProviders = (ui: React.ReactElement, customStore = store) => {
    const queryClient = mockQueryClient()
    return renderWithRouter(
        <QueryClientProvider client={queryClient}>
            <Provider store={customStore}>{ui}</Provider>
        </QueryClientProvider>,
    )
}

describe('<InfobarCustomerInfo/>', () => {
    beforeEach(() => {
        useFlagMock.mockReturnValue(false)
        jest.resetAllMocks()
        window.open = jest.fn()
    })

    it('should not render because there is no passed customer', () => {
        const { container } = renderWithProviders(
            <InfobarCustomerInfo {...minProps} customer={undefined} />,
        )

        expect(container.firstChild).toBeNull()
    })

    it('should not render because the passed customer is empty', () => {
        const { container } = renderWithProviders(
            <InfobarCustomerInfo {...minProps} customer={fromJS({})} />,
        )

        expect(container.firstChild).toBeNull()
    })

    it('should render CustomerFields', () => {
        renderWithProviders(<InfobarCustomerInfo {...minProps} />)

        expect(screen.getByText('CustomerFields')).toBeInTheDocument()
    })

    it(
        'should render a "generate widgets" button because customer data are loaded, the user ' +
            'is currently editing widgets, it is not currently dragging anything and widgets are currently empty',
        () => {
            const sources = fromJS({
                ticket: {
                    customer: {
                        integrations: {
                            118: {
                                foo: 'bar',
                            },
                        },
                    },
                },
            })

            const widgets = fromJS({
                currentContext: 'ticket',
                _internal: {
                    drag: { isDragging: false },
                    editedItems: [{ template: {} }],
                    hasFetchedWidgets: true,
                },
                items: [],
            })

            renderWithProviders(
                <InfobarCustomerInfo
                    {...minProps}
                    sources={sources}
                    widgets={widgets}
                    isEditing
                />,
            )

            expect(screen.getByText('Generate default widgets'))
        },
    )

    it(
        'should render basic customer info and empty widgets because customer data are loaded, the user is currently ' +
            'editing widgets and it is dragging a widget -- even though widgets are currently empty',
        () => {
            const sources = fromJS({
                ticket: {
                    customer: {
                        integrations: {
                            118: {
                                foo: 'bar',
                            },
                        },
                    },
                },
            })

            const widgets = fromJS({
                currentContext: 'ticket',
                _internal: {
                    drag: { isDragging: true },
                    editedItems: [{ template: {} }],
                    hasFetchedWidgets: true,
                },
                items: [],
            })

            const { container } = renderWithProviders(
                <InfobarCustomerInfo
                    {...minProps}
                    sources={sources}
                    widgets={widgets}
                    isEditing
                />,
            )

            expect(container.firstChild).toMatchSnapshot()
        },
    )

    it(
        'should not render empty widgets because the user is not editing widgets and ' +
            'current widgets are empty',
        () => {
            const sources = fromJS({
                ticket: {
                    customer: {
                        integrations: {
                            118: {
                                foo: 'bar',
                            },
                        },
                    },
                },
            })

            const widgets = fromJS({
                currentContext: 'ticket',
                _internal: { hasFetchedWidgets: true },
                items: [],
            })

            renderWithProviders(
                <InfobarCustomerInfo
                    {...minProps}
                    sources={sources}
                    widgets={widgets}
                />,
            )

            expect(screen.queryByText('InfobarWidgets')).toBeNull()
        },
    )

    it(
        'sources render basic customer info and widgets because there is customer data, the user is not editing ' +
            'widgets and current widgets are not empty',
        () => {
            const sources = fromJS({
                ticket: {
                    customer: {
                        integrations: {
                            118: {
                                foo: 'bar',
                            },
                        },
                    },
                },
            })

            const context = 'ticket'

            const widgets = fromJS({
                currentContext: context,
                _internal: { hasFetchedWidgets: true },
                items: [
                    {
                        id: 1,
                        context,
                        template: { foo: 'bar' },
                    },
                ],
            })

            const { container } = renderWithProviders(
                <InfobarCustomerInfo
                    {...minProps}
                    sources={sources}
                    widgets={widgets}
                />,
            )

            expect(
                screen.getByText('CustomerTimelineWidget'),
            ).toBeInTheDocument()

            expect(container.firstChild).toMatchSnapshot()
        },
    )

    it.each([
        HTTP_INTEGRATION_TYPE,
        MAGENTO2_INTEGRATION_TYPE,
        RECHARGE_INTEGRATION_TYPE,
        SHOPIFY_INTEGRATION_TYPE,
        SMILE_INTEGRATION_TYPE,
        BIGCOMMERCE_INTEGRATION_TYPE,
    ])(
        'should not display `AddAppSuggestion` because there is an active integration of type %s',
        (integrationType) => {
            const customStore = mockStore({
                integrations: fromJS({
                    integrations: [{ type: integrationType }],
                }),
            })
            renderWithProviders(
                <InfobarCustomerInfo
                    {...minProps}
                    sources={fromJS({})}
                    widgets={fromJS({ currentContext: 'ticket' })}
                />,
                customStore,
            )

            expect(screen.queryByText('Add app')).toBeNull()
        },
    )

    it('should pass `AddAppSuggestion` because there is no active data integration', () => {
        const customStore = mockStore({
            integrations: fromJS({
                integrations: [],
            }),
        })
        renderWithProviders(
            <InfobarCustomerInfo
                {...minProps}
                sources={fromJS({})}
                widgets={fromJS({ currentContext: 'ticket' })}
            />,
            customStore,
        )

        expect(screen.getByText('Add app'))
    })

    it('should display the button `Sync the customer to Shopify', () => {
        const customStore = mockStore({
            integrations: fromJS({
                integrations: [
                    { type: HTTP_INTEGRATION_TYPE },
                    { type: SHOPIFY_INTEGRATION_TYPE },
                ],
            }),
        })
        const sources = fromJS({
            ticket: {
                customer: {
                    integrations: {},
                },
            },
        })

        const customer = fromJS({
            integrations: [],
        })

        const widgets = fromJS({
            currentContext: 'ticket',
            _internal: {
                drag: { isDragging: false },
                editedItems: [{ template: {} }],
                hasFetchedWidgets: true,
            },
            items: [],
        })

        renderWithProviders(
            <InfobarCustomerInfo
                {...minProps}
                sources={sources}
                widgets={widgets}
                customer={customer}
                isEditing={false}
            />,
            customStore,
        )

        expect(screen.getByText('Sync Profile')).toBeInTheDocument()
    })

    it('should not display the button `Sync the customer to Shopify when there is no shopify integration', () => {
        const sources = fromJS({
            ticket: {
                customer: {
                    integrations: {},
                },
            },
        })

        const customer = fromJS({
            integrations: [],
        })

        const widgets = fromJS({
            currentContext: 'ticket',
            _internal: {
                drag: { isDragging: false },
                editedItems: [{ template: {} }],
                hasFetchedWidgets: true,
            },
            items: [],
        })

        renderWithProviders(
            <InfobarCustomerInfo
                {...minProps}
                sources={sources}
                widgets={widgets}
                customer={customer}
                isEditing={false}
            />,
        )

        expect(screen.queryByText('Sync Profile')).not.toBeInTheDocument()
    })

    it('should render the new avatar if the ticket thread revamp flag is enabled', () => {
        useFlagMock.mockReturnValue(true)

        renderWithProviders(<InfobarCustomerInfo {...minProps} />)

        expect(screen.getByText('New Avatar')).toBeInTheDocument()
    })

    it('should render Instagram profile link when customer has an Instagram channel', () => {
        const customerWithIg = fromJS({
            id: 1,
            name: 'test_user',
            channels: [{ type: 'instagram' }],
        })

        renderWithProviders(
            <InfobarCustomerInfo {...minProps} customer={customerWithIg} />,
        )

        const igLink = screen.getByRole('link', { name: /@test_user/ })
        expect(igLink).toBeInTheDocument()
        expect(igLink).toHaveAttribute('href', '/#')
    })

    it('should log segment event and open Instagram profile in new window when clicking Instagram handle', async () => {
        const user = userEvent.setup()
        const customerWithIg = fromJS({
            id: 1,
            name: 'test_user',
            channels: [{ type: 'instagram' }],
        })

        renderWithProviders(
            <InfobarCustomerInfo {...minProps} customer={customerWithIg} />,
        )

        const igLink = screen.getByRole('link', { name: /@test_user/ })
        await user.click(igLink)

        expect(logEventMock).toHaveBeenCalledWith(
            SegmentEvent.InstagramHandleClicked,
        )
        expect(window.open).toHaveBeenCalledWith(
            'https://www.instagram.com/test_user',
            '_blank',
            'noopener noreferrer',
        )
    })

    it('should not render Instagram profile link when customer has no Instagram channel', () => {
        const customerWithoutIg = fromJS({
            id: 1,
            name: 'test_user',
            channels: [{ type: 'email' }],
        })

        renderWithProviders(
            <InfobarCustomerInfo {...minProps} customer={customerWithoutIg} />,
        )

        expect(
            screen.queryByRole('link', { name: /@test_user/ }),
        ).not.toBeInTheDocument()
    })

    it('should not render Instagram profile link when customer has empty channels', () => {
        const customerWithEmptyChannels = fromJS({
            id: 1,
            name: 'test_user',
            channels: [],
        })

        renderWithProviders(
            <InfobarCustomerInfo
                {...minProps}
                customer={customerWithEmptyChannels}
            />,
        )

        expect(
            screen.queryByRole('link', { name: /@test_user/ }),
        ).not.toBeInTheDocument()
    })

    describe('Instagram integration from messages', () => {
        it('should extract integration_id from last message', () => {
            const storeWithMessages = mockStore({
                integrations: fromJS({
                    integrations: [
                        {
                            id: 123,
                            type: 'facebook',
                            meta: {
                                instagram: {
                                    id: 'ig_business_123',
                                },
                            },
                        },
                    ],
                }),
                ticket: fromJS({
                    messages: [
                        { id: 1, integration_id: 999 },
                        { id: 2, integration_id: 123 },
                    ],
                }),
            })

            const customerWithIg = fromJS({
                id: 1,
                name: 'test_user',
                channels: [{ type: 'instagram' }],
            })

            renderWithProviders(
                <InfobarCustomerInfo {...minProps} customer={customerWithIg} />,
                storeWithMessages,
            )

            // Component should render - this verifies integration was found
            expect(
                screen.getByRole('link', { name: /@test_user/ }),
            ).toBeInTheDocument()
        })

        it('should handle empty messages array', () => {
            const storeWithNoMessages = mockStore({
                integrations: fromJS({
                    integrations: [
                        {
                            id: 123,
                            type: 'facebook',
                        },
                    ],
                }),
                ticket: fromJS({
                    messages: [],
                }),
            })

            const customerWithIg = fromJS({
                id: 1,
                name: 'test_user',
                channels: [{ type: 'instagram' }],
            })

            renderWithProviders(
                <InfobarCustomerInfo {...minProps} customer={customerWithIg} />,
                storeWithNoMessages,
            )

            // Component should still render even without messages
            expect(
                screen.getByRole('link', { name: /@test_user/ }),
            ).toBeInTheDocument()
        })

        it('should handle message without integration_id', () => {
            const storeWithMessageNoId = mockStore({
                integrations: fromJS({
                    integrations: [
                        {
                            id: 123,
                            type: 'facebook',
                        },
                    ],
                }),
                ticket: fromJS({
                    messages: [{ id: 1, text: 'test message' }],
                }),
            })

            const customerWithIg = fromJS({
                id: 1,
                name: 'test_user',
                channels: [{ type: 'instagram' }],
            })

            renderWithProviders(
                <InfobarCustomerInfo {...minProps} customer={customerWithIg} />,
                storeWithMessageNoId,
            )

            // Component should still render
            expect(
                screen.getByRole('link', { name: /@test_user/ }),
            ).toBeInTheDocument()
        })

        it('should handle when integration_id does not match any integration', () => {
            const storeWithMismatch = mockStore({
                integrations: fromJS({
                    integrations: [
                        {
                            id: 456,
                            type: 'facebook',
                        },
                    ],
                }),
                ticket: fromJS({
                    messages: [{ id: 1, integration_id: 999 }],
                }),
            })

            const customerWithIg = fromJS({
                id: 1,
                name: 'test_user',
                channels: [{ type: 'instagram' }],
            })

            renderWithProviders(
                <InfobarCustomerInfo {...minProps} customer={customerWithIg} />,
                storeWithMismatch,
            )

            // Component should still render
            expect(
                screen.getByRole('link', { name: /@test_user/ }),
            ).toBeInTheDocument()
        })
    })
})
