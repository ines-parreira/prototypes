import { render, screen } from '@testing-library/react'

import TicketTag from '../TicketTag'

describe('<TicketTag />', () => {
    it('should render the tag', () => {
        const text = 'shipping'
        const color = '#123456' // hsl(210, 65%, 20%)

        render(<TicketTag text={text} decoration={{ color }} />)
        const tag = screen.getByText(text)

        expect(tag).toBeInTheDocument()
        expect(
            (tag.style as unknown as { _values: Record<string, unknown> })
                ._values,
        ).toMatchObject({ '--tag-dot-color': color })
    })

    it('should handle invalid color', () => {
        const label = 'shipping'
        const color = '#'

        const { container } = render(
            <TicketTag text={label} decoration={{ color }} />,
        )

        expect(container.firstChild).not.toHaveStyle(
            `--tag-dot-color: ${color}`,
        )
    })
})
