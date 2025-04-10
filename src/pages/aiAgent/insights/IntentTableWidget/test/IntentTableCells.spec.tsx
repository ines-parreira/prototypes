import React from 'react'

import { render, screen } from '@testing-library/react'
import { mockFlags } from 'jest-launchdarkly-mock'
import { MemoryRouter } from 'react-router-dom'

import { FeatureFlagKey } from 'config/featureFlags'
import { useAiAgentNavigation } from 'pages/aiAgent/hooks/useAiAgentNavigation'
import {
    Intent,
    IntentTableColumn,
} from 'pages/aiAgent/insights/IntentTableWidget/types'
import TableBody from 'pages/common/components/table/TableBody'
import TableBodyRow from 'pages/common/components/table/TableBodyRow'
import TableWrapper from 'pages/common/components/table/TableWrapper'
import { assumeMock } from 'utils/testing'

import {
    BodyCellWrapper,
    IntentAutomationOpportunitiesCellContent,
    IntentAvgCsatCellContent,
    IntentDefaultCellContent,
    IntentNameCellContent,
    LoadingIntentCellContent,
} from '../IntentTableCells'

jest.mock('pages/aiAgent/hooks/useAiAgentNavigation')
const mockUseAiAgentNavigation = assumeMock(useAiAgentNavigation)

const mockHistoryPush = jest.fn()
jest.mock(
    'react-router-dom',
    () =>
        ({
            ...jest.requireActual('react-router-dom'),
            useHistory: () => ({
                push: mockHistoryPush,
            }),
        }) as Record<string, unknown>,
)

const renderTableCell = (cellContent: React.ReactNode) => {
    render(
        <MemoryRouter>
            <TableWrapper>
                <TableBody>
                    <TableBodyRow>{cellContent}</TableBodyRow>
                </TableBody>
            </TableWrapper>
        </MemoryRouter>,
    )
}

