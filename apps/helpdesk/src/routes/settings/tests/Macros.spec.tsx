import React from 'react'

import { assumeMock } from '@repo/testing'
import { render } from '@testing-library/react'
import { Redirect, Route, useRouteMatch } from 'react-router-dom'

import { PageSection } from 'config/pages'
import { AGENT_ROLE } from 'config/user'
import MacrosSettingsContent from 'pages/settings/macros/MacrosSettingsContent'
import MacrosSettingsForm from 'pages/settings/macros/MacrosSettingsForm'

import { renderAppSettings } from '../helpers/settingsRenderer'
import { Macros } from '../Macros'

jest.mock('react-router-dom', () => ({
    Redirect: jest.fn(() => <div>redirect</div>),
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

const basePath = 'macros'

describe('Macros', () => {
    beforeEach(() => {
        mockedUseRouteMatch.mockReturnValue({
            path: basePath,
        } as ReturnType<typeof useRouteMatch>)
    })

    it('should call Redirect with correct props', () => {
        render(<Macros />)

        expect(mockedRoute.mock.calls[0]).toEqual([
            {
                exact: true,
                path: basePath + '/',
                children: expect.objectContaining({
                    type: Redirect,
                    props: expect.objectContaining({
                        to: `${basePath}/active`,
                    }),
                }),
            },
            {},
        ])
    })

    it.each([
        [
            {
                callOrder: 0,
                routeCallOrder: 1,
                path: basePath + '/new',
                role: AGENT_ROLE,
                pageSection: PageSection.SidebarSettings,
                component: MacrosSettingsForm,
                exact: true,
            },
        ],
        [
            {
                callOrder: 1,
                routeCallOrder: 2,
                path: basePath + '/active',
                role: undefined,
                pageSection: undefined,
                component: MacrosSettingsContent,
                exact: true,
            },
        ],
        [
            {
                callOrder: 2,
                routeCallOrder: 3,
                path: basePath + '/archived',
                role: undefined,
                pageSection: undefined,
                component: MacrosSettingsContent,
                exact: true,
            },
        ],
        [
            {
                callOrder: 3,
                routeCallOrder: 4,
                path: basePath + '/:macroId',
                role: undefined,
                pageSection: undefined,
                component: MacrosSettingsForm,
                exact: undefined,
            },
        ],
    ])(
        'should call renderer and Route with correct props',
        ({
            callOrder,
            routeCallOrder,
            path,
            role,
            pageSection,
            component,
            exact,
        }) => {
            render(<Macros />)

            expect(mockedRenderAppSettings.mock.calls[callOrder]).toEqual([
                component,
                (role && {
                    roleParams: [role, pageSection],
                }) ||
                    undefined,
            ])

            expect(mockedRoute.mock.calls[routeCallOrder]).toEqual([
                {
                    path,
                    exact,
                    children: ComponentToRender,
                },
                {},
            ])
        },
    )
})
