import React from 'react'
import {Redirect, Route, useRouteMatch} from 'react-router-dom'
import {render, screen} from '@testing-library/react'

import {PageSection} from 'config/pages'
import {ADMIN_ROLE} from 'config/user'
import {useFlag} from 'common/flags'
import CustomFieldsComponent from 'pages/settings/customFields/CustomFields'
import AddCustomField from 'pages/settings/customFields/AddCustomField'
import EditCustomField from 'pages/settings/customFields/EditCustomField'
import {assumeMock} from 'utils/testing'

import {renderer} from '../helpers/settingsRenderer'
import {CustomFields} from '../CustomFields'

jest.mock('react-router-dom', () => ({
    Redirect: jest.fn(() => <div>Redirect</div>),
    Route: jest.fn(() => <div>route</div>),
    Switch: jest.fn(({children}) => <div>{children}</div>),
    useRouteMatch: jest.fn(),
}))
jest.mock('pages/common/components/NoMatch', () => () => <div>404</div>)
jest.mock('common/flags', () => ({
    useFlag: jest.fn(),
}))
const ComponentToRender = () => <div>OK</div>
jest.mock('../helpers/settingsRenderer', () => ({
    renderer: jest.fn(() => ComponentToRender),
}))

const mockedUseRouteMatch = assumeMock(useRouteMatch)
const mockedRoute = Route as jest.Mock
const mockedUseFlag = assumeMock(useFlag)
const mockedRenderer = assumeMock(renderer)

const baseTicketPath = 'ticket-fields'
const baseCustomerPath = 'customer-fields'

describe('CustomFields', () => {
    beforeEach(() => {
        mockedUseFlag.mockReturnValue(true)
        mockedUseRouteMatch.mockReturnValue({
            path: baseTicketPath,
        } as ReturnType<typeof useRouteMatch>)
    })

    it("should render the NoMatch component if the feature flag isn't enabled and path contains customer-fields", () => {
        mockedUseFlag.mockReturnValue(false)
        mockedUseRouteMatch.mockReturnValue({
            path: baseCustomerPath,
        } as ReturnType<typeof useRouteMatch>)

        render(<CustomFields />)

        expect(screen.getByText('404')).toBeInTheDocument()
    })

    it('should call Redirect with correct props', () => {
        render(<CustomFields />)

        expect(mockedRoute.mock.calls[2]).toEqual([
            {
                exact: true,
                path: baseTicketPath + '/',
                children: expect.objectContaining({
                    type: Redirect,
                    props: expect.objectContaining({
                        to: `${baseTicketPath}/active`,
                    }),
                }),
            },
            {},
        ])
    })

    const defaults = {
        exact: true,
        role: ADMIN_ROLE,
        basePath: baseTicketPath,
        pageSection: PageSection.TicketFields,
    }

    it.each([
        [
            {
                ...defaults,
                callOrder: 0,
                routeCallOrder: 0,
                path: '/add',
                component: AddCustomField,
            },
        ],
        [
            {
                ...defaults,
                callOrder: 0,
                routeCallOrder: 0,
                path: '/add',
                component: AddCustomField,
                basePath: baseCustomerPath,
                pageSection: PageSection.CustomerFields,
            },
        ],
        [
            {
                ...defaults,
                callOrder: 1,
                routeCallOrder: 1,
                path: '/:id/edit',
                component: EditCustomField,
            },
        ],
        [
            {
                ...defaults,
                callOrder: 1,
                routeCallOrder: 1,
                path: '/:id/edit',
                component: EditCustomField,
                basePath: baseCustomerPath,
                pageSection: PageSection.CustomerFields,
            },
        ],
        [
            {
                ...defaults,
                callOrder: 2,
                routeCallOrder: 3,
                path: '/:activeTab',
                component: CustomFieldsComponent,
            },
        ],
        [
            {
                ...defaults,
                callOrder: 2,
                routeCallOrder: 3,
                basePath: baseCustomerPath,
                path: '/:activeTab',
                component: CustomFieldsComponent,
                pageSection: PageSection.CustomerFields,
            },
        ],
    ])(
        'should call renderer and Route with correct props',
        ({
            callOrder,
            routeCallOrder,
            exact,
            basePath,
            path,
            component,
            role,
            pageSection,
        }) => {
            mockedUseRouteMatch.mockReturnValue({
                path: basePath,
            } as ReturnType<typeof useRouteMatch>)

            render(<CustomFields />)

            expect(mockedRenderer.mock.calls[callOrder]).toEqual([
                component,
                role,
                pageSection,
            ])
            expect(mockedRoute.mock.calls[routeCallOrder]).toEqual([
                {
                    path: basePath + path,
                    exact,
                    render: ComponentToRender,
                },
                {},
            ])
        }
    )
})
