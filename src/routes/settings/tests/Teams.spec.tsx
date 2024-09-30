import React from 'react'
import {Route, useRouteMatch} from 'react-router-dom'
import {render} from '@testing-library/react'

import {PageSection} from 'config/pages'
import {ADMIN_ROLE} from 'config/user'
import TeamsList from 'pages/settings/teams/List'
import TeamsForm from 'pages/settings/teams/Form'
import List from 'pages/settings/teams/members/List'
import {assumeMock} from 'utils/testing'

import {renderAppSettings} from '../helpers/settingsRenderer'
import {Teams} from '../Teams'

jest.mock('react-router-dom', () => ({
    Route: jest.fn(() => <div>route</div>),
    Switch: jest.fn(({children}) => <div>{children}</div>),
    useRouteMatch: jest.fn(),
}))

const ComponentToRender = () => <div>OK</div>
jest.mock('../helpers/settingsRenderer', () => ({
    renderAppSettings: jest.fn(() => ComponentToRender),
}))

const mockedRoute = Route as jest.Mock
const mockedRenderAppSettings = assumeMock(renderAppSettings)
const mockedUseRouteMatch = assumeMock(useRouteMatch)

const basePath = 'teams'

describe('Teams', () => {
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
                component: TeamsList,
            },
        ],
        [
            {
                callOrder: 1,
                path: basePath + '/:id',
                component: TeamsForm,
            },
        ],
        [
            {
                callOrder: 2,
                path: basePath + '/:id/members',
                component: List,
            },
        ],
    ])(
        'should call renderer and Route with correct props',
        ({callOrder, path, component}) => {
            render(<Teams />)

            expect(mockedRenderAppSettings.mock.calls[callOrder]).toEqual([
                component,
                {
                    roleParams: [ADMIN_ROLE, PageSection.Teams],
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
        }
    )
})
