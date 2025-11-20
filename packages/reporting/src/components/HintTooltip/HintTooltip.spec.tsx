import { render, screen } from '@testing-library/react'

import type { TooltipData } from '../../types'
import { HintTooltip } from './HintTooltip'

const hint: TooltipData = {
    title: 'Hint',
    link: 'some_link',
    linkText: 'Link',
}

describe('HintTooltip', () => {
    it('should render with title and link', () => {
        render(<HintTooltip hint={hint} />)

        expect(screen.getByText(hint.title)).toBeInTheDocument()
        expect(screen.getByText(hint.linkText!)).toBeInTheDocument()
    })

    it('should not render link if link is not provided', () => {
        render(<HintTooltip hint={{ ...hint, link: undefined }} />)

        expect(screen.queryByText(hint.linkText!)).not.toBeInTheDocument()
    })
})
