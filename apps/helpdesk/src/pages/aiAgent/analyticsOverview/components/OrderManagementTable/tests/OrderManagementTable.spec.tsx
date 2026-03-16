import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { OrderManagementTable } from 'pages/aiAgent/analyticsOverview/components/OrderManagementTable/OrderManagementTable'
import type { OrderManagementEntityMetrics } from 'pages/aiAgent/analyticsOverview/hooks/useOrderManagementMetrics'

jest.mock(
    'pages/aiAgent/analyticsOverview/components/OrderManagementTable/DownloadOrderManagementButton',
    () => ({
        DownloadOrderManagementButton: () => <div>Download Button</div>,
    }),
)

jest.mock('pages/aiAgent/analyticsOverview/hooks/useOrderManagementMetrics')

const mockUseOrderManagementMetrics = jest.requireMock(
    'pages/aiAgent/analyticsOverview/hooks/useOrderManagementMetrics',
).useOrderManagementMetrics as jest.Mock

const defaultLoadingStates = {
    automationRate: false,
    automatedInteractions: false,
    handoverInteractions: false,
    timeSaved: false,
    costSaved: false,
}

const defaultData: OrderManagementEntityMetrics[] = [
    {
        entity: 'cancel_order',
        automationRate: 18,
        automatedInteractions: 2700,
        handoverInteractions: 189,
        costSaved: 1200,
        timeSaved: 9900,
    },
    {
        entity: 'track_order',
        automationRate: 7,
        automatedInteractions: 900,
        handoverInteractions: null,
        costSaved: 500,
        timeSaved: 4500,
    },
    {
        entity: 'loop_returns_started',
        automationRate: 4,
        automatedInteractions: 450,
        handoverInteractions: null,
        costSaved: 450,
        timeSaved: 3600,
    },
    {
        entity: 'automated_response_started',
        automationRate: 3,
        automatedInteractions: 350,
        handoverInteractions: null,
        costSaved: 250,
        timeSaved: 1800,
    },
]

const renderComponent = (
    data = defaultData,
    loadingStates = defaultLoadingStates,
) => {
    mockUseOrderManagementMetrics.mockReturnValue({ data, loadingStates })
    return render(<OrderManagementTable />)
}

describe('OrderManagementTable', () => {
    afterEach(() => {
        jest.clearAllMocks()
    })

    it('should render all entity display names in table', () => {
        renderComponent()

        expect(screen.getByText('Cancel order')).toBeInTheDocument()
        expect(screen.getByText('Track order')).toBeInTheDocument()
        expect(screen.getByText('Return orders')).toBeInTheDocument()
        expect(screen.getByText('Report order issue')).toBeInTheDocument()
    })

    it('should render all column headers', () => {
        renderComponent()

        expect(screen.getByText('Feature name')).toBeInTheDocument()
        expect(screen.getByText('Overall automation rate')).toBeInTheDocument()
        expect(screen.getByText('Automated interactions')).toBeInTheDocument()
        expect(screen.getByText('Handover interactions')).toBeInTheDocument()
        expect(screen.getByText('Cost saved')).toBeInTheDocument()
        expect(screen.getByText('Time saved by agents')).toBeInTheDocument()
    })

    it('should render correct data for cancel_order row', () => {
        renderComponent()

        expect(screen.getByText('Cancel order')).toBeInTheDocument()
        expect(screen.getByText('18%')).toBeInTheDocument()
        expect(screen.getByText('2,700')).toBeInTheDocument()
        expect(screen.getByText('189')).toBeInTheDocument()
        expect(screen.getByText('$1,200')).toBeInTheDocument()
        expect(screen.getByText('2h 45m')).toBeInTheDocument()
    })

    it('should render correct data for track_order row', () => {
        renderComponent()

        expect(screen.getByText('Track order')).toBeInTheDocument()
        expect(screen.getByText('7%')).toBeInTheDocument()
        expect(screen.getByText('900')).toBeInTheDocument()
        expect(screen.getByText('$500')).toBeInTheDocument()
        expect(screen.getByText('1h 15m')).toBeInTheDocument()
    })

    it('should render the download button', () => {
        renderComponent()

        expect(screen.getByText('Download Button')).toBeInTheDocument()
    })

    it('should show empty state when data is empty and not loading', () => {
        renderComponent([], defaultLoadingStates)

        expect(screen.getByText('No data found')).toBeInTheDocument()
        expect(
            screen.getByText('Try to adjust your report filters.'),
        ).toBeInTheDocument()
    })

    it('should not show empty state when loading', () => {
        renderComponent([], { ...defaultLoadingStates, automationRate: true })

        expect(screen.queryByText('No data found')).not.toBeInTheDocument()
    })

    describe('Sort direction', () => {
        it('should hide sort arrows in column headers by default', () => {
            const { container } = renderComponent()

            const hiddenSortIcons = container.querySelectorAll(
                'span[style*="visibility: hidden"]',
            )
            expect(hiddenSortIcons.length).toBeGreaterThan(0)
        })

        it('should show sort arrow after clicking a metric column header', async () => {
            const user = userEvent.setup()
            const { container } = renderComponent()

            await user.click(screen.getByText('Overall automation rate'))

            const visibleSortIcon = container.querySelector(
                'span[style*="visibility: visible"]',
            )
            expect(visibleSortIcon).toBeInTheDocument()
        })
    })

    describe('Loading states', () => {
        it('should render skeleton for automationRate when loading', () => {
            renderComponent([{ ...defaultData[0], automationRate: null }], {
                ...defaultLoadingStates,
                automationRate: true,
            })

            expect(screen.getByText('Cancel order')).toBeInTheDocument()
            expect(screen.getByText('2,700')).toBeInTheDocument()
            expect(screen.queryByText('18%')).not.toBeInTheDocument()
        })

        it('should render skeleton for automatedInteractions when loading', () => {
            renderComponent(
                [
                    {
                        ...defaultData[0],
                        automatedInteractions: null,
                        costSaved: null,
                        timeSaved: null,
                    },
                ],
                { ...defaultLoadingStates, automatedInteractions: true },
            )

            expect(screen.getByText('Cancel order')).toBeInTheDocument()
            expect(screen.getByText('18%')).toBeInTheDocument()
            expect(screen.queryByText('2,700')).not.toBeInTheDocument()
            expect(screen.queryByText('$1,200')).not.toBeInTheDocument()
        })

        it('should render skeleton for handovers when loading', () => {
            renderComponent(
                [{ ...defaultData[0], handoverInteractions: null }],
                {
                    ...defaultLoadingStates,
                    handoverInteractions: true,
                },
            )

            expect(screen.getByText('Cancel order')).toBeInTheDocument()
            expect(screen.getByText('2,700')).toBeInTheDocument()
            expect(screen.queryByText('189')).not.toBeInTheDocument()
        })

        it('should render skeleton for timeSaved when timeSaved is loading', () => {
            renderComponent([{ ...defaultData[0], timeSaved: null }], {
                ...defaultLoadingStates,
                timeSaved: true,
            })

            expect(screen.getByText('Cancel order')).toBeInTheDocument()
            expect(screen.getByText('2,700')).toBeInTheDocument()
            expect(screen.queryByText('2h 45m')).not.toBeInTheDocument()
        })
    })
})
