import React from 'react'

import { assumeMock } from '@repo/testing'
import { render } from '@testing-library/react'
import { Route, useLocation, useRouteMatch } from 'react-router-dom'

import { ImportEmailsRoute } from '../ImportEmailsRoute'
import { ImportZendeskRoute } from '../ImportZendeskRoute'

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    Route: jest.fn(() => <div>route</div>),
    Switch: jest.fn(({ children }) => <div>{children}</div>),
    useLocation: jest.fn(),
    useRouteMatch: jest.fn(),
}))

const mockedRoute = Route as jest.Mock
const mockedUseLocation = assumeMock(useLocation)
const mockedUseRouteMatch = assumeMock(useRouteMatch)

describe('ImportEmailsRoute', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('redirects the legacy import-email route to historical-imports while preserving search params', () => {
        mockedUseRouteMatch.mockReturnValue({
            path: 'import-email',
        } as ReturnType<typeof useRouteMatch>)
        mockedUseLocation.mockReturnValue({
            search: '?selectedEmail=test@example.com',
        } as ReturnType<typeof useLocation>)

        render(<ImportEmailsRoute />)

        expect(mockedRoute.mock.calls[0]).toEqual([
            {
                path: 'import-email/',
                exact: true,
                children: expect.objectContaining({
                    props: {
                        to: {
                            pathname: '/app/settings/historical-imports',
                            search: '?selectedEmail=test@example.com',
                        },
                    },
                }),
            },
            {},
        ])
    })
})

describe('ImportZendeskRoute', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('redirects the legacy import-zendesk route to historical-imports with the Zendesk tab selected', () => {
        mockedUseRouteMatch.mockReturnValue({
            path: 'import-zendesk',
        } as ReturnType<typeof useRouteMatch>)
        mockedUseLocation.mockReturnValue({
            search: '',
        } as ReturnType<typeof useLocation>)

        render(<ImportZendeskRoute />)

        expect(mockedRoute.mock.calls[0]).toEqual([
            {
                path: 'import-zendesk/',
                exact: true,
                children: expect.objectContaining({
                    props: {
                        to: {
                            pathname: '/app/settings/historical-imports',
                            search: '?activeTab=import-zendesk',
                        },
                    },
                }),
            },
            {},
        ])
    })
})
