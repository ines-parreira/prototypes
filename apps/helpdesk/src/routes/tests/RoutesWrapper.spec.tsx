import { useFlag } from '@repo/feature-flags'
import { assumeMock } from '@repo/testing'
import { render, screen } from '@testing-library/react'
import { StaticRouter } from 'react-router-dom'

import RoutesWrapper from '../RoutesWrapper'

jest.mock('@repo/feature-flags', () => ({
    ...jest.requireActual('@repo/feature-flags'),
    useFlag: jest.fn(),
}))
const useFlagMock = assumeMock(useFlag)

jest.mock('../PanelRoutes', () => ({
    __esModule: true,
    ...jest.requireActual('../PanelRoutes'),
    default: () => <div>PanelRoutes</div>,
}))
jest.mock('../Routes', () => () => <div>Routes</div>)

describe('RoutesWrapper', () => {
    beforeEach(() => {
        useFlagMock.mockReturnValue(false)
    })

    it('should render routes if the feature flag is not enabled', () => {
        render(
            <StaticRouter location="/">
                <RoutesWrapper />
            </StaticRouter>,
        )
        expect(screen.getByText('Routes')).toBeInTheDocument()
    })

    it('should render routes if the feature flag is enabled but the route is not a panel route', () => {
        useFlagMock.mockReturnValue(true)
        render(
            <StaticRouter location="/settings">
                <RoutesWrapper />
            </StaticRouter>,
        )
        expect(screen.getByText('Routes')).toBeInTheDocument()
    })

    it('should render panel routes if the feature flag is enabled and the route is a panel route', () => {
        useFlagMock.mockReturnValue(true)
        render(
            <StaticRouter location="/app">
                <RoutesWrapper />
            </StaticRouter>,
        )
        expect(screen.getByText('PanelRoutes')).toBeInTheDocument()
    })
})
