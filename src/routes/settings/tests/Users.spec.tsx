import React from 'react'
import {Route, useRouteMatch} from 'react-router-dom'
import {render} from '@testing-library/react'

import {PageSection} from 'config/pages'
import {ADMIN_ROLE} from 'config/user'
import AgentList from 'pages/settings/users/List'
import AgentDetail from 'pages/settings/users/Detail'
import {assumeMock} from 'utils/testing'

import {renderer} from '../helpers/settingsRenderer'
import {Users} from '../Users'

jest.mock('react-router-dom', () => ({
    Route: jest.fn(() => <div>route</div>),
    Switch: jest.fn(({children}) => <div>{children}</div>),
    useRouteMatch: jest.fn(),
}))

const ComponentToRender = () => <div>OK</div>
jest.mock('../helpers/settingsRenderer', () => ({
    renderer: jest.fn(() => ComponentToRender),
}))

const mockedRoute = Route as jest.Mock
const mockedRenderer = assumeMock(renderer)
const mockedUseRouteMatch = assumeMock(useRouteMatch)

const basePath = 'users'

describe('Users', () => {
    beforeEach(() => {
        mockedUseRouteMatch.mockReturnValue({
            path: basePath,
        } as ReturnType<typeof useRouteMatch>)
    })

    it.each([
        [
            {
                callOrder: 0,
                path: basePath + '/',
                component: AgentList,
            },
        ],
        [
            {
                callOrder: 1,
                path: basePath + '/add',
                component: AgentDetail,
            },
        ],
        [
            {
                callOrder: 2,
                path: basePath + '/:id',
                component: AgentDetail,
            },
        ],
    ])(
        'should call renderer and Route with correct props',
        ({callOrder, path, component}) => {
            render(<Users />)

            expect(mockedRenderer.mock.calls[callOrder]).toEqual([
                component,
                ADMIN_ROLE,
                PageSection.Users,
            ])
            expect(mockedRoute.mock.calls[callOrder]).toEqual([
                {
                    path,
                    exact: true,
                    render: ComponentToRender,
                },
                {},
            ])
        }
    )
})
