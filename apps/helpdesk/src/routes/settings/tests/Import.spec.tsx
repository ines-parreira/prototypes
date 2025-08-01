import React from 'react'

import { assumeMock } from '@repo/testing'
import { render } from '@testing-library/react'
import { Route, useRouteMatch } from 'react-router-dom'

import { PageSection } from 'config/pages'
import { ADMIN_ROLE } from 'config/user'
import ImportZendesk from 'pages/settings/importZendesk/ImportZendesk'
import ImportZendeskCreate from 'pages/settings/importZendesk/zendesk/ImportZendeskCreate'
import ImportZendeskDetail from 'pages/settings/importZendesk/zendesk/ImportZendeskDetail'

import { renderAppSettings } from '../helpers/settingsRenderer'
import { ImportZendeskRoute } from '../ImportZendeskRoute'

jest.mock('react-router-dom', () => ({
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

const basePath = 'import-zendesk'

describe('Import Zendesk', () => {
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
                component: ImportZendesk,
            },
        ],
        [
            {
                callOrder: 1,
                path: basePath + '/zendesk',
                component: ImportZendeskCreate,
            },
        ],
        [
            {
                callOrder: 2,
                path: basePath + '/zendesk/:integrationId/:extra?',
                component: ImportZendeskDetail,
            },
        ],
    ])(
        'should call renderer and Route with correct props',
        ({ callOrder, path, component }) => {
            render(<ImportZendeskRoute />)

            expect(mockedRenderAppSettings.mock.calls[callOrder]).toEqual([
                component,
                {
                    roleParams: [ADMIN_ROLE, PageSection.ImportZendesk],
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
