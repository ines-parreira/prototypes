import React from 'react'
import {render, waitFor} from '@testing-library/react'

import userEvent from '@testing-library/user-event'
import {TicketMessageSourceType} from 'business/types/ticket'
import * as useOutboundChannels from 'hooks/useOutboundChannels'

import SenderSelectField from '../SenderSelectField'

const initialState = {
    senders: [
        {
            name: 'John',
            address: 'john@shop.com',
            displayName: 'John (john@shop.com)',
        },
        {
            name: 'Mary',
            address: 'mary@shop.com',
            displayName: 'Mary (mary@shop.com)',
        },
    ],
    selectedSender: {address: 'test', name: 'test', displayName: 'test (test)'},
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
        userEvent.click(getByText('arrow_drop_down'))
        await waitFor(() => {
            expect(getByText('John (john@shop.com)')).toBeInTheDocument()
            expect(getByText('Mary (mary@shop.com)')).toBeInTheDocument()
        })
    })

    it('should trigger a sender change when selecting a sender', async () => {
        const {container, getByText, getByTestId} = render(
            <SenderSelectField />
        )
        userEvent.click(getByText('arrow_drop_down'))
        userEvent.click(getByTestId('John-item'))
        await waitFor(() => {
            const [input] = container.getElementsByClassName('input')
            expect(input.textContent).toBe('John (john@shop.com)')
        })
    })

    it.each([
        [undefined, ''],
        [null, ''],
        [
            {name: `name`, address: 'address', displayName: 'name (address)'},
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
                },
            ],
        })

        const {getByText, queryByText} = render(<SenderSelectField />)
        userEvent.click(getByText('arrow_drop_down'))
        expect(queryByText('John (+1 213 373 4253)')).toBeInTheDocument()
    })
})
