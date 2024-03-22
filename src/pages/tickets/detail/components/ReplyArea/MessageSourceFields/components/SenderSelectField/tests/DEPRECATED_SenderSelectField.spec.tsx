import React from 'react'
import {render, fireEvent} from '@testing-library/react'

import {TicketMessageSourceType} from 'business/types/ticket'
import * as useOutboundChannels from 'hooks/useOutboundChannels'

import SenderSelectField from '../DEPRECATED_SenderSelectField'

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
    selectedSender: undefined,
    selectedChannel: undefined,
    selectSender: jest.fn(),
}

const useSendersForSelectedChannel = jest
    .spyOn(useOutboundChannels, 'useSendersForSelectedChannel')
    .mockReturnValue(initialState)

describe('<SenderSelectField />', () => {
    it('should render a list of senders', () => {
        const {queryByText} = render(<SenderSelectField />)

        expect(queryByText('John (john@shop.com)')).toBeInTheDocument()
        expect(queryByText('Mary (mary@shop.com)')).toBeInTheDocument()
    })

    it('should trigger a sender change when selecting a sender', () => {
        useSendersForSelectedChannel.mockReturnValue(initialState)

        render(<SenderSelectField />)

        fireEvent.change(document.getElementsByTagName('select')[0], {
            target: {value: 'john@shop.com'},
        })

        expect(initialState.selectSender).toHaveBeenCalledWith({
            name: 'John',
            address: 'john@shop.com',
            displayName: 'John (john@shop.com)',
        })
    })

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

        const {queryByText} = render(<SenderSelectField />)

        expect(queryByText('John (+1 213 373 4253)')).toBeInTheDocument()
    })
})
