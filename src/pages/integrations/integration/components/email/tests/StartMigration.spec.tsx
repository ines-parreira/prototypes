import {
    cleanup,
    fireEvent,
    render,
    screen,
    waitFor,
} from '@testing-library/react'
import React from 'react'
import {Provider} from 'react-redux'
import {mockStore} from 'utils/testing'
import * as resources from 'models/integration/resources/email'
import * as migrationBannerHook from 'pages/common/components/EmailMigrationBanner/hooks/useMigrationBannerStatus'
import StartMigration from '../EmailMigration/StartMigration'

jest.mock('models/integration/resources/email')
jest.mock('hooks/useAppSelector')

const mockFetchMigrationStatus = jest.fn()
jest.spyOn(migrationBannerHook, 'default').mockImplementation(
    () => mockFetchMigrationStatus
)

describe('StartMigration', () => {
    const renderComponent = () =>
        render(
            <Provider store={mockStore({} as any)}>
                <StartMigration />
            </Provider>
        )

    afterEach(cleanup)

    it('should call Start Migration endpoint when clicking start and refresh banner', async () => {
        renderComponent()
        fireEvent.click(screen.getByText('Start migration'))
        await waitFor(() => {
            expect(resources.startEmailMigration).toHaveBeenCalled()
            expect(mockFetchMigrationStatus).toHaveBeenCalled()
        })
    })
})
