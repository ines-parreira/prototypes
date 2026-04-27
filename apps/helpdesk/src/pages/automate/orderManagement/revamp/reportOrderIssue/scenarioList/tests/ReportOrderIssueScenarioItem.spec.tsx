import { render } from '@repo/testing'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import type { SelfServiceReportIssueCase } from 'models/selfServiceConfiguration/types'
import { useReorderDnD } from 'pages/common/hooks/useReorderDnD'

import { ReportOrderIssueScenarioItem } from '../ReportOrderIssueScenarioItem'

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useHistory: () => ({ push: mockPush }),
    useLocation: () => ({
        pathname:
            '/app/settings/order-management/shopify/my-store/report-issue',
    }),
}))

jest.mock('pages/common/hooks/useReorderDnD', () => ({
    useReorderDnD: jest.fn(() => ({
        dragRef: { current: null },
        dropRef: { current: null },
        handlerId: null,
        isDragging: false,
    })),
}))

const mockPush = jest.fn()

const defaultScenario: SelfServiceReportIssueCase = {
    title: 'Wrong item',
    description: 'Received wrong item',
    conditions: { and: [] },
    newReasons: [],
}

const defaultProps = {
    id: 'item-1',
    position: 0,
    onMove: jest.fn(),
    onDrop: jest.fn(),
    onCancel: jest.fn(),
    isDraggable: true,
    scenario: defaultScenario,
}

describe('ReportOrderIssueScenarioItem', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should render the scenario title and description', () => {
        render(<ReportOrderIssueScenarioItem {...defaultProps} />)

        expect(screen.getByText('Wrong item')).toBeInTheDocument()
        expect(screen.getByText('Received wrong item')).toBeInTheDocument()
    })

    it('should navigate to the edit view on click', async () => {
        const user = userEvent.setup()
        render(<ReportOrderIssueScenarioItem {...defaultProps} />)

        await user.click(screen.getByRole('button'))

        expect(mockPush).toHaveBeenCalledWith(
            '/app/settings/order-management/shopify/my-store/report-issue/0',
        )
    })

    it('should show drag handle icon when draggable', () => {
        render(
            <ReportOrderIssueScenarioItem
                {...defaultProps}
                isDraggable={true}
            />,
        )

        expect(
            screen.getByRole('img', { name: 'Drag to reorder' }),
        ).toBeInTheDocument()
    })

    it('should not show drag handle icon when not draggable', () => {
        render(
            <ReportOrderIssueScenarioItem
                {...defaultProps}
                isDraggable={false}
            />,
        )

        expect(
            screen.queryByRole('img', { name: 'Drag to reorder' }),
        ).not.toBeInTheDocument()
    })

    it('should not show warning when all reasons have responses configured', () => {
        const scenarioWithConfiguredReasons: SelfServiceReportIssueCase = {
            ...defaultScenario,
            newReasons: [
                {
                    reasonKey: 'wrong_item',
                    action: {
                        type: 'automated_response',
                        responseMessageContent: {
                            html: '<p>Sorry</p>',
                            text: 'Sorry',
                        },
                        showHelpfulPrompt: false,
                    },
                },
            ],
        }

        render(
            <ReportOrderIssueScenarioItem
                {...defaultProps}
                scenario={scenarioWithConfiguredReasons}
            />,
        )

        expect(
            screen.queryByRole('img', {
                name: 'Responses not fully configured',
            }),
        ).not.toBeInTheDocument()
    })

    it('should show warning when a reason has no response configured', () => {
        const scenarioWithUnconfiguredReason: SelfServiceReportIssueCase = {
            ...defaultScenario,
            newReasons: [
                {
                    reasonKey: 'wrong_item',
                    action: {
                        type: 'automated_response',
                        responseMessageContent: { html: '', text: '' },
                        showHelpfulPrompt: false,
                    },
                },
            ],
        }

        render(
            <ReportOrderIssueScenarioItem
                {...defaultProps}
                scenario={scenarioWithUnconfiguredReason}
            />,
        )

        expect(
            screen.getByRole('img', { name: 'Responses not fully configured' }),
        ).toBeInTheDocument()
    })

    it('should pass isDraggable=false to useReorderDnD for non-draggable items', () => {
        render(
            <ReportOrderIssueScenarioItem
                {...defaultProps}
                isDraggable={false}
            />,
        )

        expect(useReorderDnD).toHaveBeenCalledWith(
            expect.any(Object),
            expect.any(Array),
            expect.any(Object),
            false,
        )
    })

    it('should apply opacity 0 when the item is being dragged', () => {
        ;(useReorderDnD as jest.Mock).mockReturnValue({
            dragRef: { current: null },
            dropRef: { current: null },
            handlerId: 'handler-1',
            isDragging: true,
        })

        render(
            <ReportOrderIssueScenarioItem
                {...defaultProps}
                isDraggable={true}
            />,
        )

        expect(screen.getByRole('button')).toHaveStyle({ opacity: 0 })
    })

    it('should apply data-handler-id to the button when draggable', () => {
        ;(useReorderDnD as jest.Mock).mockReturnValue({
            dragRef: { current: null },
            dropRef: { current: null },
            handlerId: 'handler-123',
            isDragging: false,
        })

        render(
            <ReportOrderIssueScenarioItem
                {...defaultProps}
                isDraggable={true}
            />,
        )

        expect(screen.getByRole('button')).toHaveAttribute(
            'data-handler-id',
            'handler-123',
        )
    })

    it('should show warning when a reason has no action configured', () => {
        const scenarioWithNoAction: SelfServiceReportIssueCase = {
            ...defaultScenario,
            newReasons: [{ reasonKey: 'wrong_item' } as any],
        }

        render(
            <ReportOrderIssueScenarioItem
                {...defaultProps}
                scenario={scenarioWithNoAction}
            />,
        )

        expect(
            screen.getByRole('img', { name: 'Responses not fully configured' }),
        ).toBeInTheDocument()
    })
})
