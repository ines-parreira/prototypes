import { render } from '@repo/testing'
import { act, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { SkillPerformanceTrendModal } from './SkillPerformanceTrendModal'

Element.prototype.getAnimations = jest.fn(() => [])

const mockSkillPerformanceChart = jest.fn(() => (
    <div data-testid="skill-performance-chart">chart</div>
))

jest.mock('./SkillPerformanceChart', () => ({
    SkillPerformanceChart: () => mockSkillPerformanceChart(),
}))

describe('SkillPerformanceTrendModal', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('renders the modal heading and chart when open', () => {
        render(
            <SkillPerformanceTrendModal
                isOpen={true}
                onOpenChange={jest.fn()}
            />,
        )

        expect(screen.getByText('Skill performance')).toBeInTheDocument()
        expect(
            screen.getByTestId('skill-performance-chart'),
        ).toBeInTheDocument()
    })

    it('does not render the chart when the modal is closed', () => {
        render(
            <SkillPerformanceTrendModal
                isOpen={false}
                onOpenChange={jest.fn()}
            />,
        )

        expect(screen.queryByText('Skill performance')).not.toBeInTheDocument()
        expect(
            screen.queryByTestId('skill-performance-chart'),
        ).not.toBeInTheDocument()
    })

    it('invokes onOpenChange when the modal close button is activated', async () => {
        const user = userEvent.setup()
        const onOpenChange = jest.fn()

        render(
            <SkillPerformanceTrendModal
                isOpen={true}
                onOpenChange={onOpenChange}
            />,
        )

        await act(async () => {
            await user.click(screen.getByRole('button', { name: /close/i }))
        })

        expect(onOpenChange).toHaveBeenCalledWith(false)
    })
})
