import { render, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'

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

    it('should render with Icon and Tooltip', async () => {
        render(<MetricCardHeader title="Title" hint={hint} />)

        const icon = screen.getByRole('img', { name: 'info' })
        expect(icon).toBeInTheDocument()
        userEvent.hover(icon)

        await waitFor(() => {
            expect(screen.getByText(hint.title)).toBeInTheDocument()
        })

        expect(screen.getByText(/Title/)).toBeInTheDocument()
    })
})
