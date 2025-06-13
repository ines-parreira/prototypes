import React from 'react'

import { render } from '@testing-library/react'
import { fromJS } from 'immutable'
import _noop from 'lodash/noop'
import { Provider } from 'react-redux'
import { VirtuosoProps } from 'react-virtuoso'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { voiceCall } from 'fixtures/voiceCalls'
import useSearch from 'hooks/useSearch'
import { message as defaultMessage } from 'models/ticket/tests/mocks'
import TicketBody from 'pages/tickets/detail/components/TicketBody'
import TicketBodyElement from 'pages/tickets/detail/components/TicketBodyElement'
import {
    ShoppingAssistantEvent,
    useInsertShoppingAssistantEventElements,
} from 'pages/tickets/detail/hooks/useInsertShoppingAssistantEventElements'
import { getQueryData } from 'state/queries/selectors'
import { assumeMock } from 'utils/testing'

const mockStore = configureMockStore([thunk])

interface VirtuosoMockProps {
    components: {
        Item: React.FC<any>
    }
}
const mockVirtuoso = jest.fn<
    VirtuosoMockProps,
    [VirtuosoProps<unknown, unknown>]
>()

jest.mock('pages/tickets/detail/components/TicketBodyElement', () =>
    jest.fn(({ index }: { index: number }) => <p>TicketBodyElement {index}</p>),
)

jest.mock(
    'pages/tickets/detail/components/TicketHeaderWrapper/TicketHeaderWrapper',
    () => () => <p>TicketHeaderWrapper</p>,
)

jest.mock(
    'state/queries/selectors',
    () =>
        ({
            ...jest.requireActual('state/queries/selectors'),
            getQueryTimestamp: jest.fn(() => jest.fn()),
        }) as Record<string, unknown>,
)

jest.mock('state/billing/selectors')

