import React from 'react'

import { assumeMock, render } from '@repo/testing'
import { Route, useRouteMatch } from 'react-router-dom'

import { UserDetailRoute, Users, UsersListRoute } from '../Users'

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    Route: jest.fn(() => <div>route</div>),
    Switch: jest.fn(({ children }) => <div>{children}</div>),
    useRouteMatch: jest.fn(),
}))

const ComponentToRender = () => <div>OK</div>
jest.mock('../helpers/settingsRenderer', () => ({
    renderAppSettings: jest.fn(() => ComponentToRender),
}))

const mockedRoute = Route as jest.Mock
const mockedUseRouteMatch = assumeMock(useRouteMatch)

const basePath = 'users'

describe('Users', () => {
    beforeEach(() => {
        mockedUseRouteMatch.mockReturnValue({
            path: basePath,
        } as ReturnType<typeof useRouteMatch>)
    })

    it('should render the list route through UsersListRoute', () => {
        render(<Users />)

        const [props] = mockedRoute.mock.calls[0]
        expect(props.path).toBe(basePath + '/')
        expect(props.exact).toBe(true)
        expect((props.children as React.ReactElement).type).toBe(UsersListRoute)
    })

    it.each([
        [{ routeIndex: 1, path: basePath + '/add' }],
        [{ routeIndex: 2, path: basePath + '/:id' }],
    ])(
        'should render the detail route at $path through UserDetailRoute',
        ({ routeIndex, path }) => {
            render(<Users />)

            const [props] = mockedRoute.mock.calls[routeIndex]
            expect(props.path).toBe(path)
            expect(props.exact).toBe(true)
            expect((props.children as React.ReactElement).type).toBe(
                UserDetailRoute,
            )
        },
    )
})
