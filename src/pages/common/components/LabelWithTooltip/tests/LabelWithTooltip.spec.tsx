import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import { LabelWithTooltip } from 'pages/common/components/LabelWithTooltip/LabelWithTooltip'

jest.mock('state/ui/stats/actions', () => ({
    statFiltersClean: jest.fn(() => () => ({})),
    statFiltersDirty: jest.fn(() => () => ({})),
}))

describe('<LabelWithTooltip />', () => {
    const label = 'Label'

    it('should render label', () => {
        render(<LabelWithTooltip label={label} />)

        expect(screen.getByText(label)).toBeInTheDocument()
    })

    it('should render tooltip on hover label', async () => {
        render(<LabelWithTooltip label={label} />)

        fireEvent.mouseOver(screen.getByText(label))

        await waitFor(() => {
            expect(screen.getByText(label)).toBeInTheDocument()
        })
    })

    it('should render tooltip with custom text', async () => {
        const tooltipText = 'Tooltip text'
        render(<LabelWithTooltip label={label} tooltipText={tooltipText} />)

        fireEvent.mouseOver(screen.getByText(label))

        await waitFor(() => {
            expect(screen.getByText(tooltipText)).toBeInTheDocument()
        })
    })
})
