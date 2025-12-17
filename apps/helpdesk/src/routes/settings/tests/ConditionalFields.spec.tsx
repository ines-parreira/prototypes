import { assumeMock } from '@repo/testing'
import { render } from '@testing-library/react'
import { Route, useRouteMatch } from 'react-router-dom'

import { PageSection } from 'config/pages'
import { ADMIN_ROLE } from 'config/user'
import ConditionalField from 'pages/settings/conditionalFields/ConditionalField'
import ConditionalFieldsComponent from 'pages/settings/conditionalFields/ConditionalFields'
import { CUSTOM_FIELD_CONDITIONS_ROUTE } from 'routes/constants'

import { ConditionalFields } from '../ConditionalFields'
import { renderAppSettings } from '../helpers/settingsRenderer'

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    Route: jest.fn(() => <div>route</div>),
    Switch: jest.fn(({ children }) => <div>{children}</div>),
    useRouteMatch: jest.fn(),
}))
jest.mock('pages/common/components/NoMatch', () => () => <div>404</div>)
jest.mock('@repo/feature-flags', () => ({
    ...jest.requireActual('@repo/feature-flags'),
    useFlag: jest.fn(),
}))
const ComponentToRender = () => <div>OK</div>
jest.mock('../helpers/settingsRenderer', () => ({
    renderAppSettings: jest.fn(() => ComponentToRender),
}))

const mockedRoute = Route as jest.Mock
const mockedRenderAppSettings = assumeMock(renderAppSettings)
const mockedUseRouteMatch = assumeMock(useRouteMatch)

describe('ConditionalFields', () => {
    beforeEach(() => {
        mockedUseRouteMatch.mockReturnValue({
            path: CUSTOM_FIELD_CONDITIONS_ROUTE,
        } as ReturnType<typeof useRouteMatch>)
    })

    it.each([
        [
            {
                callOrder: 0,
                path: CUSTOM_FIELD_CONDITIONS_ROUTE + '/:id',
                component: ConditionalField,
            },
        ],
        [
            {
                callOrder: 1,
                path: CUSTOM_FIELD_CONDITIONS_ROUTE + '/',
                component: ConditionalFieldsComponent,
            },
        ],
    ])(
        'should call renderer and Route with correct props',
        ({ callOrder, path, component }) => {
            render(<ConditionalFields />)

            expect(mockedRenderAppSettings.mock.calls[callOrder]).toEqual([
                component,
                {
                    roleParams: [ADMIN_ROLE, PageSection.ConditionalFields],
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
