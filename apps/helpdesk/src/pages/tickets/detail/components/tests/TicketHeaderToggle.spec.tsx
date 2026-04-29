import { assumeMock, render } from '@repo/testing'

import { useSplitTicketView } from 'split-ticket-view-toggle'

import { TicketHeaderToggle } from '../TicketHeaderToggle'

jest.mock('common/navigation/hooks/useShowGlobalNavFeatureFlag', () => ({
    useDesktopOnlyShowGlobalNavFeatureFlag: () => true,
}))

jest.mock('split-ticket-view-toggle', () => ({
    SplitTicketViewToggle: () => <div data-testid="toggle-component" />,
    useSplitTicketView: jest.fn(),
}))
const useSplitTicketViewMock = assumeMock(useSplitTicketView)

type UseSplitTicketViewReturn = ReturnType<typeof useSplitTicketView>

describe('TicketHeaderToggle', () => {
    beforeEach(() => {
        useSplitTicketViewMock.mockReturnValue({
            isEnabled: false,
        } as UseSplitTicketViewReturn)
    })

    const renderWithRouter = (initialPath: string) => {
        return render(<TicketHeaderToggle />, {
            initialEntries: [initialPath],
            path: initialPath.startsWith('/views')
                ? '/views/:viewId/:ticketId'
                : '/ticket/:ticketId',
        })
    }

    it('renders Toggle when dtp is disabled', () => {
        const { getByTestId } = renderWithRouter('/ticket/123')
        expect(getByTestId('toggle-component')).toBeInTheDocument()
    })

    it('renders null when dtp is enabled', () => {
        useSplitTicketViewMock.mockReturnValue({
            isEnabled: true,
        } as UseSplitTicketViewReturn)

        const { container } = renderWithRouter('/views/123/456')
        expect(container.firstChild).toBeNull()
    })
})
