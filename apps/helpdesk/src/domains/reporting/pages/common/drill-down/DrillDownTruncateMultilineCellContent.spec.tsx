import { render, screen } from '@testing-library/react'

import { DrillDownTruncateMultilineCellContent } from 'domains/reporting/pages/common/drill-down/DrillDownTruncateMultilineCellContent'

describe('DrillDownTruncateMultilineCellContent', () => {
    beforeEach(() => {
        Object.defineProperty(HTMLElement.prototype, 'scrollHeight', {
            configurable: true,
            value: 100,
        })
        Object.defineProperty(HTMLElement.prototype, 'clientHeight', {
            configurable: true,
            value: 100,
        })
    })

    it('should render simple value', () => {
        render(<DrillDownTruncateMultilineCellContent value="Short text" />)

        expect(screen.getByText('Short text')).toBeInTheDocument()
    })

    it('should split content by delimiter and apply correct classes', () => {
        render(
            <DrillDownTruncateMultilineCellContent
                value="Billing>Refund>Request"
                splitDelimiter=">"
                level1ClassName="level1"
                sublevelsClassName="sublevel"
            />,
        )

        const billing = screen.getByText('Billing')
        const refund = screen.getByText('Refund')
        const request = screen.getByText('Request')

        expect(billing).toBeInTheDocument()
        expect(refund).toBeInTheDocument()
        expect(request).toBeInTheDocument()

        expect(billing).toHaveClass('level1')
        expect(refund).toHaveClass('sublevel')
        expect(request).toHaveClass('sublevel')
    })

    it('should render without splitting when delimiter not in value', () => {
        render(
            <DrillDownTruncateMultilineCellContent
                value="Simple text"
                splitDelimiter=">"
                level1ClassName="level1"
            />,
        )

        const text = screen.getByText('Simple text')
        expect(text).toBeInTheDocument()
        expect(text).toHaveClass('level1')
    })

    it('should render with custom tooltip prop', () => {
        render(
            <DrillDownTruncateMultilineCellContent
                value="Display text"
                tooltip="Custom tooltip text"
            />,
        )

        expect(screen.getByText('Display text')).toBeInTheDocument()
    })

    it('should apply className to container', () => {
        const { container } = render(
            <DrillDownTruncateMultilineCellContent
                value="Test"
                className="custom-class"
            />,
        )

        const element = container.querySelector('.custom-class')
        expect(element).toBeInTheDocument()
    })

    it('should handle empty value', () => {
        render(<DrillDownTruncateMultilineCellContent value="" />)

        expect(screen.queryByText(/.+/)).not.toBeInTheDocument()
    })

    it('should handle undefined value', () => {
        const { container } = render(<DrillDownTruncateMultilineCellContent />)

        expect(container.firstChild).toBeInTheDocument()
    })
})
