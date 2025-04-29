import React from 'react'

import { fireEvent, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HTML5Backend } from 'react-dnd-html5-backend'

import { logEvent, SegmentEvent } from 'common/segment'
import { useDashboardActions } from 'hooks/reporting/dashboards/useDashboardActions'
import { LIMIT_REACHED_MESSAGE } from 'pages/stats/dashboards/constants'
import {
    CREATE_DASHBOARD,
    DASHBOARDS_NAV_TITLE,
    DashboardsNavbarBlock,
    RESTRICTION_MESSAGE,
} from 'pages/stats/dashboards/DashboardsNavbarBlock/DashboardsNavbarBlock'
import { getDashboardPath } from 'pages/stats/dashboards/utils'
import { useReportChartRestrictions } from 'pages/stats/report-chart-restrictions/useReportChartRestrictions'
import { BASE_STATS_PATH, STATS_ROUTES } from 'routes/constants'
import { renderWithQueryClientAndRouter } from 'tests/renderWIthQueryClientAndRouter'
import { isTeamLead } from 'utils'
import { assumeMock } from 'utils/testing'
import { DndProvider } from 'utils/wrappers/DndProvider'

jest.mock('hooks/reporting/dashboards/useDashboardActions')

const useDashboardActionsMock = assumeMock(useDashboardActions)

const mockPush = jest.fn()

jest.mock(
    'react-router-dom',
    () =>
        ({
            ...jest.requireActual('react-router-dom'),
            useHistory: () => ({
                push: mockPush,
            }),
        }) as Record<string, unknown>,
)

jest.mock('hooks/useAppSelector', () => (fn: () => void) => fn())

jest.mock('state/currentUser/selectors', () => ({
    getCurrentUser: jest.fn(),
}))

jest.mock('utils')
const isTeamLeadMock = assumeMock(isTeamLead)

jest.mock('common/segment')
const logEventMock = assumeMock(logEvent)

jest.mock(
    'pages/stats/report-chart-restrictions/useReportChartRestrictions',
    () => ({
        useReportChartRestrictions: jest.fn(),
    }),
)
const useReportChartRestrictionsMock = assumeMock(useReportChartRestrictions)

