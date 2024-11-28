import {useListAnalyticsCustomReports} from '@gorgias/api-queries'
import {screen, fireEvent} from '@testing-library/react'
import React from 'react'
import {DndProvider} from 'react-dnd'
import {HTML5Backend} from 'react-dnd-html5-backend'

import {
    CustomReportsNavbarBlock,
    CUSTOM_REPORTS_NAV_TITLE,
    CREATE_CUSTOM_REPORT,
} from 'pages/stats/custom-reports/CustomReportsNavbarBlock/CustomReportsNavbarBlock'
import {renderWithQueryClientAndRouter} from 'tests/renderWIthQueryClientAndRouter'
import {assumeMock} from 'utils/testing'

jest.mock('@gorgias/api-queries')

const useListAnalyticsCustomReportsMock = assumeMock(
    useListAnalyticsCustomReports
)

const mockPush = jest.fn()

jest.mock(
    'react-router-dom',
    () =>
        ({
            ...jest.requireActual('react-router-dom'),
            useHistory: () => ({
                push: mockPush,
            }),
        }) as Record<string, unknown>
)

describe('CustomReportsNavbarBlock', () => {
    it('should render the navbar block with the title and create action', () => {
        useListAnalyticsCustomReportsMock.mockReturnValue({} as any)

        renderWithQueryClientAndRouter(
            <DndProvider backend={HTML5Backend}>
                <CustomReportsNavbarBlock navBarLinkProps={{exact: true}} />
            </DndProvider>
        )

        expect(screen.getByText(CUSTOM_REPORTS_NAV_TITLE)).toBeInTheDocument()

        const createButton = screen.getByText(CREATE_CUSTOM_REPORT)
        expect(createButton).toBeInTheDocument()

        fireEvent.click(createButton)

        expect(mockPush).toHaveBeenCalledWith('/app/stats/custom-reports/new')

        expect(screen.queryByText('Report 1')).not.toBeInTheDocument()
        expect(screen.queryByText('📊')).not.toBeInTheDocument()
    })

    it('should display the list of custom reports when data is available', () => {
        const mockData = {
            data: {
                data: [
                    {id: '1', name: 'Report 1', emoji: '📊'},
                    {id: '2', name: 'Report 2', emoji: 'plus'},
                ],
            },
        }

        useListAnalyticsCustomReportsMock.mockReturnValue({
            data: mockData,
        } as any)

        renderWithQueryClientAndRouter(
            <DndProvider backend={HTML5Backend}>
                <CustomReportsNavbarBlock navBarLinkProps={{exact: true}} />
            </DndProvider>
        )

        expect(screen.getByText('Report 1')).toBeInTheDocument()
        expect(screen.getByText('Report 2')).toBeInTheDocument()

        expect(screen.getByText('📊')).toBeInTheDocument()
        expect(screen.getByText('plus')).toBeInTheDocument()
    })

    it('should correctly navigate to the custom report detail page when a link is clicked', () => {
        const mockData = {
            data: {
                data: [{id: '1', name: 'Report 1', emoji: '📊'}],
            },
        }

        useListAnalyticsCustomReportsMock.mockReturnValue({
            data: mockData,
        } as any)

        renderWithQueryClientAndRouter(
            <DndProvider backend={HTML5Backend}>
                <CustomReportsNavbarBlock navBarLinkProps={{exact: true}} />
            </DndProvider>
        )

        const reportLink = screen.getByText('Report 1')

        expect(reportLink.parentElement).toHaveAttribute(
            'href',
            '/app/stats/custom-reports/1'
        )
    })
})
