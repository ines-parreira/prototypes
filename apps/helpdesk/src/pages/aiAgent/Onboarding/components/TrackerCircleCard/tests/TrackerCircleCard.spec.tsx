import { render, screen } from '@testing-library/react'

import type { TrackerCircleCardProps } from '../TrackerCircleCard'
import TrackerCircleCard from '../TrackerCircleCard'

const defaultProps = {
    title: 'Test',
    percentage: 10,
    label: '10%',
    isLoading: false,
}

const renderComponent = ({
    ...props
}: TrackerCircleCardProps = defaultProps) => {
    return render(<TrackerCircleCard {...props} />)
}

describe('TrackerCircleCard', () => {
    it('should render without crashing', () => {
        renderComponent()

        expect(screen.getByText('Test')).toBeInTheDocument()
        expect(screen.getByText('10%')).toBeInTheDocument()
    })

    it('should render skeleton when it is loading', () => {
        const { container } = renderComponent({
            ...defaultProps,
            isLoading: true,
        })

        expect(
            container.querySelector('.react-loading-skeleton'),
        ).toBeInTheDocument()
    })
})
