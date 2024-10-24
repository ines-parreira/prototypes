import {render} from '@testing-library/react'
import React from 'react'
import {Route, useRouteMatch} from 'react-router-dom'

import {PageSection} from 'config/pages'
import {ADMIN_ROLE} from 'config/user'
import ImportData from 'pages/settings/importData/ImportData'
import ImportZendeskCreate from 'pages/settings/importData/zendesk/ImportZendeskCreate'
import ImportZendeskDetail from 'pages/settings/importData/zendesk/ImportZendeskDetail'
import {assumeMock} from 'utils/testing'

import {renderAppSettings} from '../helpers/settingsRenderer'
import {Import} from '../Import'

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

const basePath = 'import-data'

describe('Import', () => {
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
                component: ImportData,
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
        ({callOrder, path, component}) => {
            render(<Import />)

            expect(mockedRenderAppSettings.mock.calls[callOrder]).toEqual([
                component,
                {
                    roleParams: [ADMIN_ROLE, PageSection.ImportData],
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
