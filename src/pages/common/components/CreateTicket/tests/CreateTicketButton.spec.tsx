import useConditionalShortcuts from 'hooks/useConditionalShortcuts'
import CreateTicketButton from 'pages/common/components/CreateTicket/CreateTicketButton'
import { renderWithRouter } from 'utils/testing'
import { userEvent } from 'utils/testing/userEvent'

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
        const { getByText, queryByText } = renderWithRouter(
            <CreateTicketButton />,
        )

        const createTicketButton = getByText('Create ticket')
        userEvent.click(createTicketButton)

        expect(queryByText('Resume draft')).toBeInTheDocument()
        expect(queryByText('Discard and create new ticket')).toBeInTheDocument()
    })

    it('should not render draft dropdown when there is not a draft', () => {
        mockUseHandleTicketDraft.mockReturnValue({
            hasDraft: false,
            onResumeDraft: jest.fn(),
            onDiscardDraft: jest.fn(),
        })
        const { getByText, queryByText } = renderWithRouter(
            <CreateTicketButton />,
        )

        const createTicketButton = getByText('Create ticket')
        userEvent.click(createTicketButton)

        expect(queryByText('Resume draft')).not.toBeInTheDocument()
        expect(
            queryByText('Discard and create new ticket'),
        ).not.toBeInTheDocument()
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
            }),
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
            }),
        )
    })

    describe('custom link and button props', () => {
        it('should display for existing draft', () => {
            const { getByText, getByRole } = renderWithRouter(
                <CreateTicketButton
                    buttonProps={{ intent: 'secondary' }}
                    to={{
                        pathname: `/custom/path`,
                    }}
                />,
            )

            const buttonClasses = getByRole('button', {
                name: 'Create ticket',
            }).classList
            expect(buttonClasses).toContain('secondary')
            expect(buttonClasses).not.toContain('primary')
            const arrowClasses =
                getByText('arrow_drop_down').closest('button')?.classList
            expect(arrowClasses).toContain('secondary')
            expect(arrowClasses).not.toContain('primary')
        })

        it('should display for empty draft', () => {
            mockUseHandleTicketDraft.mockReturnValue({
                hasDraft: false,
                onResumeDraft: jest.fn(),
                onDiscardDraft: jest.fn(),
            })

            const { getByRole } = renderWithRouter(
                <CreateTicketButton
                    buttonProps={{ intent: 'secondary' }}
                    to={{
                        pathname: `/custom/path`,
                    }}
                />,
            )

            const buttonClasses = getByRole('button', {
                name: 'Create ticket',
            }).classList
            expect(buttonClasses).not.toContain('primary')
        })
    })
})