jest.mock('react-virtuoso', () => {
    const { forwardRef, Fragment } = jest.requireActual('react')
    //eslint-disable-next-line @typescript-eslint/no-unused-vars
    function Virtuoso(props: VirtuosoProps<unknown, unknown>, _ref: any) {
        mockVirtuoso(props)
        return (
            <>
                {props.data?.map((value, index) => (
                    <Fragment key={index}>
                        {props.itemContent?.(index, value, undefined)}
                    </Fragment>
                ))}
            </>
        )
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    return { Virtuoso: forwardRef(Virtuoso) }
})

const mockTicketBodyElement = assumeMock(TicketBodyElement)

jest.mock('hooks/useSearch')
const mockUseSearch = assumeMock(useSearch)

jest.mock(
    'state/queries/selectors',
    () =>
        ({
            ...jest.requireActual('state/queries/selectors'),
            getQueryData: jest.fn(() => jest.fn()),
        }) as Record<string, unknown>,
)
const mockGetQueryData = assumeMock(getQueryData)

jest.mock(
    'pages/tickets/detail/hooks/useInsertShoppingAssistantEventElements',
    () => ({
        useInsertShoppingAssistantEventElements: jest.fn(),
    }),
)
const mockUseInsertShoppingAssistantEventElements = assumeMock(
    useInsertShoppingAssistantEventElements,
)

describe('TicketBody', () => {
    beforeEach(() => {
        mockTicketBodyElement.mockClear()
        mockUseSearch.mockReturnValue({ call_id: undefined })
        mockUseInsertShoppingAssistantEventElements.mockReset()
        mockUseInsertShoppingAssistantEventElements.mockImplementation(
            (elements) => elements,
        )

        mockGetQueryData.mockReturnValue(jest.fn() as any)
    })

    it('should render an element for each given element', () => {
        const { getByText } = render(
            <Provider
                store={mockStore({
                    ticket: fromJS({
                        messages: fromJS([defaultMessage, defaultMessage]),
                    }),
                })}
            >
                <TicketBody
                    elements={fromJS([])}
                    hideTicket={() => Promise.resolve()}
                    isShopperTyping={false}
                    setStatus={_noop}
                    shopperName=""
                    submit={_noop}
                />
            </Provider>,
        )

        expect(getByText('TicketHeaderWrapper')).toBeInTheDocument()
        expect(getByText('TicketBodyElement 1')).toBeInTheDocument()
        expect(getByText('TicketBodyElement 2')).toBeInTheDocument()
    })

    it('should correctly pass `isLast` for the last element', () => {
        render(
            <Provider
                store={mockStore({
                    ticket: fromJS({
                        messages: fromJS([defaultMessage, defaultMessage]),
                    }),
                })}
            >
                <TicketBody
                    elements={fromJS([defaultMessage, defaultMessage])}
                    hideTicket={() => Promise.resolve()}
                    isShopperTyping={false}
                    setStatus={_noop}
                    shopperName=""
                    submit={_noop}
                />
            </Provider>,
        )

        expect(TicketBodyElement).toHaveBeenNthCalledWith(
            1,
            expect.objectContaining({ isLast: false }),
            {},
        )
        expect(TicketBodyElement).toHaveBeenNthCalledWith(
            2,
            expect.objectContaining({ isLast: true }),
            {},
        )
    })

    it('should pass correct props to the Item component', () => {
        // Render the component
        render(
            <Provider store={mockStore({})}>
                <TicketBody
                    elements={fromJS([defaultMessage, defaultMessage])}
                    hideTicket={() => Promise.resolve()}
                    isShopperTyping={false}
                    setStatus={() => {}}
                    shopperName=""
                    submit={() => {}}
                />
            </Provider>,
        )

        // Check if Virtuoso is called with the correct component props
        expect(mockVirtuoso).toHaveBeenCalledWith(
            expect.objectContaining({
                components: expect.objectContaining({
                    Item: expect.any(Function),
                }),
            }),
        )

        // Extract the Item function from Virtuoso call
        const virtuosoCall = mockVirtuoso.mock.calls[0][0]

        expect(virtuosoCall).toBeDefined()
        expect(virtuosoCall?.components).toBeDefined()

        if (virtuosoCall && virtuosoCall.components) {
            // Render the Item component manually and check if it receives the correct props
            const ItemComponent = virtuosoCall.components.Item as React.FC<any>
            const mockProps = {
                style: { margin: '5px' },
                children: <p>Test Item Content</p>,
            }

            const { getByText } = render(<ItemComponent {...mockProps} />)

            const itemElement = getByText('Test Item Content')

            expect(itemElement).toBeInTheDocument()
            expect(itemElement.parentElement).toHaveStyle(
                'position: relative; margin: 5px',
            )
        }
    })

    it('should scroll to the voice call', () => {
        mockUseSearch.mockReturnValue({ call_id: voiceCall.id })
        // @ts-ignore
        mockGetQueryData.mockReturnValue(() => ({
            data: [voiceCall],
        }))
        const { getByText } = render(
            <Provider
                store={mockStore({
                    ticket: fromJS({
                        messages: fromJS([defaultMessage]),
                    }),
                })}
            >
                <TicketBody
                    elements={fromJS([defaultMessage])}
                    hideTicket={() => Promise.resolve()}
                    isShopperTyping={false}
                    setStatus={() => {}}
                    shopperName=""
                    submit={() => {}}
                />
            </Provider>,
        )
        expect(getByText('TicketHeaderWrapper')).toBeInTheDocument()
        expect(getByText(`TicketBodyElement 1`)).toBeInTheDocument()
        expect(getByText(`TicketBodyElement 2`)).toBeInTheDocument()

        // Check if Virtuoso is called with the correct component props
        expect(mockVirtuoso).toHaveBeenCalledWith(
            expect.objectContaining({
                initialTopMostItemIndex: { index: 2 },
            }),
        )
    })

    it('should not scroll if no voice call is passed', () => {
        mockUseSearch.mockReturnValue({ call_id: undefined })
        // @ts-ignore
        mockGetQueryData.mockReturnValue(() => ({
            data: [voiceCall],
        }))
        const { getByText } = render(
            <Provider
                store={mockStore({
                    ticket: fromJS({
                        messages: fromJS([defaultMessage]),
                    }),
                })}
            >
                <TicketBody
                    elements={fromJS([defaultMessage])}
                    hideTicket={() => Promise.resolve()}
                    isShopperTyping={false}
                    setStatus={() => {}}
                    shopperName=""
                    submit={() => {}}
                />
            </Provider>,
        )
        expect(getByText('TicketHeaderWrapper')).toBeInTheDocument()
        expect(getByText(`TicketBodyElement 1`)).toBeInTheDocument()
        expect(getByText(`TicketBodyElement 2`)).toBeInTheDocument()

        // Check if Virtuoso is called with the correct component props
        expect(mockVirtuoso).toHaveBeenCalledWith(
            expect.objectContaining({
                initialTopMostItemIndex: { index: 'LAST' },
            }),
        )
    })

    it('should handle shopping assistant events correctly', () => {
        // Create a mock shopping assistant event
        const shoppingAssistantEvent: ShoppingAssistantEvent = {
            isShoppingAssistantEvent: true,
            type: 'influenced-order' as const, // Use const assertion to match the exact type
            created_datetime: '2023-01-01T12:00:00Z',
            data: {
                orderId: 123,
                orderNumber: 456,
                shopName: 'Test Shop',
                createdDatetime: '2023-01-01T12:00:00Z',
            },
        }

        mockUseInsertShoppingAssistantEventElements.mockReturnValue([
            defaultMessage,
            shoppingAssistantEvent,
        ])

        const { getByText } = render(
            <Provider
                store={mockStore({
                    ticket: fromJS({ messages: fromJS([defaultMessage]) }),
                })}
            >
                <TicketBody
                    elements={fromJS([defaultMessage])}
                    hideTicket={() => Promise.resolve()}
                    isShopperTyping={false}
                    setStatus={() => {}}
                    shopperName=""
                    submit={() => {}}
                />
            </Provider>,
        )

        expect(getByText('TicketHeaderWrapper')).toBeInTheDocument()
        expect(getByText('TicketBodyElement 1')).toBeInTheDocument() // defaultMessage
        expect(getByText('TicketBodyElement 2')).toBeInTheDocument() // shoppingAssistantEvent

        expect(
            mockUseInsertShoppingAssistantEventElements,
        ).toHaveBeenCalledWith([[defaultMessage]])
    })
})
