import { render, screen } from '@testing-library/react'

import type { TooltipData } from '../../types'
import { MetricCardHeader } from './MetricCardHeader'

const hint: TooltipData = {
    title: 'Hint',
    link: 'some_link',
    linkText: 'Link Text',
}

describe('MetricCardHeader', () => {
    it('should render with title and titleExtra and actionMenu', () => {
        render(
            <MetricCardHeader
                title="Title"
                titleExtra="TitleExtra"
                actionMenu="ActionMenu"
            />,
        )
        expect(screen.getByText('Title')).toBeInTheDocument()
        expect(screen.getByText(/TitleExtra/)).toBeInTheDocument()
        expect(screen.getByText(/ActionMenu/)).toBeInTheDocument()
    })

    it('should render with hint icon', () => {
        render(<MetricCardHeader title="Title" hint={hint} />)

        expect(screen.getByText(/Title/)).toBeInTheDocument()

        const icon = screen.getByRole('img', { name: 'info' })
        expect(icon).toBeInTheDocument()
    })

    it('should not render hint icon when hint is not provided', () => {
        render(<MetricCardHeader title="Title" />)

        expect(screen.getByText(/Title/)).toBeInTheDocument()

        const icon = screen.queryByRole('img', { name: 'info' })
        expect(icon).not.toBeInTheDocument()
    })
})
