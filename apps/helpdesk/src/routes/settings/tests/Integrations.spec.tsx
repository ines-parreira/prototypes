import React from 'react'

import { assumeMock } from '@repo/testing'
import { render } from '@testing-library/react'
import { Route, useRouteMatch } from 'react-router-dom'

import { PageSection } from 'config/pages'
import { ADMIN_ROLE } from 'config/user'
import AppDetail from 'pages/integrations/integration/components/app/App'
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
                pageSection: PageSection.Integrations,
                component: IntegrationsStore,
            },
        ],
        [
            {
                callOrder: 1,
                path: basePath + '/mine',
                pageSection: PageSection.Integrations,
                component: MyIntegrations,
            },
        ],
        [
            {
                callOrder: 2,
                path: basePath + '/app/:appId/:extra?',
                pageSection: undefined,
                component: AppDetail,
            },
        ],
        [
            {
                callOrder: 3,
                path:
                    basePath +
                    '/:integrationType/:integrationId?/:extra?/:subId?',
                pageSection: PageSection.Integrations,
                component: IntegrationDetail,
            },
        ],
    ])(
        'should call renderer and Route with correct props',
        ({ callOrder, path, pageSection, component }) => {
            render(<Integrations />)

            expect(mockedRenderAppSettings.mock.calls[callOrder]).toEqual([
                component,
                {
                    roleParams: [ADMIN_ROLE, pageSection],
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
