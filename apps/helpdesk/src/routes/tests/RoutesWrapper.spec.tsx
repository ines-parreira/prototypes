import { useHelpdeskV2WayfindingMS1Flag } from '@repo/feature-flags'
import { assumeMock } from '@repo/testing'
import { render, screen } from '@testing-library/react'
import { StaticRouter } from 'react-router-dom'

import RoutesWrapper from '../RoutesWrapper'

jest.mock('@repo/feature-flags', () => ({
    ...jest.requireActual('@repo/feature-flags'),
    useHelpdeskV2WayfindingMS1Flag: jest.fn(),
}))
const useHelpdeskV2WayfindingMS1FlagMock = assumeMock(
    useHelpdeskV2WayfindingMS1Flag,
)

jest.mock('../PanelRoutes', () => ({
    __esModule: true,
    ...jest.requireActual('../PanelRoutes'),
    default: () => <div>PanelRoutes</div>,
}))
jest.mock('../Routes', () => () => <div>Routes</div>)

describe('RoutesWrapper', () => {
    describe('when wayfinding flag is disabled', () => {
        beforeEach(() => {
            useHelpdeskV2WayfindingMS1FlagMock.mockReturnValue(false)
        })

        it('should render panel routes if the route is a panel route', () => {
            render(
                <StaticRouter location="/app">
                    <RoutesWrapper />
                </StaticRouter>,
            )

            expect(screen.queryByText('Routes')).not.toBeInTheDocument()
            expect(screen.getByText('PanelRoutes')).toBeInTheDocument()
            expect(screen.queryByText('Sidebar')).not.toBeInTheDocument()
        })

        it('should render routes if the route is not a panel route', () => {
            render(
                <StaticRouter location="/settings">
                    <RoutesWrapper />
                </StaticRouter>,
            )

            expect(screen.getByText('Routes')).toBeInTheDocument()
            expect(screen.queryByText('PanelRoutes')).not.toBeInTheDocument()
            expect(screen.queryByText('Sidebar')).not.toBeInTheDocument()
        })
    })

    describe('when wayfinding flag is enabled', () => {
        beforeEach(() => {
            useHelpdeskV2WayfindingMS1FlagMock.mockReturnValue(true)
        })

        it('should render AppLayout with panel routes for /app path', () => {
            render(
                <StaticRouter location="/app">
                    <RoutesWrapper />
                </StaticRouter>,
            )

            expect(screen.getByText('Sidebar')).toBeInTheDocument()
            expect(screen.queryByText('Routes')).not.toBeInTheDocument()
            expect(screen.getByText('PanelRoutes')).toBeInTheDocument()
        })

        it('should render AppLayout with routes if the route is not a panel route', () => {
            render(
                <StaticRouter location="/settings">
                    <RoutesWrapper />
                </StaticRouter>,
            )

            expect(screen.getByText('Sidebar')).toBeInTheDocument()
            expect(screen.getByText('Routes')).toBeInTheDocument()
            expect(screen.queryByText('PanelRoutes')).not.toBeInTheDocument()
        })
    })
})
