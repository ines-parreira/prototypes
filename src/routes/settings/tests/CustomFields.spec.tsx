import {render, screen} from '@testing-library/react'
import React from 'react'
import {Redirect, Route, useRouteMatch} from 'react-router-dom'

import {useFlag} from 'common/flags'
import {PageSection} from 'config/pages'
import {ADMIN_ROLE} from 'config/user'
import {CustomFieldObjectTypes} from 'custom-fields/types'
import AddCustomField from 'pages/settings/customFields/AddCustomField'
import CustomFieldsComponent from 'pages/settings/customFields/CustomFields'
import EditCustomField from 'pages/settings/customFields/EditCustomField'
import {CUSTOM_FIELD_ROUTES} from 'routes/constants'
import {assumeMock} from 'utils/testing'

import {CustomFields} from '../CustomFields'
import {renderAppSettings} from '../helpers/settingsRenderer'

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
    renderAppSettings: jest.fn(() => ComponentToRender),
}))

const mockedUseRouteMatch = assumeMock(useRouteMatch)
const mockedRoute = Route as jest.Mock
const mockedUseFlag = assumeMock(useFlag)
const mockedRenderAppSettings = assumeMock(renderAppSettings)

describe('CustomFields', () => {
    beforeEach(() => {
        mockedUseFlag.mockReturnValue(true)
        mockedUseRouteMatch.mockReturnValue({
            path: CUSTOM_FIELD_ROUTES['Ticket'],
        } as ReturnType<typeof useRouteMatch>)
    })

    it("should render the NoMatch component if the feature flag isn't enabled and objectType prop is customer-fields", () => {
        mockedUseFlag.mockReturnValue(false)

        render(<CustomFields objectType="Customer" />)

        expect(screen.getByText('404')).toBeInTheDocument()
    })

    it('should call Redirect with correct props', () => {
        render(<CustomFields objectType="Ticket" />)

        expect(mockedRoute.mock.calls[2]).toEqual([
            {
                exact: true,
                path: CUSTOM_FIELD_ROUTES['Ticket'] + '/',
                children: expect.objectContaining({
                    type: Redirect,
                    props: expect.objectContaining({
                        to: `${CUSTOM_FIELD_ROUTES['Ticket']}/active`,
                    }),
                }),
            },
            {},
        ])
    })

    const defaults = {
        exact: true,
        role: ADMIN_ROLE,
        basePath: CUSTOM_FIELD_ROUTES['Ticket'],
        pageSection: PageSection.TicketFields,
        objectType: 'Ticket',
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
                basePath: CUSTOM_FIELD_ROUTES['Customer'],
                objectType: 'Customer',
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
                basePath: CUSTOM_FIELD_ROUTES['Customer'],
                objectType: 'Customer',
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
                basePath: CUSTOM_FIELD_ROUTES['Customer'],
                path: '/:activeTab',
                component: CustomFieldsComponent,
                objectType: 'Customer',
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
            objectType,
        }) => {
            mockedUseRouteMatch.mockReturnValue({
                path: basePath,
            } as ReturnType<typeof useRouteMatch>)

            render(
                <CustomFields
                    objectType={objectType as CustomFieldObjectTypes}
                />
            )

            expect(mockedRenderAppSettings.mock.calls[callOrder]).toEqual([
                component,
                {
                    roleParams: [role, pageSection],
                    componentProps: {
                        objectType,
                    },
                },
            ])
            expect(mockedRoute.mock.calls[routeCallOrder]).toEqual([
                {
                    path: basePath + path,
                    exact,
                    children: ComponentToRender,
                },
                {},
            ])
        }
    )
})
