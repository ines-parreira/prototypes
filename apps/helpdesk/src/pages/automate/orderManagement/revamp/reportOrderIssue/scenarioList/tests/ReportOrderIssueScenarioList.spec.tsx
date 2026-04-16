import { act, render, screen } from '@testing-library/react'

import type { SelfServiceReportIssueCase } from 'models/selfServiceConfiguration/types'
import { useReorderDnD } from 'pages/common/hooks/useReorderDnD'

import { ReportOrderIssueScenarioList } from '../ReportOrderIssueScenarioList'

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useHistory: () => ({ push: jest.fn() }),
    useLocation: () => ({ pathname: '/test/report-issue' }),
}))

jest.mock('pages/common/hooks/useReorderDnD', () => ({
    useReorderDnD: jest.fn(() => ({
        dragRef: { current: null },
        dropRef: { current: null },
        handlerId: null,
        isDragging: false,
    })),
}))

const mockScenarios: SelfServiceReportIssueCase[] = [
    {
        title: 'Wrong item',
        description: 'Received wrong item',
        conditions: { and: [] },
        newReasons: [],
    },
    {
        title: 'Damaged item',
        description: 'Item arrived damaged',
        conditions: { and: [] },
        newReasons: [],
    },
    {
        title: 'Fallback scenario',
        description: 'Default fallback',
        conditions: { and: [] },
        newReasons: [],
    },
]

describe('ReportOrderIssueScenarioList', () => {
    const mockOnReorder = jest.fn()

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should render all scenario titles', () => {
        render(
            <ReportOrderIssueScenarioList
                scenarios={mockScenarios}
                onReorder={mockOnReorder}
            />,
        )

        expect(screen.getByText('Wrong item')).toBeInTheDocument()
        expect(screen.getByText('Damaged item')).toBeInTheDocument()
        expect(screen.getByText('Fallback scenario')).toBeInTheDocument()
    })

    it('should render all scenario descriptions', () => {
        render(
            <ReportOrderIssueScenarioList
                scenarios={mockScenarios}
                onReorder={mockOnReorder}
            />,
        )

        expect(screen.getByText('Received wrong item')).toBeInTheDocument()
        expect(screen.getByText('Item arrived damaged')).toBeInTheDocument()
        expect(screen.getByText('Default fallback')).toBeInTheDocument()
    })

    it('should render empty list when there are no scenarios', () => {
        render(
            <ReportOrderIssueScenarioList
                scenarios={[]}
                onReorder={mockOnReorder}
            />,
        )

        expect(screen.queryByRole('button')).not.toBeInTheDocument()
    })

    it('should mark last item as not draggable (fallback scenario)', () => {
        render(
            <ReportOrderIssueScenarioList
                scenarios={mockScenarios}
                onReorder={mockOnReorder}
            />,
        )

        const dndCalls = (useReorderDnD as jest.Mock).mock.calls
        const lastCallArgs = dndCalls[dndCalls.length - 1]
        expect(lastCallArgs[3]).toBe(false)
    })

    it('should mark all non-last items as draggable', () => {
        render(
            <ReportOrderIssueScenarioList
                scenarios={mockScenarios}
                onReorder={mockOnReorder}
            />,
        )

        const dndCalls = (useReorderDnD as jest.Mock).mock.calls
        const nonLastCalls = dndCalls.slice(0, dndCalls.length - 1)
        nonLastCalls.forEach((callArgs) => {
            expect(callArgs[3]).toBe(true)
        })
    })

    it('should call onReorder with current scenario order on drop', () => {
        render(
            <ReportOrderIssueScenarioList
                scenarios={mockScenarios}
                onReorder={mockOnReorder}
            />,
        )

        const { onDrop } = (useReorderDnD as jest.Mock).mock.calls[0][2]

        act(() => {
            onDrop()
        })

        expect(mockOnReorder).toHaveBeenCalledWith(mockScenarios)
    })

    it('should reorder items visually on move', () => {
        render(
            <ReportOrderIssueScenarioList
                scenarios={mockScenarios}
                onReorder={mockOnReorder}
            />,
        )

        const { onHover } = (useReorderDnD as jest.Mock).mock.calls[0][2]

        act(() => {
            onHover(0, 1)
        })

        const buttons = screen.getAllByRole('button')
        expect(buttons[0]).toHaveTextContent('Damaged item')
        expect(buttons[1]).toHaveTextContent('Wrong item')
    })

    it('should revert visual order on cancel', () => {
        render(
            <ReportOrderIssueScenarioList
                scenarios={mockScenarios}
                onReorder={mockOnReorder}
            />,
        )

        const { onHover, onCancel } = (useReorderDnD as jest.Mock).mock
            .calls[0][2]

        act(() => {
            onHover(0, 1)
        })

        act(() => {
            onCancel()
        })

        const buttons = screen.getAllByRole('button')
        expect(buttons[0]).toHaveTextContent('Wrong item')
        expect(buttons[1]).toHaveTextContent('Damaged item')
    })

    it('should sync to updated scenarios when the prop changes', () => {
        const { rerender } = render(
            <ReportOrderIssueScenarioList
                scenarios={mockScenarios}
                onReorder={mockOnReorder}
            />,
        )

        const newScenario: SelfServiceReportIssueCase = {
            title: 'New scenario',
            description: 'Brand new',
            conditions: { and: [] },
            newReasons: [],
        }

        rerender(
            <ReportOrderIssueScenarioList
                scenarios={[newScenario]}
                onReorder={mockOnReorder}
            />,
        )

        expect(screen.getByText('New scenario')).toBeInTheDocument()
        expect(screen.queryByText('Wrong item')).not.toBeInTheDocument()
    })
})
