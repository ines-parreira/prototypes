import { render, screen } from '@testing-library/react'

import { DrillDownHeaderCellWithTooltip } from 'domains/reporting/pages/common/drill-down/DrillDownHeaderCellWithTooltip'
import { HintTooltipContent } from 'domains/reporting/pages/common/HintTooltip'

describe('DrillDownHeaderCellWithTooltip', () => {
    it('should render title without tooltip', () => {
        render(
            <table>
                <thead>
                    <tr>
                        <DrillDownHeaderCellWithTooltip title="Test Column" />
                    </tr>
                </thead>
            </table>,
        )

        expect(screen.getByText('Test Column')).toBeInTheDocument()
        expect(
            screen.queryByRole('img', { hidden: true }),
        ).not.toBeInTheDocument()
    })

    it('should render title with string tooltip and show info icon', () => {
        render(
            <table>
                <thead>
                    <tr>
                        <DrillDownHeaderCellWithTooltip
                            title="Test Column"
                            tooltip="This is a tooltip"
                        />
                    </tr>
                </thead>
            </table>,
        )

        expect(screen.getByText('Test Column')).toBeInTheDocument()
        expect(screen.getByRole('img', { hidden: true })).toBeInTheDocument()
    })

    it('should render title with JSX tooltip containing a link', () => {
        render(
            <table>
                <thead>
                    <tr>
                        <DrillDownHeaderCellWithTooltip
                            title="Contact Reason"
                            tooltip={
                                <span>
                                    The current value of the Contact reason is
                                    displayed.{' '}
                                    <a
                                        href="https://docs.gorgias.com"
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        Learn more
                                    </a>
                                </span>
                            }
                        />
                    </tr>
                </thead>
            </table>,
        )

        expect(screen.getByText('Contact Reason')).toBeInTheDocument()
        expect(screen.getByRole('img', { hidden: true })).toBeInTheDocument()
    })

    it('should render title with HintTooltipContent ReactElement', () => {
        render(
            <table>
                <thead>
                    <tr>
                        <DrillDownHeaderCellWithTooltip
                            title="Metric"
                            tooltip={
                                <HintTooltipContent
                                    title="Metric description"
                                    link="https://docs.gorgias.com"
                                    linkText="Read more"
                                />
                            }
                        />
                    </tr>
                </thead>
            </table>,
        )

        expect(screen.getByText('Metric')).toBeInTheDocument()
        expect(screen.getByRole('img', { hidden: true })).toBeInTheDocument()
    })

    it('should apply custom className and titleClassName', () => {
        render(
            <table>
                <thead>
                    <tr>
                        <DrillDownHeaderCellWithTooltip
                            title="Test"
                            className="custom-cell"
                            titleClassName="custom-title"
                        />
                    </tr>
                </thead>
            </table>,
        )

        const cell = screen.getByText('Test').closest('th')
        expect(cell).toHaveClass('custom-cell')
        expect(screen.getByText('Test')).toHaveClass('custom-title')
    })
})
