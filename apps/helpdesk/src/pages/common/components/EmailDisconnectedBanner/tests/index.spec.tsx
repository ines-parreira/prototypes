import React from 'react'

import { userEvent } from '@repo/testing'
import { Location } from '@sentry/react/types/types'
import { cleanup, screen, waitFor } from '@testing-library/react'
import { fromJS, List } from 'immutable'
import { Provider } from 'react-redux'
import { MemoryRouter, Route } from 'react-router-dom'

import * as useAppSelector from 'hooks/useAppSelector'
import { mockStore, renderWithRouter } from 'utils/testing'

import EmailDisconnectedBanner from '..'

const appSelectorSpy = jest.spyOn(useAppSelector, 'default')

describe('EmailMigrationBanner', () => {
    let testLocation: Location
    const renderComponent = (route = '/app') =>
        renderWithRouter(
            <Provider store={mockStore({} as any)}>
                <MemoryRouter initialEntries={[route]}>
                    <EmailDisconnectedBanner />
                    <Route
                        path="*"
                        render={({ location }) => {
                            testLocation = location
                            return null
                        }}
                    />
                </MemoryRouter>
            </Provider>,
            { route },
        )
    afterEach(cleanup)

    it('should not be visible when no disconnected email', () => {
        appSelectorSpy.mockReturnValue(List())
        renderComponent()
    })

    it('should be visible when disconnected email', () => {
        appSelectorSpy.mockReturnValue(
            fromJS([
                {
                    id: 9,
                    type: 'email',
                    name: 'Test',
                    address: 'test@gorgias.com',
                    preferred: false,
                    verified: true,
                    isDeactivated: true,
                },
            ]),
        )
        renderComponent()
        expect(screen.getByText('test@gorgias.com')).toBeVisible()
    })

    it('should hide banner when bannerSettings is NOT defined and path is NOT Migration Page', () => {
        appSelectorSpy.mockReturnValue(
            fromJS([
                {
                    id: 9,
                    type: 'email',
                    name: 'Test',
                    address: 'test@gorgias.com',
                    preferred: false,
                    verified: true,
                    isDeactivated: true,
                },
            ]),
        )
        renderComponent('/app/settings/channels/email')
        expect(screen.queryByText('test@gorgias.com')).toBeNull()
    })

    it('should be redirect on `/app/settings/channels/email` when clicked', async () => {
        appSelectorSpy.mockReturnValue(
            fromJS([
                {
                    id: 9,
                    type: 'email',
                    name: 'Test',
                    address: 'test@gorgias.com',
                    preferred: false,
                    verified: true,
                    isDeactivated: true,
                },
            ]),
        )

        renderComponent()
        expect(screen.getByText('test@gorgias.com')).toBeVisible()
        userEvent.click(screen.getByText('Reconnect'))
        await waitFor(() => {
            expect(testLocation.pathname).toBe('/app/settings/channels/email')
        })
        expect(screen.queryByText('test@gorgias.com')).toBeNull()
    })
})
