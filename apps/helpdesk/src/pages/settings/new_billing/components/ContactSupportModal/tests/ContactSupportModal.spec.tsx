import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MockAdapter from 'axios-mock-adapter'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'

import { account } from 'fixtures/account'
import { billingState } from 'fixtures/billing'
import { HELPDESK_PRODUCT_ID } from 'fixtures/productPrices'
import client from 'models/api/resources'
import { TicketPurpose } from 'state/billing/types'
import * as actions from 'state/notifications/actions'
import { RootState, StoreDispatch } from 'state/types'

import ContactSupportModal from '../ContactSupportModal'

const mockedStore = configureMockStore<DeepPartial<RootState>, StoreDispatch>()

const mockHistoryPush = jest.fn()
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useHistory: () => ({
        block: jest.fn(),
        push: mockHistoryPush,
    }),
}))

const store = mockedStore({
    billing: fromJS(billingState),
    currentAccount: fromJS(account),
})

const mockedServer = new MockAdapter(client)

const mockHandleClose = jest.fn()
const mockedDispatch = jest.fn()
jest.mock('hooks/useAppDispatch', () => () => mockedDispatch)

jest.mock('state/notifications/actions', () => ({
    notify: jest.fn(() => () => undefined),
}))

const notify = actions.notify as jest.Mock

describe('ContactSupportModal', () => {
    beforeEach(() => {
        jest.resetAllMocks()
        mockedServer.reset()
    })

    it('should render the modal with default message', () => {
        const props = {
            isOpen: true,
            domain: 'acme',
            handleOnClose: mockHandleClose,
            ticketPurpose: TicketPurpose.CONTACT_US,
            subject: 'Support Request',
            zapierHook: 'https://example.com',
            to: 'support@example.com',
            from: 'user@example.com',
        }

        render(
            <Provider store={store}>
                <ContactSupportModal {...props} />
            </Provider>,
        )

        expect(screen.getByText('Contact us')).toBeInTheDocument()
        expect(
            screen.getByText('Tell us more about your request'),
        ).toBeInTheDocument()
        expect(
            screen.getByPlaceholderText('Write your message here'),
        ).toBeInTheDocument()
        expect(screen.getByText('Cancel')).toBeInTheDocument()
        expect(screen.getByText('Send')).toBeInTheDocument()
        expect(
            screen.getByText(
                'Our team will send you a reply to user@example.com',
            ),
        ).toBeInTheDocument()
    })

    it('should send a support ticket and close the modal on Send button click', async () => {
        const zapierHook = 'https://example.com'

        mockedServer.onGet().reply(200)

        const props = {
            isOpen: true,
            domain: 'acme',
            handleOnClose: mockHandleClose,
            ticketPurpose: TicketPurpose.CONTACT_US,
            subject: 'Support Request',
            zapierHook,
            to: 'support@example.com',
            from: 'user@example.com',
        }

        render(
            <Provider store={store}>
                <ContactSupportModal {...props} />
            </Provider>,
        )

        const messageInput = screen.getByPlaceholderText(
            'Write your message here',
        )
        const sendButton = screen.getByText('Send')

        await act(() =>
            userEvent.type(messageInput, 'This is my support ticket'),
        )
        await act(() => userEvent.click(sendButton))

        expect(notify).toHaveBeenCalledWith({
            message: `Your request has been submitted. We'll get back to you by email at ${props.from} within 24 business hours`,
            status: 'success',
            dismissAfter: 5000,
            showDismissButton: true,
        })

        // Assert that the handleOnClose function is called
        expect(mockHandleClose).toHaveBeenCalledTimes(1)
    })

    it('should send a support ticket and close the modal on Send button click, handling undefined helpdesk plans', async () => {
        mockedServer.onGet().reply(200)

        const props = {
            isOpen: true,
            domain: 'acme',
            handleOnClose: mockHandleClose,
            ticketPurpose: TicketPurpose.CONTACT_US,
            subject: 'Support Request',
            zapierHook: 'https://example.com',
            to: 'support@example.com',
            from: 'user@example.com',
        }

        const modifiedStore = mockedStore({
            billing: fromJS(billingState),
            currentAccount: fromJS({
                ...account,
                current_subscription: {
                    ...account.current_subscription,
                    products: {
                        ...account.current_subscription.products,
                        [HELPDESK_PRODUCT_ID]: undefined,
                    },
                },
            }),
        })

        render(
            <Provider store={modifiedStore}>
                <ContactSupportModal {...props} />
            </Provider>,
        )

        const messageInput = screen.getByPlaceholderText(
            'Write your message here',
        )
        const sendButton = screen.getByText('Send')

        await act(() =>
            userEvent.type(messageInput, 'This is my support ticket'),
        )
        await act(() => userEvent.click(sendButton))
    })

    it('should display an error notification if there is an error sending the support ticket', async () => {
        // Mock the sendSupportTicket function to throw an error
        mockedServer.onGet().networkError()

        const props = {
            isOpen: true,
            handleOnClose: mockHandleClose,
            ticketPurpose: TicketPurpose.CONTACT_US,
            domain: 'acme',
            subject: 'Support Request',
            zapierHook: 'https://example.com',
            to: 'support@example.com',
            from: 'user@example.com',
            freeTrial: false,
            helpdeskPlan: 'Advanced',
            account: 'acme',
        }

        render(
            <Provider store={store}>
                <ContactSupportModal {...props} />
            </Provider>,
        )

        const messageInput = screen.getByPlaceholderText(
            'Write your message here',
        )
        const sendButton = screen.getByText('Send')

        await act(() =>
            userEvent.type(messageInput, 'This is my support ticket'),
        )
        await act(() => userEvent.click(sendButton))

        expect(notify).toHaveBeenCalledWith({
            status: 'error',
            message:
                'There was an error sending your message. Please try again later.',
        })

        expect(mockHandleClose).toHaveBeenCalledTimes(1)
    })
})
