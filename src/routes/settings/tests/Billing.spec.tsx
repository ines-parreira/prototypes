import React from 'react'

import { render } from '@testing-library/react'
import { Route, useRouteMatch } from 'react-router-dom'

import { PageSection } from 'config/pages'
import { ADMIN_ROLE } from 'config/user'
import { RevenueAddonApiClientProvider } from 'pages/convert/common/hooks/useConvertApi'
import NewBilling from 'pages/settings/new_billing/views/BillingStartView'
import { assumeMock } from 'utils/testing'

import { Billing } from '../Billing'
import { renderAppSettings } from '../helpers/settingsRenderer'

jest.mock('react-router-dom', () => ({
    Route: jest.fn(() => <div>route</div>),
    Switch: jest.fn(({ children }) => <div>{children}</div>),
    useRouteMatch: jest.fn(),
}))
jest.mock('pages/convert/common/hooks/useConvertApi', () => ({
    RevenueAddonApiClientProvider: jest.fn(({ children }) => (
        <div>{children}</div>
    )),
}))
const ComponentToRender = () => <div>OK</div>
jest.mock('../helpers/settingsRenderer', () => ({
    renderAppSettings: jest.fn(() => ComponentToRender),
}))

const mockedUseRouteMatch = assumeMock(useRouteMatch)
const mockedRoute = Route as jest.Mock
const mockedRenderAppSettings = assumeMock(renderAppSettings)

const basePath = 'billing'

describe('Billing', () => {
    beforeEach(() => {
        mockedUseRouteMatch.mockReturnValue({
            path: basePath,
        } as ReturnType<typeof useRouteMatch>)
    })

    it('should call RevenueAddonApiClientProvider', () => {
        render(<Billing />)

        expect(RevenueAddonApiClientProvider).toHaveBeenCalled()
    })

    it('should call renderer and Route with correct props', () => {
        mockedUseRouteMatch.mockReturnValue({
            path: basePath,
        } as ReturnType<typeof useRouteMatch>)

        render(<Billing />)

        expect(mockedRenderAppSettings.mock.calls[0]).toEqual([
            NewBilling,
            {
                roleParams: [ADMIN_ROLE, PageSection.NewBilling],
            },
        ])
        expect(mockedRoute.mock.calls[0]).toEqual([
            {
                path: [
                    basePath + '/',
                    basePath + '/payment',
                    basePath + '/payment-history',
                ],
                children: ComponentToRender,
            },
            {},
        ])
    })
})
