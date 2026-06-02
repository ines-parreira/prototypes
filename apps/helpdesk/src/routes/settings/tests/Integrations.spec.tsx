import React from 'react'

import { assumeMock, render } from '@repo/testing'
import { Route, useRouteMatch } from 'react-router-dom'

import { PageSection } from 'config/pages'
import { ADMIN_ROLE } from 'config/user'
import AppDetail from 'pages/integrations/integration/components/app/App'
import AppConnectionEdit from 'pages/integrations/integration/components/app/AppConnectionEdit'
import IntegrationDetail from 'pages/integrations/integration/Integration'
import IntegrationsStore from 'pages/integrations/Store'
import MyIntegrations from 'pages/integrations/Store/Mine'

import { renderAppSettings } from '../helpers/settingsRenderer'
import { Integrations } from '../Integrations'

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

const basePath = 'integrations'

describe('Integration', () => {
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
                roleParams: [ADMIN_ROLE, PageSection.Integrations],
                component: IntegrationsStore,
            },
        ],
        [
            {
                callOrder: 1,
                path: basePath + '/mine',
                roleParams: [ADMIN_ROLE, PageSection.Integrations],
                component: MyIntegrations,
            },
        ],
        [
            {
                callOrder: 2,
                path: basePath + '/app/:appId/credentials/:connectionId',
                roleParams: [ADMIN_ROLE],
                component: AppConnectionEdit,
            },
        ],
        [
            {
                callOrder: 3,
                path: basePath + '/app/:appId/:extra?',
                roleParams: [ADMIN_ROLE],
                component: AppDetail,
            },
        ],
        [
            {
                callOrder: 4,
                path:
                    basePath +
                    '/:integrationType/:integrationId?/:extra?/:subId?',
                roleParams: [ADMIN_ROLE, PageSection.Integrations],
                component: IntegrationDetail,
            },
        ],
    ])(
        'should call renderer and Route with correct props',
        ({ callOrder, path, roleParams, component }) => {
            render(<Integrations />)

            expect(mockedRenderAppSettings.mock.calls[callOrder]).toEqual([
                component,
                {
                    roleParams,
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
