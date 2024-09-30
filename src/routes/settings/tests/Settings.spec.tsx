import React from 'react'
import {Route, useRouteMatch} from 'react-router-dom'
import {render} from '@testing-library/react'

import {ADMIN_ROLE} from 'config/user'
import {PageSection} from 'config/pages'
import {assumeMock} from 'utils/testing'

import IntegrationDetail from 'pages/integrations/integration/Integration'

import {renderAppSettings} from '../helpers/settingsRenderer'
import {SettingRoutes} from '../Settings'

import {Billing} from '../Billing'
import {Channels} from '../Channels'
import {ContactForm} from '../ContactForm'
import {Convert} from '../Convert'
import {CustomFields} from '../CustomFields'
import {Import} from '../Import'
import {Integrations} from '../Integrations'
import {Macros} from '../Macros'
import {PhoneNumbers} from '../PhoneNumbers'
import {Rules} from '../Rules'
import {SLA} from '../SLA'
import {Teams} from '../Teams'
import {Users} from '../Users'

jest.mock('react-router-dom', () => ({
    Route: jest.fn(() => <div>route</div>),
    Switch: jest.fn(({children}) => <div>{children}</div>),
    useRouteMatch: jest.fn(),
    Link: jest.fn(() => <div>Link</div>),
}))

jest.mock('../helpers/settingsRenderer', () => ({
    renderAppSettings: jest.fn((Component: () => JSX.Element) => <Component />),
}))

const mockedRoute = Route as jest.Mock
const mockedUseRouteMatch = assumeMock(useRouteMatch)
const mockedRenderAppSettings = assumeMock(renderAppSettings)

const basePath = 'settings'

const testingMap = [
    {
        callOrder: 0,
        exact: true,
        path: `${basePath}/`,
        component: IntegrationDetail,
        renderHelperProps: {
            roleParams: [
                ADMIN_ROLE,
                PageSection.Channels,
                `${basePath}/help-center`,
            ],
        },
        renderHelperCallOrder: 0,
    },
    {
        callOrder: 1,
        exact: undefined,
        path: `${basePath}/billing`,
        component: Billing,
    },
    {
        callOrder: 2,
        exact: undefined,
        path: `${basePath}/channels`,
        component: Channels,
    },
    {
        callOrder: 3,
        exact: undefined,
        path: `${basePath}/contact-form`,
        component: ContactForm,
    },
    {
        callOrder: 4,
        exact: undefined,
        path: `${basePath}/convert`,
        component: Convert,
    },
    {
        callOrder: 5,
        exact: undefined,
        path: `${basePath}/ticket-fields`,
        component: CustomFields,
    },
    {
        callOrder: 6,
        exact: undefined,
        path: `${basePath}/customer-fields`,
        component: CustomFields,
    },
    {
        callOrder: 8,
        exact: undefined,
        path: `${basePath}/import-data`,
        component: Import,
    },
    {
        callOrder: 9,
        exact: undefined,
        path: `${basePath}/integrations`,
        component: Integrations,
    },
    {
        callOrder: 10,
        exact: undefined,
        path: `${basePath}/phone-numbers`,
        component: PhoneNumbers,
    },
    {
        callOrder: 11,
        exact: undefined,
        path: `${basePath}/macros`,
        component: Macros,
    },
    {
        callOrder: 12,
        exact: undefined,
        path: `${basePath}/rules`,
        component: Rules,
    },
    {
        callOrder: 13,
        exact: undefined,
        path: `${basePath}/sla`,
        component: SLA,
    },
    {
        callOrder: 14,
        exact: undefined,
        path: `${basePath}/teams`,
        component: Teams,
    },
    {
        callOrder: 15,
        exact: undefined,
        path: `${basePath}/users`,
        component: Users,
    },
]

describe('Settings', () => {
    beforeEach(() => {
        mockedUseRouteMatch.mockReturnValue({
            path: basePath,
        } as ReturnType<typeof useRouteMatch>)
    })

    it('should call renderer and Route according to the testing map ', () => {
        render(<SettingRoutes />)

        testingMap.forEach(
            ({
                callOrder,
                exact,
                path,
                component,
                renderHelperProps,
                renderHelperCallOrder,
            }) => {
                expect(mockedRoute.mock.calls[callOrder]).toEqual([
                    {
                        children: expect.objectContaining({
                            type: component,
                        }),
                        path,
                        ...(exact ? {exact} : {}),
                    },
                    {},
                ])
                if (renderHelperProps) {
                    expect(
                        mockedRenderAppSettings.mock.calls[
                            renderHelperCallOrder
                        ]
                    ).toEqual([component, renderHelperProps])
                }
            }
        )
    })
})
