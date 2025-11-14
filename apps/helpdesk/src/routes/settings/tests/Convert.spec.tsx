import React from 'react'

import { assumeMock } from '@repo/testing'
import { render } from '@testing-library/react'
import { Redirect, Route, useRouteMatch } from 'react-router-dom'

import { RevenueAddonApiClientProvider } from 'pages/convert/common/hooks/useConvertApi'

import { Convert } from '../Convert'

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    Redirect: jest.fn(() => <div>Redirect</div>),
    Route: jest.fn(() => <div>route</div>),
    Switch: jest.fn(({ children }) => <div>{children}</div>),
    useRouteMatch: jest.fn(),
}))
jest.mock('pages/convert/common/hooks/useConvertApi', () => ({
    RevenueAddonApiClientProvider: jest.fn(({ children }) => (
        <div>{children}</div>
    )),
}))

const mockedUseRouteMatch = assumeMock(useRouteMatch)
const mockedRoute = Route as jest.Mock

const basePath = 'convert'

describe('Convert', () => {
    beforeEach(() => {
        mockedUseRouteMatch.mockReturnValue({
            path: basePath,
        } as ReturnType<typeof useRouteMatch>)
    })

    it('should call RevenueAddonApiClientProvider', () => {
        render(<Convert />)

        expect(RevenueAddonApiClientProvider).toHaveBeenCalled()
    })

    it.each([
        [{ callOrder: 0, path: '/click-tracking' }],
        [{ callOrder: 1, path: '/click-tracking/subscribe' }],
        [{ callOrder: 2, path: '/installations' }],
        [{ callOrder: 3, path: '/installations/new' }],
        [{ callOrder: 4, path: '/installations/:bundleId' }],
    ])(
        'should call Router/Redirect with correct props',
        ({ callOrder, path }) => {
            render(<Convert />)

            expect(mockedRoute.mock.calls[callOrder]).toEqual([
                {
                    exact: true,
                    path: basePath + path,
                    children: expect.objectContaining({
                        type: Redirect,
                        props: expect.objectContaining({
                            to: '/app/convert',
                        }),
                    }),
                },
                {},
            ])
        },
    )
})
