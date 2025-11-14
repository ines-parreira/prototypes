import React from 'react'

import { assumeMock } from '@repo/testing'
import { render } from '@testing-library/react'
import { Route, useRouteMatch } from 'react-router-dom'

import { PageSection } from 'config/pages'
import { ADMIN_ROLE } from 'config/user'
import AgentDetail from 'pages/settings/users/Detail'
import AgentList from 'pages/settings/users/List'

import { renderAppSettings } from '../helpers/settingsRenderer'
import { Users } from '../Users'

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
const mockedRenderAppSettings = assumeMock(renderAppSettings)
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
        ({ callOrder, path, component }) => {
            render(<Users />)

            expect(mockedRenderAppSettings.mock.calls[callOrder]).toEqual([
                component,
                {
                    roleParams: [ADMIN_ROLE, PageSection.Users],
                },
            ])
            expect(mockedRoute.mock.calls[callOrder]).toEqual([
                {
                    path,
                    exact: true,
                    children: ComponentToRender,
                },
                {},
            ])
        },
    )
})
