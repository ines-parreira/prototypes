import {cleanup, fireEvent, screen, waitFor} from '@testing-library/react'
import {fromJS} from 'immutable'
import {Moment} from 'moment'
import React from 'react'
import {Provider} from 'react-redux'
import * as ReactRouterDom from 'react-router-dom'

import {IntegrationType} from 'models/integration/constants'
import * as resources from 'models/integration/resources/email'
import * as migrationBannerHook from 'pages/common/components/EmailMigrationBanner/hooks/useMigrationBannerStatus'
import * as dateUtils from 'utils/date'
import {mockStore, renderWithRouter} from 'utils/testing'

import StartMigration from '../EmailMigration/StartMigration'

jest.mock(
    'models/integration/resources/email',
    () =>
        ({
            ...jest.requireActual('models/integration/resources/email'),
            startEmailMigration: jest.fn(() => ({
                forwarding_email_address: 'test@gorgias.com',
            })),
        }) as Record<string, any>
)
const getMomentSpy = jest.spyOn(dateUtils, 'getMoment')

const mockFetchMigrationStatus = jest.fn()
jest.spyOn(migrationBannerHook, 'default').mockImplementation(
    () => mockFetchMigrationStatus
)

const mockHistoryPush = jest.fn()
const mockHistoryGoBack = jest.fn()

jest.mock(
    'react-router',
    () =>
        ({
            ...jest.requireActual('react-router'),
            useLocation: jest.fn(),
            useHistory: () => ({
                block: jest.fn(),
                push: mockHistoryPush,
                goBack: mockHistoryGoBack,
            }),
        }) as Record<string, any>
)
const useLocationSpy = jest.spyOn(ReactRouterDom, 'useLocation')

jest.mock('../EmailMigration/StartMigrationIntegrationsTable', () => () => (
    <div data-testid="integrations-table" />
))

const mockIntegrations = [
    {
        id: 1,
        type: IntegrationType.Email,
        meta: {
            address: 'test1@gorgias.com',
        },
    },
    {
        id: 2,
        type: IntegrationType.Email,
        meta: {
            address: 'test2@emails.gorgias.com',
        },
    },
]

describe('StartMigration', () => {
    const renderComponent = (integrations: any = mockIntegrations) =>
        renderWithRouter(
            <Provider
                store={mockStore({
                    integrations: fromJS({
                        integrations,
                        emailMigrationBannerStatus: {
                            due_at: '2023-01-31T00:00',
                        },
                    }),
                } as any)}
            >
                <StartMigration />
            </Provider>
        )

    afterEach(cleanup)

    it('should call Start Migration endpoint and refresh banner when clicking start', async () => {
        renderComponent()
        fireEvent.click(screen.getByText('Start migration'))
        await waitFor(() => {
            expect(resources.startEmailMigration).toHaveBeenCalled()
            expect(mockFetchMigrationStatus).toHaveBeenCalled()
        })
    })

    it('should navigate back when clicking "Migrate later" if page is not entry point', () => {
        useLocationSpy.mockReturnValue({key: 'abc'} as any)
        renderComponent()
        fireEvent.click(screen.getByText('Migrate later'))
        expect(mockHistoryGoBack).toHaveBeenCalled()
    })

    it('should navigate to email settings when clicking "Migrate later" if page is entry point', () => {
        useLocationSpy.mockReturnValue({
            key: undefined,
        } as any)
        renderComponent()
        fireEvent.click(screen.getByText('Migrate later'))
        expect(mockHistoryPush).toHaveBeenCalledWith(
            '/app/settings/channels/email'
        )
    })

    it('should display integrations table', () => {
        renderComponent()
        expect(screen.getByTestId('integrations-table')).toBeVisible()
    })

    it('empty state - when there are no other integrations to migrate', () => {
        renderComponent([])
        expect(screen.getByText('Complete migration')).toBeVisible()
        // Migrate later button should not be visible
        expect(screen.queryByText('Migrate later')).toBeNull()
    })

    it('should display due date when it is not past deadline', () => {
        getMomentSpy.mockImplementation(
            () => dateUtils.stringToDatetime('2023-01-10T00:00') as Moment
        )
        renderComponent()
        expect(
            screen.getByText('Migrate your emails by', {exact: false})
        ).toBeVisible()
    })

    it('should display "migrate your emails or risk deactivation" when it is past deadline', () => {
        getMomentSpy.mockImplementation(
            () => dateUtils.stringToDatetime('2023-02-10T00:00') as Moment
        )
        renderComponent()
        expect(
            screen.getByText('Migrate your emails or risk deactivation')
        ).toBeVisible()
    })
})
