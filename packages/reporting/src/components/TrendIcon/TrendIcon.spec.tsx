import { render, screen } from '@testing-library/react'

import { TrendIcon } from './TrendIcon'

describe('TrendIcon', () => {
    it('should render and contain the correct classNames', () => {
        render(<TrendIcon value={1} />)

        expect(
            screen.getByRole('img', { name: 'arrow-up' }),
        ).toBeInTheDocument()
    })

    it('should render with negative sign', () => {
        render(<TrendIcon value={-1} />)

        expect(
            screen.getByRole('img', { name: 'arrow-down' }),
        ).toBeInTheDocument()
    })

    it('should render with zero sign', () => {
        render(<TrendIcon value={0} />)

        expect(
            screen.queryByRole('img', { name: 'arrow-up' }),
        ).not.toBeInTheDocument()
        expect(
            screen.queryByRole('img', { name: 'arrow-down' }),
        ).not.toBeInTheDocument()
    })
})
