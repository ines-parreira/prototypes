import { render, screen } from '@testing-library/react'

import { ActionLabel } from '../ActionLabel'

describe('ActionLabel', () => {
    it('should render both label and icon when icon is provided', () => {
        render(
            <ActionLabel
                label="Test Action"
                icon={<i className={'material-icons'}>check_circle</i>}
            />,
        )

        expect(screen.getByText('Test Action')).toBeInTheDocument()
        expect(screen.getByText('check_circle')).toBeInTheDocument()
    })

    it('should render only label when no icon is not provided', () => {
        const { container } = render(<ActionLabel label="Test Action" />)

        const containerDiv = container.firstChild as HTMLElement
        expect(containerDiv.children.length).toBe(1)
        expect(containerDiv.children[0].tagName).toBe('SPAN')
    })

    it('should handle long labels with text overflow', () => {
        const longTitle =
            'This is a very long action title that should be truncated with ellipsis'
        render(<ActionLabel label={longTitle} />)

        const titleElement = screen.getByText(longTitle)
        expect(titleElement).toBeInTheDocument()
    })
})