describe('DashboardsNavbarBlock', () => {
    const defaultMockData = [
        { id: '1', name: 'Report 1', emoji: '📊' },
        { id: '2', name: 'Report 2', emoji: 'plus' },
    ]

    beforeEach(() => {
        useDashboardActionsMock.mockReturnValue({
            getDashboardsHandler: () => defaultMockData,
        } as any)

        useReportChartRestrictionsMock.mockReturnValue({
            isRouteRestrictedToCurrentUser: () => false,
        } as any)
    })

    describe('Admin', () => {
        beforeEach(() => {
            isTeamLeadMock.mockReturnValueOnce(true)
        })

        it('should render the navbar block with the title and create action', () => {
            useDashboardActionsMock.mockReturnValue({
                getDashboardsHandler: () => [],
            } as any)

            renderWithQueryClientAndRouter(
                <DndProvider backend={HTML5Backend}>
                    <DashboardsNavbarBlock navBarLinkProps={{ exact: true }} />
                </DndProvider>,
            )

            expect(screen.getByText(DASHBOARDS_NAV_TITLE)).toBeInTheDocument()

            const createButton = screen.getByText(CREATE_DASHBOARD)
            expect(createButton).toBeInTheDocument()

            fireEvent.click(createButton)

            expect(mockPush).toHaveBeenCalledWith(
                [BASE_STATS_PATH, STATS_ROUTES.DASHBOARDS_NEW].join('/'),
            )

            expect(screen.queryByText('Report 1')).not.toBeInTheDocument()
            expect(screen.queryByText('📊')).not.toBeInTheDocument()
        })

        it('should display the list of dashboards when data is available', () => {
            renderWithQueryClientAndRouter(
                <DndProvider backend={HTML5Backend}>
                    <DashboardsNavbarBlock navBarLinkProps={{ exact: true }} />
                </DndProvider>,
            )

            expect(screen.getByText('Report 1')).toBeInTheDocument()
            expect(screen.getByText('Report 2')).toBeInTheDocument()

            expect(screen.getByText('📊')).toBeInTheDocument()
            expect(screen.getByText('plus')).toBeInTheDocument()
        })

        it('should correctly navigate to the dashboard detail page when a link is clicked', () => {
            const mockData = [{ id: '1', name: 'Report 1', emoji: '📊' }]

            useDashboardActionsMock.mockReturnValue({
                getDashboardsHandler: () => mockData,
            } as any)

            renderWithQueryClientAndRouter(
                <DndProvider backend={HTML5Backend}>
                    <DashboardsNavbarBlock navBarLinkProps={{ exact: true }} />
                </DndProvider>,
            )

            const reportLink = screen.getByText('Report 1')

            expect(reportLink.parentElement).toHaveAttribute(
                'href',
                getDashboardPath(1),
            )
        })

        it('should show limit reached message when there are 10 dashboards', () => {
            const mockData = [
                { id: '1', name: 'Report 1', emoji: '📊' },
                { id: '2', name: 'Report 2', emoji: '📊' },
                { id: '3', name: 'Report 3', emoji: '📊' },
                { id: '4', name: 'Report 4', emoji: '📊' },
                { id: '5', name: 'Report 5', emoji: '📊' },
                { id: '6', name: 'Report 6', emoji: '📊' },
                { id: '7', name: 'Report 7', emoji: '📊' },
                { id: '8', name: 'Report 8', emoji: '📊' },
                { id: '9', name: 'Report 9', emoji: '📊' },
                { id: '10', name: 'Report 10', emoji: '📊' },
            ]

            useDashboardActionsMock.mockReturnValue({
                getDashboardsHandler: () => mockData,
            } as any)

            renderWithQueryClientAndRouter(
                <DndProvider backend={HTML5Backend}>
                    <DashboardsNavbarBlock navBarLinkProps={{ exact: true }} />
                </DndProvider>,
            )

            expect(screen.queryByText(CREATE_DASHBOARD)).not.toBeInTheDocument()
            expect(screen.getByText(LIMIT_REACHED_MESSAGE)).toBeInTheDocument()
        })

        it('should not show the info icon when the user is an Admin', () => {
            renderWithQueryClientAndRouter(
                <DndProvider backend={HTML5Backend}>
                    <DashboardsNavbarBlock navBarLinkProps={{ exact: true }} />
                </DndProvider>,
            )

            expect(screen.getByText('add')).toBeInTheDocument()
            expect(screen.queryByText('info')).not.toBeInTheDocument()
        })

        it('should report clicks on add icon clicked', () => {
            renderWithQueryClientAndRouter(
                <DndProvider backend={HTML5Backend}>
                    <DashboardsNavbarBlock navBarLinkProps={{ exact: true }} />
                </DndProvider>,
            )
            const addIcon = screen.getByText('add')
            expect(addIcon).toBeEnabled()
            userEvent.click(addIcon)

            expect(logEventMock).toHaveBeenCalledWith(
                SegmentEvent.StatDashboardNavCreateChartClicked,
            )
        })
    })

    describe('Lite Agent', () => {
        beforeEach(() => {
            isTeamLeadMock.mockReturnValueOnce(false)
        })

        it('should show the info icon when the user is a LiteAgent', async () => {
            renderWithQueryClientAndRouter(
                <DndProvider backend={HTML5Backend}>
                    <DashboardsNavbarBlock navBarLinkProps={{ exact: true }} />
                </DndProvider>,
            )

            const infoIcon = screen.getByText('info')
            expect(infoIcon).toBeInTheDocument()
            expect(screen.queryByText('add')).not.toBeInTheDocument()
            userEvent.hover(infoIcon)
            await waitFor(() => {
                expect(
                    screen.getByText(RESTRICTION_MESSAGE),
                ).toBeInTheDocument()
            })
        })
    })
})
