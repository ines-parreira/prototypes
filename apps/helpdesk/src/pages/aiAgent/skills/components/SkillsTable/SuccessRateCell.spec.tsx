import { render } from '@repo/testing'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { ThemeProvider } from 'core/theme'
import { useKnowledgeDrillDownTrigger } from 'pages/aiAgent/skills/hooks/useKnowledgeDrillDownTrigger'

import { SuccessRateCell } from './SuccessRateCell'

jest.mock('pages/aiAgent/skills/hooks/useKnowledgeDrillDownTrigger', () => ({
    useKnowledgeDrillDownTrigger: jest.fn(),
}))

const mockUseKnowledgeDrillDownTrigger =
    useKnowledgeDrillDownTrigger as jest.Mock

const baseProps = {
    resourceSourceId: 42,
    resourceSourceSetId: 100,
    shopIntegrationId: 999,
    dateRange: {
        start_datetime: '2026-04-01T00:00:00.000Z',
        end_datetime: '2026-04-28T23:59:59.999Z',
    },
}

const renderCell = (
    overrides: Partial<React.ComponentProps<typeof SuccessRateCell>> = {},
) =>
    render(
        <ThemeProvider>
            <SuccessRateCell
                value={0.85}
                prevValue={0.8}
                {...baseProps}
                {...overrides}
            />
        </ThemeProvider>,
    )

describe('SuccessRateCell', () => {
    let openDrillDownModal: jest.Mock

    beforeEach(() => {
        openDrillDownModal = jest.fn()
        mockUseKnowledgeDrillDownTrigger.mockReturnValue({
            openDrillDownModal,
            tooltipText: 'View tickets',
        })
    })

    it('renders the value rounded to a whole percent', () => {
        renderCell({ value: 0.857 })

        expect(screen.getByText('86%')).toBeInTheDocument()
    })

    it('renders 0% when the value is zero', () => {
        renderCell({ value: 0 })

        expect(screen.getByText('0%')).toBeInTheDocument()
    })

    it('opens the drilldown when the value text is clicked and the value is non-zero', async () => {
        const user = userEvent.setup()
        renderCell({ value: 0.7 })

        await user.click(screen.getByText('70%'))

        expect(openDrillDownModal).toHaveBeenCalledTimes(1)
    })

    it('does not open the drilldown when the value is zero', async () => {
        const user = userEvent.setup()
        renderCell({ value: 0 })

        await user.click(screen.getByText('0%'))

        expect(openDrillDownModal).not.toHaveBeenCalled()
    })

    it('forwards skill identity, store, and date range to useKnowledgeDrillDownTrigger', () => {
        renderCell()

        expect(mockUseKnowledgeDrillDownTrigger).toHaveBeenCalledWith(
            expect.objectContaining({
                resourceSourceId: 42,
                resourceSourceSetId: 100,
                shopIntegrationId: 999,
                dateRange: baseProps.dateRange,
                title: 'Success rate',
            }),
        )
    })

    it('stops the row click propagation so the cell does not navigate to the skill detail', async () => {
        const user = userEvent.setup()
        const rowClick = jest.fn()
        render(
            <ThemeProvider>
                {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events */}
                <div onClick={rowClick} data-testid="row">
                    <SuccessRateCell
                        value={0.7}
                        prevValue={0.8}
                        {...baseProps}
                    />
                </div>
            </ThemeProvider>,
        )

        await user.click(screen.getByText('70%'))

        expect(rowClick).not.toHaveBeenCalled()
    })
})
