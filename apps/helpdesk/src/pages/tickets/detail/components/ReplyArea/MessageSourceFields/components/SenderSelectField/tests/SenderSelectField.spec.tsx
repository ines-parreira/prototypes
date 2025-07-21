import React from 'react'

import { createEvent, fireEvent, render, waitFor } from '@testing-library/react'

import { TicketMessageSourceType } from 'business/types/ticket'
import { useFlag } from 'core/flags'
import * as useOutboundChannels from 'hooks/useOutboundChannels'
import { assumeMock } from 'utils/testing'

import SenderSelectField from '../SenderSelectField'

jest.mock('core/flags', () => ({
    useFlag: jest.fn(),
}))

const mockUseFlag = assumeMock(useFlag)

const initialState = {
    senders: [
        {
            name: 'John',
            address: 'john@shop.com',
            displayName: 'John (john@shop.com)',
            channel: 'email',
            isDefault: true,
        },
        {
            name: 'Mary',
            address: 'mary@shop.com',
            displayName: 'Mary (mary@shop.com)',
            channel: 'email',
            isDefault: false,
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
        const { getByText } = render(<SenderSelectField />)
        fireEvent.click(getByText('arrow_drop_down'))
        await waitFor(() => {
            expect(getByText('John (john@shop.com)')).toBeInTheDocument()
            expect(getByText('Mary (mary@shop.com)')).toBeInTheDocument()
        })
    })

    it('should trigger a sender change when selecting a sender', async () => {
        const { container, getByText, getByTestId } = render(
            <SenderSelectField />,
        )
        fireEvent.click(getByText('arrow_drop_down'))
        fireEvent.click(getByTestId('John-item'))
        await waitFor(() => {
            const [input] = container.getElementsByClassName('input')
            expect(input.textContent).toBe('John (john@shop.com)')
        })
    })

    it('should render the default tag for the default integration', async () => {
        mockUseFlag.mockReturnValue(true)
        const { getByText } = render(<SenderSelectField />)
        fireEvent.click(getByText('arrow_drop_down'))
        await waitFor(() => {
            expect(getByText('DEFAULT')).toBeInTheDocument()
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

            const { container } = render(<SenderSelectField />)
            const [input] = container.getElementsByClassName('input')
            expect(input.textContent).toBe(expected)
        },
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

        const { getByText, queryByText } = render(<SenderSelectField />)
        fireEvent.click(getByText('arrow_drop_down'))
        expect(queryByText('John (+1 213 373 4253)')).toBeInTheDocument()
    })

    it('should render deactivated integrations', () => {
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
        const { getByText, queryByText } = render(<SenderSelectField />)
        fireEvent.click(getByText('arrow_drop_down'))
        expect(queryByText('Old John (old-john@shop.com)')).toBeInTheDocument()
    })

    it('should block onBlur event when clicking on the DropdownBody scrollbar / body', () => {
        const { getByText, getAllByRole, rerender } = render(
            <SenderSelectField />,
        )

        fireEvent.click(getByText('arrow_drop_down'))

        rerender(<SenderSelectField />)

        const dropdownBody = getAllByRole('option')[0].parentElement
        const event = createEvent.mouseDown(dropdownBody!)
        fireEvent(dropdownBody!, event)

        expect(event.defaultPrevented).toBe(true)
    })

    it('should not block onBlur event when not clicking on scrollbar / body', () => {
        const { getByText, getAllByRole, rerender } = render(
            <SenderSelectField />,
        )

        fireEvent.click(getByText('arrow_drop_down'))

        rerender(<SenderSelectField />)

        const dropdownItem = getAllByRole('option')[0]
        const event = createEvent.mouseDown(dropdownItem!)
        fireEvent(dropdownItem!, event)

        expect(event.defaultPrevented).toBe(false)
    })
})
