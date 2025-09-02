import { render, screen } from '@testing-library/react'

import { TrendIcon } from '../TrendIcon'

describe('TrendIcon', () => {
    it('should render and contain the correct classNames', () => {
        render(<TrendIcon value={1} />)

        expect(screen.getByText('arrow_upward')).toBeInTheDocument()
        expect(screen.getByText('arrow_upward')).toHaveClass('icon-12')
        expect(screen.getByText('arrow_upward')).toHaveClass('mr-1')
        expect(screen.getByText('arrow_upward')).toHaveClass(
            'material-icons-round',
        )
    })

    it('should render with negative sign', () => {
        render(<TrendIcon value={-1} />)

        expect(screen.getByText('arrow_downward')).toBeInTheDocument()
    })

    it('should render with zero sign', () => {
        render(<TrendIcon value={0} />)

        expect(screen.queryByText('arrow_upward')).not.toBeInTheDocument()
        expect(screen.queryByText('arrow_downward')).not.toBeInTheDocument()
    })
})
