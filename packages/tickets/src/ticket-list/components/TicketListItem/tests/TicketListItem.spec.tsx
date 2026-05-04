import { screen } from '@testing-library/react'
import { useLocation } from 'react-router-dom'

import { mockTicketCompact } from '@gorgias/helpdesk-mocks'
import { Language } from '@gorgias/helpdesk-types'

import { render } from '../../../../tests/render.utils'
import { TicketListItem } from '../TicketListItem'

vi.mock('@gorgias/realtime', () => ({
    useAgentActivity: () => ({
        getTicketActivity: vi.fn().mockReturnValue({ viewing: [] }),
    }),
}))

vi.mock(
    '../../../../translations/hooks/useCurrentUserLanguagePreferences',
    () => ({
        useCurrentUserLanguagePreferences: () => ({
            isFetching: false,
            primary: Language.Fr,
            proficient: [],
            shouldShowTranslatedContent: vi.fn(),
        }),
    }),
)

function LocationDisplay() {
    const { pathname } = useLocation()
    return <div role="status">{pathname}</div>
}

const ticket = mockTicketCompact({
    id: 42,
    subject: 'Test Ticket',
    language: 'en',
})
const viewId = 123
const defaultProps = { ticket, viewId, isActive: false }

describe('TicketListItem', () => {
    it('calls onSelect with ticket id, checked state, and false for shiftKey when checkbox is changed', async () => {
        const onSelect = vi.fn()
        const { user } = render(
            <TicketListItem {...defaultProps} onSelect={onSelect} />,
        )

        await user.click(screen.getByLabelText('Select ticket 42'))

        expect(onSelect).toHaveBeenCalledWith({
            id: 42,
            selected: true,
            shiftKey: false,
        })
    })

    it('passes shiftKey: true to onSelect when shift is held during checkbox click', async () => {
        const onSelect = vi.fn()
        const { user } = render(
            <TicketListItem {...defaultProps} onSelect={onSelect} />,
        )

        await user.keyboard('{Shift>}')
        await user.click(screen.getByLabelText('Select ticket 42'))
        await user.keyboard('{/Shift}')

        expect(onSelect).toHaveBeenCalledWith({
            id: 42,
            selected: true,
            shiftKey: true,
        })
    })

    it('does not navigate to the ticket when the checkbox area is clicked', async () => {
        const { user } = render(
            <>
                <LocationDisplay />
                <TicketListItem {...defaultProps} />
            </>,
        )

        await user.click(screen.getByLabelText('Select ticket 42'))

        expect(screen.getByRole('status')).toHaveTextContent('/')
    })

    it('scrolls the ticket into view when it receives focus', () => {
        const originalScrollIntoView = HTMLElement.prototype.scrollIntoView
        const scrollIntoView = vi.fn()

        Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
            configurable: true,
            value: scrollIntoView,
        })

        try {
            render(<TicketListItem {...defaultProps} />)

            screen.getByRole('link').focus()

            expect(scrollIntoView).toHaveBeenCalledWith({
                block: 'nearest',
                inline: 'nearest',
            })
        } finally {
            Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
                configurable: true,
                value: originalScrollIntoView,
            })
        }
    })

    it('shows the translated tooltip message when translated subject or excerpt is available', async () => {
        const { user } = render(
            <TicketListItem
                {...defaultProps}
                showTranslatedContent
                translation={{ subject: 'Sujet traduit' } as never}
            />,
        )

        await user.hover(
            screen.getByLabelText('Ticket translated from English'),
        )

        expect(
            await screen.findByText('Ticket translated from English'),
        ).toBeInTheDocument()
    })

    it('does not show the translate icon when translated content is enabled without translated fields', () => {
        render(
            <TicketListItem
                {...defaultProps}
                showTranslatedContent
                translation={{ subject: '   ', excerpt: '' } as never}
            />,
        )

        expect(
            screen.queryByLabelText('Ticket translated from English'),
        ).not.toBeInTheDocument()
    })
})
