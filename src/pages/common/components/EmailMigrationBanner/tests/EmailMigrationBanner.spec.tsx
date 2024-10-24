import {cleanup, screen} from '@testing-library/react'
import React from 'react'
import {Provider} from 'react-redux'
import * as ReactRouterDom from 'react-router-dom'

import * as useAppSelector from 'hooks/useAppSelector'
import {EmailMigrationStatus} from 'models/integration/types'
import {mockStore, renderWithRouter} from 'utils/testing'

import EmailMigrationBanner from '../EmailMigrationBanner'
import * as helpers from '../helpers'
import * as migrationBannerHook from '../hooks/useMigrationBannerStatus'

const appSelectorSpy = jest.spyOn(useAppSelector, 'default')
const computeBannerSpy = jest.spyOn(
    helpers,
    'computeEmailMigrationStatusBanner'
)
const useLocationSpy = jest.spyOn(ReactRouterDom, 'useLocation')

const mockFetchMigrationStatus = jest.fn()
jest.spyOn(migrationBannerHook, 'default').mockImplementation(
    () => mockFetchMigrationStatus
)

describe('EmailMigrationBanner', () => {
    const renderComponent = () =>
        renderWithRouter(
            <Provider store={mockStore({} as any)}>
                <EmailMigrationBanner />
            </Provider>
        )
    afterEach(cleanup)

    it('should call fetchMigrationStatus on mount', () => {
        useLocationSpy.mockReturnValue({pathname: '/app'} as any)
        appSelectorSpy.mockReturnValue({})
        renderComponent()
        expect(mockFetchMigrationStatus).toHaveBeenCalled()
    })

    it('should display banner when bannerSettings is defined and path is NOT Migration Page', () => {
        useLocationSpy.mockReturnValue({pathname: '/app'} as any)
        appSelectorSpy.mockReturnValue({})
        computeBannerSpy.mockReturnValue({message: 'Banner visible'})
        renderComponent()
        expect(screen.getByText('Banner visible')).toBeVisible()
    })

    it('should hide banner when bannerSettings is NOT defined and path is NOT Migration Page', () => {
        useLocationSpy.mockReturnValue({pathname: '/app'} as any)
        appSelectorSpy.mockReturnValue(null)
        computeBannerSpy.mockReturnValue({message: 'Banner visible'})
        renderComponent()
        expect(screen.queryByText('Banner visible')).toBeNull()
    })

    it('should hide banner when bannerSettings is defined and path is Migration Page', () => {
        useLocationSpy.mockReturnValue({
            pathname: `/app/settings/channels/email/migration`,
        } as any)
        appSelectorSpy.mockReturnValue({})
        computeBannerSpy.mockReturnValue({message: 'Banner visible'})
        renderComponent()
        expect(screen.getByText('Banner visible')).toBeVisible()
    })

    it('should hide banner when bannerSettings is defined and path is NOT Migration Page and status of the migration is Completed', () => {
        useLocationSpy.mockReturnValue({
            pathname: `/app/settings/channels/email/migration`,
        } as any)
        appSelectorSpy.mockReturnValue({
            status: EmailMigrationStatus.Completed,
        })
        computeBannerSpy.mockReturnValue({message: 'Banner visible'})
        renderComponent()
        expect(screen.queryByText('Banner visible')).toBeNull()
    })
})
