import { DrillDownModalTrigger } from '@repo/reporting'
import { assumeMock } from '@repo/testing'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { useAiAgentTrendCardDrillDown } from 'domains/reporting/hooks/drill-down/useAiAgentTrendCardDrillDown'

import { SHOPPING_ASSISTANT_TOP_PRODUCTS_COLUMNS } from '../columns'

jest.mock('@repo/reporting', () => ({
    DrillDownModalTrigger: jest.fn(
        ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
    ),
}))

jest.mock('domains/reporting/hooks/drill-down/useAiAgentTrendCardDrillDown')

const mockUseAiAgentTrendCardDrillDown = jest.mocked(
    useAiAgentTrendCardDrillDown,
)
const mockDrillDownModalTrigger = assumeMock(DrillDownModalTrigger)

const timesRecommendedColumn = SHOPPING_ASSISTANT_TOP_PRODUCTS_COLUMNS[0]
const mockRow = { entity: '42' } as any

describe('SHOPPING_ASSISTANT_TOP_PRODUCTS_COLUMNS - Times recommended renderCell', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('returns null when value is falsy', () => {
        const result = timesRecommendedColumn.renderCell!(0, mockRow)
        expect(result).toBeNull()
    })

    it('renders plain text when drillDown is not available', () => {
        mockUseAiAgentTrendCardDrillDown.mockReturnValue(undefined)

        render(timesRecommendedColumn.renderCell!(100, mockRow) as JSX.Element)

        expect(screen.getByText('100')).toBeInTheDocument()
        expect(mockDrillDownModalTrigger).not.toHaveBeenCalled()
    })

    it('renders DrillDownModalTrigger with the formatted value when drillDown is available', async () => {
        const user = userEvent.setup()
        const openDrillDownModal = jest.fn()
        mockUseAiAgentTrendCardDrillDown.mockReturnValue({
            openDrillDownModal,
            tooltipText: 'Click to view tickets',
        })

        render(timesRecommendedColumn.renderCell!(100, mockRow) as JSX.Element)

        expect(screen.getByText('100')).toBeInTheDocument()
        expect(mockDrillDownModalTrigger).toHaveBeenCalledWith(
            expect.objectContaining({
                enabled: true,
                highlighted: true,
                openDrillDownModal,
            }),
            expect.anything(),
        )
        await user.click(screen.getByText('100'))
    })
})
