import { screen } from '@testing-library/react'

import { render } from '../../../tests/render.utils'
import { IconWithDot } from '../IconWithDot'

describe('IconWithDot', () => {
    it('renders the icon', () => {
        const { container } = render(
            <IconWithDot size="sm" name="flows" isDotVisible={false} />,
        )
        expect(container.querySelector('svg')).toBeInTheDocument()
    })

    it('shows the unread notification indicator when isDotVisible is true', () => {
        render(<IconWithDot size="sm" name="flows" isDotVisible={true} />)
        expect(
            screen.getByRole('img', { name: 'Unread notification' }),
        ).toBeInTheDocument()
    })

    it('hides the unread notification indicator when isDotVisible is false', () => {
        render(<IconWithDot size="sm" name="flows" isDotVisible={false} />)
        expect(
            screen.queryByRole('img', { name: 'Unread notification' }),
        ).not.toBeInTheDocument()
    })
})
