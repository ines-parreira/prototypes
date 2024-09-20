import React from 'react'
import {Route, useRouteMatch} from 'react-router-dom'
import {render} from '@testing-library/react'

import {assumeMock} from 'utils/testing'

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
}))

jest.mock('pages/App', () => () => <div>App</div>)

const mockedRoute = Route as jest.Mock
const mockedUseRouteMatch = assumeMock(useRouteMatch)

const basePath = 'settings'

const testingMap = [
    {
        callOrder: 1,
        exact: undefined,
        path: `${basePath}/billing`,
        component: Billing,
        callsRenderer: false,
    },
    {
        callOrder: 2,
        exact: undefined,
        path: `${basePath}/channels`,
        component: Channels,
        callsRenderer: false,
    },
    {
        callOrder: 3,
        exact: undefined,
        path: `${basePath}/contact-form`,
        component: ContactForm,
        callsRenderer: false,
    },
    {
        callOrder: 4,
        exact: undefined,
        path: `${basePath}/convert`,
        component: Convert,
        callsRenderer: false,
    },
    {
        callOrder: 5,
        exact: undefined,
        path: `${basePath}/ticket-fields`,
        component: CustomFields,
        callsRenderer: false,
    },
    {
        callOrder: 6,
        exact: undefined,
        path: `${basePath}/customer-fields`,
        component: CustomFields,
        callsRenderer: false,
    },
    {
        callOrder: 8,
        exact: undefined,
        path: `${basePath}/import-data`,
        component: Import,
        callsRenderer: false,
    },
    {
        callOrder: 9,
        exact: undefined,
        path: `${basePath}/integrations`,
        component: Integrations,
        callsRenderer: false,
    },
    {
        callOrder: 10,
        exact: undefined,
        path: `${basePath}/phone-numbers`,
        component: PhoneNumbers,
        callsRenderer: false,
    },
    {
        callOrder: 11,
        exact: undefined,
        path: `${basePath}/macros`,
        component: Macros,
        callsRenderer: false,
    },
    {
        callOrder: 12,
        exact: undefined,
        path: `${basePath}/rules`,
        component: Rules,
        callsRenderer: false,
    },
    {
        callOrder: 13,
        exact: undefined,
        path: `${basePath}/sla`,
        component: SLA,
        callsRenderer: false,
    },
    {
        callOrder: 14,
        exact: undefined,
        path: `${basePath}/teams`,
        component: Teams,
        callsRenderer: false,
    },
    {
        callOrder: 15,
        exact: undefined,
        path: `${basePath}/users`,
        component: Users,
        callsRenderer: false,
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
            ({callOrder, exact, path, component, callsRenderer}) => {
                expect(mockedRoute.mock.calls[callOrder]).toEqual([
                    expect.objectContaining({
                        path,
                        ...(exact ? {exact} : {}),
                    }),
                    {},
                ])
                if (!callsRenderer) {
                    expect(mockedRoute.mock.calls[callOrder]).toEqual([
                        expect.objectContaining({
                            children: expect.objectContaining({
                                type: component,
                            }),
                        }),
                        {},
                    ])
                }
            }
        )
    })
})
