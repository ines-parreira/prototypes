import { render, screen } from '@testing-library/react'

import { ARROW_DOWN, ARROW_UP } from '../helper'
import { TrendIcon } from '../TrendIcon'

describe('TrendIcon', () => {
    it('should render and contain the correct classNames', () => {
        render(<TrendIcon value={1} />)

        expect(screen.getByRole('img', { name: ARROW_UP })).toBeInTheDocument()
    })

    it('should render with negative sign', () => {
        render(<TrendIcon value={-1} />)

        expect(
            screen.getByRole('img', { name: ARROW_DOWN }),
        ).toBeInTheDocument()
    })

    it('should render with zero sign', () => {
        render(<TrendIcon value={0} />)

        expect(
            screen.queryByRole('img', { name: ARROW_UP }),
        ).not.toBeInTheDocument()
        expect(
            screen.queryByRole('img', { name: ARROW_DOWN }),
        ).not.toBeInTheDocument()
    })
})
