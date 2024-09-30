import React from 'react'
import {Route, useRouteMatch} from 'react-router-dom'
import {render} from '@testing-library/react'

import {PageSection} from 'config/pages'
import {AGENT_ROLE} from 'config/user'
import MacrosSettingsContent from 'pages/settings/macros/MacrosSettingsContent'
import MacrosSettingsForm from 'pages/settings/macros/MacrosSettingsForm'
import {assumeMock} from 'utils/testing'

import {renderAppSettings} from '../helpers/settingsRenderer'
import {Macros} from '../Macros'

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

const basePath = 'macro'

describe('Macros', () => {
    beforeEach(() => {
        mockedUseRouteMatch.mockReturnValue({
            path: basePath,
        } as ReturnType<typeof useRouteMatch>)
    })

    it.each([
        [
            {
                callOrder: 0,
                path: basePath,
                role: undefined,
                pageSection: undefined,
                component: MacrosSettingsContent,
            },
        ],
        [
            {
                callOrder: 1,
                path: basePath + '/new',
                role: AGENT_ROLE,
                pageSection: PageSection.SidebarSettings,
                component: MacrosSettingsForm,
            },
        ],
        [
            {
                callOrder: 2,
                path: basePath + '/:macroId',
                role: undefined,
                pageSection: undefined,
                component: MacrosSettingsForm,
            },
        ],
    ])(
        'should call renderer and Route with correct props',
        ({callOrder, path, role, pageSection, component}) => {
            render(<Macros />)

            expect(mockedRenderAppSettings.mock.calls[callOrder]).toEqual([
                component,
                (role && {
                    roleParams: [role, pageSection],
                }) ||
                    undefined,
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
