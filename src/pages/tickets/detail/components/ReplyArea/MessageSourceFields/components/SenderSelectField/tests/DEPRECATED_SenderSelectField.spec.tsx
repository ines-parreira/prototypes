import {render, fireEvent} from '@testing-library/react'
import React from 'react'

import {TicketMessageSourceType} from 'business/types/ticket'
import * as useOutboundChannels from 'hooks/useOutboundChannels'

import SenderSelectField from '../DEPRECATED_SenderSelectField'

const initialState = {
    senders: [
        {
            name: 'John',
            address: 'john@shop.com',
            displayName: 'John (john@shop.com)',
            channel: TicketMessageSourceType.Email,
        },
        {
            name: 'Mary',
            address: 'mary@shop.com',
            displayName: 'Mary (mary@shop.com)',
            channel: TicketMessageSourceType.Email,
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
            channel: 'email',
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
                    channel: TicketMessageSourceType.Phone,
                },
            ],
        })

        const {queryByText} = render(<SenderSelectField />)

        expect(queryByText('John (+1 213 373 4253)')).toBeInTheDocument()
    })

    it('should NOT render deactivated integrations', () => {
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

        const {queryByText} = render(<SenderSelectField />)
        expect(queryByText('John (john@shop.com)')).toBeInTheDocument()
        expect(queryByText('Mary (mary@shop.com)')).toBeInTheDocument()
        expect(
            queryByText('Old John (old-john@shop.com)')
        ).not.toBeInTheDocument()
    })
})