describe('IntentTableCells', () => {
    const mockIntent = {
        id: '1::2',
        [IntentTableColumn.IntentName]: 'Mock Intent Name',
        [IntentTableColumn.AutomationOpportunities]: 0.5,
        // [IntentTableColumn.Resources]: 0,
        [IntentTableColumn.Tickets]: 200,
    } as unknown as Intent

    const mockAllIntents = [
        { id: '1', [IntentTableColumn.AutomationOpportunities]: 0.5 },
        { id: '2', [IntentTableColumn.AutomationOpportunities]: 0.7 },
        { id: '3', [IntentTableColumn.AutomationOpportunities]: 0.3 },
    ] as unknown as Intent[]

    describe('IntentNameCellContent', () => {
        beforeEach(() => {
            mockUseAiAgentNavigation.mockReturnValue({
                routes: { optimizeIntent: (id: string) => `/optimize/${id}` },
            } as unknown as ReturnType<typeof useAiAgentNavigation>)
        })

        it('renders a link to the intent with the correct text', () => {
            renderTableCell(
                <IntentNameCellContent
                    intent={mockIntent}
                    column={IntentTableColumn.IntentName}
                />,
            )
            const link = screen.getByRole('cell')
            expect(link).toHaveTextContent('Mock Intent Name')
        })

        it('navigates to the correct route on click if isL1Drilldown is true', () => {
            mockFlags({
                [FeatureFlagKey.AiAgentOptimizeTabL2Drilldown]: true,
            })
            renderTableCell(
                <IntentNameCellContent
                    intent={{ ...mockIntent, id: '1::2::3' }}
                    column={IntentTableColumn.IntentName}
                    intentLevel={2}
                />,
            )
            const link = screen.getByText(
                mockIntent[IntentTableColumn.IntentName],
            )
            link.click()
            expect(mockHistoryPush).toHaveBeenCalledWith('/optimize/1::2::3')
        })

        it('does not navigate on click if isL1Drilldown is false', () => {
            renderTableCell(
                <IntentNameCellContent
                    intent={{ ...mockIntent, id: '1' }}
                    column={IntentTableColumn.IntentName}
                />,
            )
            const link = screen.getByRole('cell')
            link.click()
            expect(mockHistoryPush).not.toHaveBeenCalled()
        })

        it('shows a hint tooltip if isL1Drilldown is false and intent id ends with "Other"', () => {
            renderTableCell(
                <IntentNameCellContent
                    intent={{ ...mockIntent, id: '1::2::Other' }}
                    column={IntentTableColumn.IntentName}
                />,
            )
            expect(screen.getByText('info')).toBeInTheDocument()
        })

        it('does not show a hint tooltip if isL1Drilldown is false and intent id does not end with "Other"', () => {
            renderTableCell(
                <IntentNameCellContent
                    intent={{ ...mockIntent, id: '1::2' }}
                    column={IntentTableColumn.IntentName}
                />,
            )
            expect(screen.queryByText('info')).not.toBeInTheDocument()
        })

        it('does not show a hint tooltip if isL1Drilldown is true', () => {
            renderTableCell(
                <IntentNameCellContent
                    intent={{ ...mockIntent, id: '1::2::Other' }}
                    column={IntentTableColumn.IntentName}
                    intentLevel={2}
                />,
            )
            expect(screen.queryByText('info')).not.toBeInTheDocument()
        })
    })

    describe('IntentDefaultCellContent', () => {
        it('renders formatted metric value for the column', () => {
            renderTableCell(
                <IntentDefaultCellContent
                    intent={mockIntent}
                    column={IntentTableColumn.Tickets}
                />,
            )
            expect(screen.getByText('200')).toBeInTheDocument()
        })
    })

    // describe('IntentResourcesCellContent', () => {
    //     it('renders "Missing" if the resource value is 0', () => {
    //         renderTableCell(
    //             <IntentResourcesCellContent
    //                 intent={mockIntent}
    //                 column={IntentTableColumn.Resources}
    //             />,
    //         )
    //         expect(screen.getByText('Missing')).toBeInTheDocument()
    //     })
    //
    //     it('renders the resource value if it is greater than 0', () => {
    //         const intentWithResources = { ...mockIntent, resources: 5 }
    //         renderTableCell(
    //             <IntentResourcesCellContent
    //                 intent={intentWithResources}
    //                 column={IntentTableColumn.Resources}
    //             />,
    //         )
    //         expect(screen.getByText('5')).toBeInTheDocument()
    //     })
    // })

    describe('IntentAutomationOpportunitiesCellContent', () => {
        it('renders BadgeWithTiers with correct props', () => {
            renderTableCell(
                <IntentAutomationOpportunitiesCellContent
                    intent={mockIntent}
                    column={IntentTableColumn.AutomationOpportunities}
                    allIntents={mockAllIntents}
                />,
            )
            expect(screen.getByText('+50%')).toBeInTheDocument()
        })
    })

    describe('LoadingIntentCellContent', () => {
        it('renders a Skeleton loader', () => {
            renderTableCell(
                <LoadingIntentCellContent column={IntentTableColumn.Tickets} />,
            )
            const skeleton = screen.getByRole('cell', { hidden: true })
            expect(skeleton).toBeInTheDocument()
        })
    })

    describe('BodyCellWrapper', () => {
        it('renders children when not loading', () => {
            renderTableCell(
                <BodyCellWrapper bodyCellProps={{ width: 200 }}>
                    <div>Child Content</div>
                </BodyCellWrapper>,
            )
            expect(screen.getByText('Child Content')).toBeInTheDocument()
        })

        it('renders Skeleton when loading', () => {
            renderTableCell(
                <BodyCellWrapper isLoading bodyCellProps={{ width: 200 }} />,
            )
            const skeleton = screen.getByRole('cell', { hidden: true })
            expect(skeleton).toBeInTheDocument()
        })
    })

    describe('IntentAvgCsatCellContent', () => {
        const mockIntent = {
            id: '1',
            [IntentTableColumn.IntentName]: 'Mock Intent Name',
            [IntentTableColumn.AvgCustomerSatisfaction]: 4.567,
        } as unknown as Intent

        it('formats and displays the value correctly when intent[column] exists', () => {
            const { getByText } = render(
                <IntentAvgCsatCellContent
                    intent={mockIntent}
                    column={IntentTableColumn.AvgCustomerSatisfaction}
                />,
            )

            const formattedValue = 4.6

            expect(getByText(formattedValue)).toBeInTheDocument()
        })

        it('displays a dash when intent[column] is undefined', () => {
            const noDataIntent = {
                id: '1',
                [IntentTableColumn.IntentName]: 'Mock Intent Name',
            } as unknown as Intent

            const { getByText } = render(
                <IntentAvgCsatCellContent
                    intent={noDataIntent}
                    column={IntentTableColumn.AvgCustomerSatisfaction}
                />,
            )

            expect(getByText('-')).toBeInTheDocument()
        })
    })
})
