import {render, screen} from '@testing-library/react'
import React from 'react'
import {MemoryRouter} from 'react-router-dom'

import {
    Intent,
    IntentTableColumn,
} from 'pages/aiAgent/insights/IntentTableWidget/types'
import TableBody from 'pages/common/components/table/TableBody'
import TableBodyRow from 'pages/common/components/table/TableBodyRow'
import TableWrapper from 'pages/common/components/table/TableWrapper'

import {
    IntentNameCellContent,
    IntentDefaultCellContent,
    IntentAutomationOpportunitiesCellContent,
    LoadingIntentCellContent,
    BodyCellWrapper,
    IntentAvgCsatCellContent,
    IntentResourcesCellContent,
} from '../IntentTableCells'

const renderTableCell = (cellContent: React.ReactNode) => {
    render(
        <MemoryRouter>
            <TableWrapper>
                <TableBody>
                    <TableBodyRow>{cellContent}</TableBodyRow>
                </TableBody>
            </TableWrapper>
        </MemoryRouter>
    )
}

describe('IntentTableCells', () => {
    const mockIntent = {
        id: '1',
        [IntentTableColumn.IntentName]: 'Mock Intent Name',
        [IntentTableColumn.AutomationOpportunities]: 0.5,
        [IntentTableColumn.Resources]: 0,
        [IntentTableColumn.Tickets]: 200,
    } as unknown as Intent

    const mockAllIntents = [
        {id: '1', [IntentTableColumn.AutomationOpportunities]: 0.5},
        {id: '2', [IntentTableColumn.AutomationOpportunities]: 0.7},
        {id: '3', [IntentTableColumn.AutomationOpportunities]: 0.3},
    ] as unknown as Intent[]

    describe('IntentNameCellContent', () => {
        it('renders a link to the intent with the correct text', () => {
            renderTableCell(
                <IntentNameCellContent
                    intent={mockIntent}
                    column={IntentTableColumn.IntentName}
                />
            )
            const link = screen.getByRole('cell')
            expect(link).toHaveTextContent('Mock Intent Name')
        })
    })

    describe('IntentDefaultCellContent', () => {
        it('renders formatted metric value for the column', () => {
            renderTableCell(
                <IntentDefaultCellContent
                    intent={mockIntent}
                    column={IntentTableColumn.Tickets}
                />
            )
            expect(screen.getByText('200')).toBeInTheDocument()
        })
    })

    describe('IntentResourcesCellContent', () => {
        it('renders "Missing" if the resource value is 0', () => {
            renderTableCell(
                <IntentResourcesCellContent
                    intent={mockIntent}
                    column={IntentTableColumn.Resources}
                />
            )
            expect(screen.getByText('Missing')).toBeInTheDocument()
        })

        it('renders the resource value if it is greater than 0', () => {
            const intentWithResources = {...mockIntent, resources: 5}
            renderTableCell(
                <IntentResourcesCellContent
                    intent={intentWithResources}
                    column={IntentTableColumn.Resources}
                />
            )
            expect(screen.getByText('5')).toBeInTheDocument()
        })
    })

    describe('IntentAutomationOpportunitiesCellContent', () => {
        it('renders BadgeWithTiers with correct props', () => {
            renderTableCell(
                <IntentAutomationOpportunitiesCellContent
                    intent={mockIntent}
                    column={IntentTableColumn.AutomationOpportunities}
                    allIntents={mockAllIntents}
                />
            )
            expect(screen.getByText('+50%')).toBeInTheDocument()
        })
    })

    describe('LoadingIntentCellContent', () => {
        it('renders a Skeleton loader', () => {
            renderTableCell(
                <LoadingIntentCellContent column={IntentTableColumn.Tickets} />
            )
            const skeleton = screen.getByRole('cell', {hidden: true})
            expect(skeleton).toBeInTheDocument()
        })
    })

    describe('BodyCellWrapper', () => {
        it('renders children when not loading', () => {
            renderTableCell(
                <BodyCellWrapper bodyCellProps={{width: 200}}>
                    <div>Child Content</div>
                </BodyCellWrapper>
            )
            expect(screen.getByText('Child Content')).toBeInTheDocument()
        })

        it('renders Skeleton when loading', () => {
            renderTableCell(
                <BodyCellWrapper isLoading bodyCellProps={{width: 200}} />
            )
            const skeleton = screen.getByRole('cell', {hidden: true})
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
            const {getByText} = render(
                <IntentAvgCsatCellContent
                    intent={mockIntent}
                    column={IntentTableColumn.AvgCustomerSatisfaction}
                />
            )

            const formattedValue = 4.6

            expect(getByText(formattedValue)).toBeInTheDocument()
        })

        it('displays a dash when intent[column] is undefined', () => {
            const noDataIntent = {
                id: '1',
                [IntentTableColumn.IntentName]: 'Mock Intent Name',
            } as unknown as Intent

            const {getByText} = render(
                <IntentAvgCsatCellContent
                    intent={noDataIntent}
                    column={IntentTableColumn.AvgCustomerSatisfaction}
                />
            )

            expect(getByText('-')).toBeInTheDocument()
        })
    })
})
