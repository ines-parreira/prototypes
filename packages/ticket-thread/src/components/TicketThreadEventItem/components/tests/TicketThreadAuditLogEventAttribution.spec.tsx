import { screen } from '@testing-library/react'

import { render } from '../../../../tests/render.utils'
import { TicketThreadAuditLogEventAttribution } from '../TicketThreadAuditLogEventAttribution'

vi.mock('../TicketThreadEventAuthor', () => ({
    TicketThreadEventAuthor: ({ authorId }: { authorId: number }) => (
        <span>author-{authorId}</span>
    ),
}))

describe('TicketThreadAuditLogEventAttribution', () => {
    it('renders via rule method for via-rule attribution', () => {
        render(<TicketThreadAuditLogEventAttribution attribution="via-rule" />)

        expect(screen.getByText('via rule')).toBeInTheDocument()
    })

    it('renders author for author attribution', () => {
        render(
            <TicketThreadAuditLogEventAttribution
                attribution="author"
                authorId={42}
            />,
        )

        expect(screen.getByText('author-42')).toBeInTheDocument()
        expect(screen.queryByText('via rule')).not.toBeInTheDocument()
    })

    it('renders nothing for none attribution', () => {
        const { container } = render(
            <TicketThreadAuditLogEventAttribution attribution="none" />,
        )

        expect(container).toBeEmptyDOMElement()
    })
})
