import React from 'react'

import { render, screen } from '@testing-library/react'
import Skeleton from 'react-loading-skeleton'

import { NO_DATA_AVAILABLE_COMPONENT_TITLE } from 'domains/reporting/pages/common/components/NoDataAvailable'
import { HintTooltipContent } from 'domains/reporting/pages/common/HintTooltip'
import { TableFallbackDisplay } from 'domains/reporting/pages/ticket-insights/components/TableFallbackDisplay'
import { assumeMock } from 'utils/testing'

jest.mock('react-loading-skeleton')
const SkeletonMock = assumeMock(Skeleton)

jest.mock('domains/reporting/pages/common/HintTooltip')
const HintTooltipContentMock = assumeMock(HintTooltipContent)

describe('TableFallbackDisplay', () => {
    const mockColumnOrder = ['name', 'value']
    const mockColumnConfig = {
        name: {
            title: 'Name1',
            tooltip: { title: 'Name1 tooltip' },
            isSortable: true,
        },
        value: {
            title: 'Name2',
            tooltip: { title: 'Name2 tooltip' },
            isSortable: true,
        },
    }

    const defaultProps = {
        isLoading: false,
        noData: false,
        columnOrder: mockColumnOrder,
        columnConfig: mockColumnConfig,
        rowsPerPage: 1,
        children: <div>Test content</div>,
    }

    beforeEach(() => {
        SkeletonMock.mockImplementation(() => (
            <div className="react-loading-skeleton" />
        ))

        HintTooltipContentMock.mockImplementation(() => <div />)
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    it('should render skeleton table when loading', () => {
        const { container } = render(
            <TableFallbackDisplay {...defaultProps} isLoading={true} />,
        )

        expect(screen.getByRole('table')).toBeInTheDocument()
        expect(screen.getByText('Name1')).toBeInTheDocument()
        expect(screen.getByText('Name2')).toBeInTheDocument()

        const skeletons = container.getElementsByClassName(
            'react-loading-skeleton',
        )
        expect(skeletons.length).toBeGreaterThan(0)
    })

    it('should render NoDataAvailable when no data', () => {
        render(<TableFallbackDisplay {...defaultProps} noData={true} />)

        expect(screen.getByRole('table')).toBeInTheDocument()
        expect(screen.getByText('Name1')).toBeInTheDocument()
        expect(screen.getByText('Name2')).toBeInTheDocument()
        expect(
            screen.getByText(NO_DATA_AVAILABLE_COMPONENT_TITLE),
        ).toBeInTheDocument()
    })

    it('should render children when neither loading nor no data', () => {
        render(
            <TableFallbackDisplay
                {...defaultProps}
                isLoading={false}
                noData={false}
            />,
        )

        expect(screen.getByText('Test content')).toBeInTheDocument()
        expect(screen.queryByRole('table')).not.toBeInTheDocument()
    })

    it('should prioritize loading state over no data state', () => {
        const { container } = render(
            <TableFallbackDisplay
                {...defaultProps}
                isLoading={true}
                noData={true}
            />,
        )

        const skeletons = container.getElementsByClassName(
            'react-loading-skeleton',
        )
        expect(skeletons.length).toBeGreaterThan(0)
        expect(
            screen.queryByText(NO_DATA_AVAILABLE_COMPONENT_TITLE),
        ).not.toBeInTheDocument()
    })
})
