import {render} from '@testing-library/react'
import React from 'react'
import {Route, useRouteMatch} from 'react-router-dom'

import {PageSection} from 'config/pages'
import {ADMIN_ROLE} from 'config/user'
import PhoneNumberCreateContainer from 'pages/phoneNumbers/PhoneNumberCreateContainer'
import PhoneNumberDetailContainer from 'pages/phoneNumbers/PhoneNumberDetailContainer'
import PhoneNumbersListContainer from 'pages/phoneNumbers/PhoneNumbersListContainer'
import {assumeMock} from 'utils/testing'

import {renderAppSettings} from '../helpers/settingsRenderer'
import {PhoneNumbers} from '../PhoneNumbers'

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

const basePath = 'phone-numbers'

describe('PhoneNumbers', () => {
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
                component: PhoneNumbersListContainer,
            },
        ],
        [
            {
                callOrder: 1,
                path: basePath + '/new',
                component: PhoneNumberCreateContainer,
            },
        ],
        [
            {
                callOrder: 2,
                path: basePath + '/:phoneNumberId',
                component: PhoneNumberDetailContainer,
            },
        ],
    ])(
        'should call renderer and Route with correct props',
        ({callOrder, path, component}) => {
            render(<PhoneNumbers />)

            expect(mockedRenderAppSettings.mock.calls[callOrder]).toEqual([
                component,
                {
                    roleParams: [ADMIN_ROLE, PageSection.PhoneNumbers],
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
