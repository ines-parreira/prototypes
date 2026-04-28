import { render } from '@repo/testing'
import { screen } from '@testing-library/react'

import { SegmentCountPreview } from './SegmentCountPreview'

jest.mock('@gorgias/axiom', () => ({
    ...jest.requireActual('@gorgias/axiom'),
    Skeleton: () => <div role="status" aria-label="loading" />,
}))

describe('<SegmentCountPreview />', () => {
    it('should render the segment preview heading', () => {
        render(<SegmentCountPreview />)

        expect(
            screen.getByRole('heading', { name: 'Segment preview' }),
        ).toBeInTheDocument()
    })

    it('should display the count when provided', () => {
        render(<SegmentCountPreview count={42} />)

        expect(screen.getByText('±42 shoppers')).toBeInTheDocument()
    })

    it('should format large numbers with locale separators', () => {
        render(<SegmentCountPreview count={2097507} />)

        expect(
            screen.getByText((2097507).toLocaleString(), { exact: false }),
        ).toBeInTheDocument()
    })

    it('should display "0 shoppers" without ± when count is undefined', () => {
        render(<SegmentCountPreview />)

        expect(screen.getByText('0 shoppers')).toBeInTheDocument()
    })

    it('should display "0 shoppers" without ± when count is zero', () => {
        render(<SegmentCountPreview count={0} />)

        expect(screen.getByText('0 shoppers')).toBeInTheDocument()
    })

    it('should show skeleton and hide count tag while loading', () => {
        render(<SegmentCountPreview count={42} isLoading={true} />)

        expect(
            screen.getByRole('status', { name: 'loading' }),
        ).toBeInTheDocument()
        expect(screen.queryByText('±42 shoppers')).not.toBeInTheDocument()
    })

    it('should not show skeleton when not loading', () => {
        render(<SegmentCountPreview count={100} isLoading={false} />)

        expect(
            screen.queryByRole('status', { name: 'loading' }),
        ).not.toBeInTheDocument()
        expect(screen.getByText('±100 shoppers')).toBeInTheDocument()
    })
})
