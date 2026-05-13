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

    describe('tooltip content', () => {
        it('should render hint icon for a single-line caption with link', () => {
            const hintWithCaption: TooltipData = {
                title: 'Average CSAT',
                caption: 'Single line caption',
                link: 'https://example.com',
                linkText: 'How is it calculated?',
            }
            render(<MetricCardHeader title="Title" hint={hintWithCaption} />)

            expect(
                screen.getByRole('img', { name: 'info' }),
            ).toBeInTheDocument()
        })

        it('should render hint icon for a multi-line caption with link', () => {
            const hintWithMultilineCaption: TooltipData = {
                title: 'Average CSAT',
                caption: 'First paragraph.\n\nSecond paragraph.',
                link: 'https://example.com',
                linkText: 'How is it calculated?',
            }
            render(
                <MetricCardHeader
                    title="Title"
                    hint={hintWithMultilineCaption}
                />,
            )

            expect(
                screen.getByRole('img', { name: 'info' }),
            ).toBeInTheDocument()
        })

        it('should render hint icon for a single-line caption without link', () => {
            const hintWithoutLink: TooltipData = {
                title: 'Average CSAT',
                caption: 'Caption with no link',
            }
            render(<MetricCardHeader title="Title" hint={hintWithoutLink} />)

            expect(
                screen.getByRole('img', { name: 'info' }),
            ).toBeInTheDocument()
        })

        it('should render hint icon for a multi-line caption without link', () => {
            const hintWithMultilineAndNoLink: TooltipData = {
                title: 'Average CSAT',
                caption: 'First paragraph.\n\nSecond paragraph.',
            }
            render(
                <MetricCardHeader
                    title="Title"
                    hint={hintWithMultilineAndNoLink}
                />,
            )

            expect(
                screen.getByRole('img', { name: 'info' }),
            ).toBeInTheDocument()
        })
    })
})
