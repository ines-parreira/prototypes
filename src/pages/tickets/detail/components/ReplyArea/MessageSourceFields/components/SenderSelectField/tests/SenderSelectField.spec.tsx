import React from 'react'
import {render, waitFor, fireEvent} from '@testing-library/react'

import {TicketMessageSourceType} from 'business/types/ticket'
import * as useOutboundChannels from 'hooks/useOutboundChannels'
import history from 'pages/history'

import SenderSelectField from '../SenderSelectField'

jest.mock('pages/history')

const initialState = {
    senders: [
        {
            name: 'John',
            address: 'john@shop.com',
            displayName: 'John (john@shop.com)',
            channel: 'email',
        },
        {
            name: 'Mary',
            address: 'mary@shop.com',
            displayName: 'Mary (mary@shop.com)',
            channel: 'email',
        },
    ],
    selectedSender: {
        address: 'test',
        name: 'test',
        displayName: 'test (test)',
        channel: TicketMessageSourceType.Email,
    } as useOutboundChannels.Sender,
    selectedChannel: undefined,
    selectSender: (sender: useOutboundChannels.Sender) => {
        initialState.selectedSender = sender
    },
}

const useSendersForSelectedChannel = jest
    .spyOn(useOutboundChannels, 'useSendersForSelectedChannel')
    .mockReturnValue(initialState)

describe('<SenderSelectField />', () => {
    it('should render a list of senders', async () => {
        const {getByText} = render(<SenderSelectField />)
        fireEvent.click(getByText('arrow_drop_down'))
        await waitFor(() => {
            expect(getByText('John (john@shop.com)')).toBeInTheDocument()
            expect(getByText('Mary (mary@shop.com)')).toBeInTheDocument()
        })
    })

    it('should trigger a sender change when selecting a sender', async () => {
        const {container, getByText, getByTestId} = render(
            <SenderSelectField />
        )
        fireEvent.click(getByText('arrow_drop_down'))
        fireEvent.click(getByTestId('John-item'))
        await waitFor(() => {
            const [input] = container.getElementsByClassName('input')
            expect(input.textContent).toBe('John (john@shop.com)')
        })
    })

    it.each([
        [undefined, ''],
        [null, ''],
        [
            {
                name: `name`,
                address: 'address',
                displayName: 'name (address)',
                channel: 'email',
            },
            'name (address)',
        ],
    ])(
        'should render the correct based on the selected sender',
        (selectedSender, expected) => {
            useSendersForSelectedChannel.mockReturnValue({
                ...initialState,
                selectedSender,
            })

            const {container} = render(<SenderSelectField />)
            const [input] = container.getElementsByClassName('input')
            expect(input.textContent).toBe(expected)
        }
    )

    it('should format addresses (ie. phone numbers)', () => {
        useSendersForSelectedChannel.mockReturnValue({
            ...initialState,
            selectedChannel: TicketMessageSourceType.Phone,
            senders: [
                {
                    name: 'John',
                    address: '+12133734253',
                    displayName: 'John (+1 213 373 4253)',
                    channel: TicketMessageSourceType.Phone,
                },
            ],
        })

        const {getByText, queryByText} = render(<SenderSelectField />)
        fireEvent.click(getByText('arrow_drop_down'))
        expect(queryByText('John (+1 213 373 4253)')).toBeInTheDocument()
    })

    describe('deactivated integrations', () => {
        beforeEach(() => {
            useSendersForSelectedChannel.mockReturnValue({
                ...initialState,
                selectedChannel: TicketMessageSourceType.Email,
                senders: [
                    ...initialState.senders,
                    {
                        name: 'Old John',
                        address: 'old-john@shop.com',
                        displayName: 'Old John (old-john@shop.com)',
                        channel: 'email',
                        isDeactivated: true,
                    },
                ],
            })
        })

        it('it should render deactivated integrations', () => {
            const {getByText, queryByText} = render(<SenderSelectField />)
            fireEvent.click(getByText('arrow_drop_down'))
            expect(
                queryByText('Old John (old-john@shop.com)')
            ).toBeInTheDocument()
        })

        it('it should not allow selecting deactivated integrations', async () => {
            const {container, getByText, queryByText} = render(
                <SenderSelectField />
            )
            fireEvent.click(getByText('arrow_drop_down'))
            expect(
                queryByText('Old John (old-john@shop.com)')
            ).toBeInTheDocument()
            fireEvent.click(getByText('Old John (old-john@shop.com)'))
            await waitFor(() => {
                const [input] = container.getElementsByClassName('input')
                expect(input.textContent).toBe('John (john@shop.com)')
            })
        })

        it('it should render a reconnect button for deactivated integrations', () => {
            const {container, getByText, queryByText} = render(
                <SenderSelectField />
            )
            fireEvent.click(getByText('arrow_drop_down'))
            expect(
                queryByText('Old John (old-john@shop.com)')
            ).toBeInTheDocument()
            const [button] = container.getElementsByTagName('button')
            expect(button).toBeInTheDocument()
            fireEvent.click(button)
            expect(history.push).toHaveBeenCalledWith(
                `/app/settings/channels/email`
            )
        })
    })
})
