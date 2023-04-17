import {
    cleanup,
    fireEvent,
    render,
    screen,
    waitFor,
} from '@testing-library/react'
import {Provider} from 'react-redux'
import React from 'react'
import {act} from 'react-dom/test-utils'
import {mockStore} from 'utils/testing'
import * as dateUtils from 'utils/date'
import * as migrationBannerHook from 'pages/common/components/EmailMigrationBanner/hooks/useMigrationBannerStatus'
import MigrationOutboundVerification from '../EmailMigration/MigrationOutboundVerification'

jest.useFakeTimers()

jest.mock('models/integration/resources/email', () => ({
    fetchMigrationDomains: jest.fn(() => ({data: []})),
}))

const getMomentSpy = jest.spyOn(dateUtils, 'getMoment') as jest.Mock

const mockFetchMigrationStatus = jest.fn()
jest.spyOn(migrationBannerHook, 'default').mockImplementation(
    () => mockFetchMigrationStatus
)

describe('MigrationOutboundVerification', () => {
    const onBackClick = jest.fn()

    const renderComponent = () =>
        render(
            <Provider store={mockStore({} as any)}>
                <MigrationOutboundVerification onBackClick={onBackClick} />
            </Provider>
        )

    afterEach(cleanup)

    it('should call onBackClick when clicking Back button', () => {
        renderComponent()

        fireEvent.click(
            screen.getByRole('button', {
                name: /back/i,
            })
        )
        expect(onBackClick).toHaveBeenCalled()
    })

    it('should display and refresh last checked time after timeout', async () => {
        getMomentSpy.mockReturnValue({calendar: () => 'Today at 00:00'})
        renderComponent()
        await screen.findByText('Last checked: Today at 00:00')
        const getMomentCalls = getMomentSpy.mock.calls.length
        const fetchMigrationStatusCalls =
            mockFetchMigrationStatus.mock.calls.length

        act(() => {
            jest.advanceTimersByTime(2 * 60 * 1000)
        })

        await waitFor(() => {
            expect(mockFetchMigrationStatus).toHaveBeenCalledTimes(
                fetchMigrationStatusCalls + 1
            )
            expect(getMomentSpy).toHaveBeenCalledTimes(getMomentCalls + 1)
        })
    })

    it('should refresh last checked time when clicking Refresh button', async () => {
        getMomentSpy
            .mockReturnValueOnce({calendar: () => 'Today at 00:00'})
            .mockReturnValue({calendar: () => 'Today at 00:01'})
        renderComponent()

        const refreshButton = screen.getByRole('button', {
            name: /refresh/i,
        })
        await waitFor(() => expect(refreshButton).not.toBeDisabled())

        act(() => {
            fireEvent.click(refreshButton)
        })

        await waitFor(() => expect(refreshButton).not.toBeDisabled())
        expect(screen.getByText('Last checked: Today at 00:01')).toBeVisible()
    })
})
