import React, {forwardRef} from 'react'

import {act} from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import useConditionalShortcuts from 'hooks/useConditionalShortcuts'
import CreateTicketButton from 'pages/common/components/CreateTicket/CreateTicketButton'
import {flushPromises, renderWithRouter} from 'utils/testing'

import useHandleTicketDraft from '../useHandleTicketDraft'

jest.mock('hooks/useConditionalShortcuts', () => jest.fn())

jest.mock('../useHandleTicketDraft')
const mockUseHandleTicketDraft = useHandleTicketDraft as jest.Mock

describe('<CreateTicketButton />', () => {
    beforeEach(() => {
        mockUseHandleTicketDraft.mockReturnValue({
            hasDraft: true,
            onResumeDraft: jest.fn(),
            onDiscardDraft: jest.fn(),
        })
    })

    it('should render draft dropdown when there is a draft', () => {
        const {getByText, queryByText} = renderWithRouter(
            <CreateTicketButton />
        )

        const createTicketButton = getByText('Create ticket')
        userEvent.click(createTicketButton)

        expect(queryByText('Resume draft')).toBeInTheDocument()
        expect(queryByText('Discard and create new ticket')).toBeInTheDocument()
    })

    it('should not render draft dropdown when there is a draft', () => {
        mockUseHandleTicketDraft.mockReturnValue({
            hasDraft: false,
            onResumeDraft: jest.fn(),
            onDiscardDraft: jest.fn(),
        })
        const {getByText, queryByText} = renderWithRouter(
            <CreateTicketButton />
        )

        const createTicketButton = getByText('Create ticket')
        userEvent.click(createTicketButton)

        expect(queryByText('Resume draft')).not.toBeInTheDocument()
        expect(
            queryByText('Discard and create new ticket')
        ).not.toBeInTheDocument()
    })

    it('should allow passing a custom trigger', async () => {
        const {getByText} = renderWithRouter(
            <CreateTicketButton trigger={<button>Custom trigger</button>} />
        )
        await act(flushPromises)

        expect(getByText('Custom trigger')).toBeInTheDocument()
    })

    it('should allow passing a custom dropdown trigger', async () => {
        const CustomTrigger = forwardRef((_, ref) => (
            <button>{JSON.stringify(ref)}</button>
        ))

        const {getByText} = renderWithRouter(
            <CreateTicketButton trigger={<CustomTrigger />} />
        )
        await act(flushPromises)

        expect(getByText('{"current":null}')).toBeInTheDocument()
    })

    it('should bind keyboard shortcuts', () => {
        renderWithRouter(<CreateTicketButton shouldBindKeys />)
        expect(useConditionalShortcuts).toHaveBeenCalledWith(
            true,
            'CreateTicketButton',
            expect.objectContaining({
                CREATE_TICKET: {
                    action: expect.any(Function),
                },
            })
        )
    })

    it('should not bind keyboard shortcuts', () => {
        renderWithRouter(<CreateTicketButton />)
        expect(useConditionalShortcuts).toHaveBeenCalledWith(
            false,
            'CreateTicketButton',
            expect.objectContaining({
                CREATE_TICKET: {
                    action: expect.any(Function),
                },
            })
        )
    })
})
