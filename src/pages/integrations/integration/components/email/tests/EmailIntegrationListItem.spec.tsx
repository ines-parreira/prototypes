import React from 'react'

import { render, screen } from '@testing-library/react'
import { fromJS } from 'immutable'
import { useFlags } from 'launchdarkly-react-client-sdk'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'

import {
    EmailIntegration,
    EmailProvider,
    GmailIntegration,
} from '@gorgias/helpdesk-queries'

import { FeatureFlagKey } from 'config/featureFlags'
import { IntegrationType, OutlookIntegration } from 'models/integration/types'
import { AccountSettingType } from 'state/currentAccount/types'
import { RootState, StoreDispatch } from 'state/types'

import EmailIntegrationListItem from '../EmailIntegrationListItem'
import { canIntegrationDomainBeVerified } from '../helpers'
import { useEmailOnboardingCompleteCheck } from '../hooks/useEmailOnboarding'

jest.mock('launchdarkly-react-client-sdk')
jest.mock('../hooks/useEmailOnboarding')
jest.mock('../helpers')

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>()
const store = mockStore({
    currentAccount: fromJS({
        settings: [
            {
                id: 1,
                type: AccountSettingType.DefaultIntegration,
                data: {
                    email: 1,
                },
            },
        ],
    }),
})

const useFlagsMock = useFlags as jest.MockedFunction<typeof useFlags>
const useEmailOnboardingCompleteCheckMock =
    useEmailOnboardingCompleteCheck as jest.MockedFunction<
        typeof useEmailOnboardingCompleteCheck
    >
const canIntegrationDomainBeVerifiedMock =
    canIntegrationDomainBeVerified as jest.MockedFunction<
        typeof canIntegrationDomainBeVerified
    >

describe('<EmailIntegrationListItem/>', () => {
    beforeEach(() => {
        useFlagsMock.mockReturnValue({
            [FeatureFlagKey.DefaultEmailAddress]: true,
            [FeatureFlagKey.NewDomainVerification]: true,
        })
        useEmailOnboardingCompleteCheckMock.mockReturnValue({
            isOnboardingComplete: true,
            completeOnboarding: jest.fn(),
        })
        canIntegrationDomainBeVerifiedMock.mockReturnValue(true)
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    const defaultProps = {
        integration: {
            id: 1,
            name: 'Test Email',
            type: IntegrationType.Email,
            meta: {
                address: 'test@example.com',
                provider: EmailProvider.Mailgun,
            },
            deactivated_datetime: null,
        } as EmailIntegration,
        isRowSubmitting: false,
        verifiedDomains: ['example.com'],
        integrations: [],
    }

    describe('render()', () => {
        it('should render the email integration list item with correct structure', () => {
            render(
                <Provider store={store}>
                    <EmailIntegrationListItem {...defaultProps} />
                </Provider>,
            )

            expect(screen.getByText('Test Email')).toBeInTheDocument()
            expect(screen.getByText('test@example.com')).toBeInTheDocument()
            expect(screen.getByText('DEFAULT')).toBeInTheDocument()
            expect(screen.getByText('No store connected')).toBeInTheDocument()

            const iconElement = document.querySelector(
                '.material-icons.icon-go-forward',
            )
            expect(iconElement).toBeInTheDocument()
            expect(iconElement?.textContent).toBe('keyboard_arrow_right')
        })

        it('should display the email address', () => {
            render(
                <Provider store={store}>
                    <EmailIntegrationListItem {...defaultProps} />
                </Provider>,
            )
            expect(screen.getByText('test@example.com')).toBeInTheDocument()
        })

        it('should show default integration badge when integration is default', () => {
            render(
                <Provider store={store}>
                    <EmailIntegrationListItem {...defaultProps} />
                </Provider>,
            )
            expect(screen.getByText('DEFAULT')).toBeInTheDocument()
        })

        it('should not show default badge when feature flag is disabled', () => {
            useFlagsMock.mockReturnValue({
                [FeatureFlagKey.DefaultEmailAddress]: false,
                [FeatureFlagKey.NewDomainVerification]: true,
            })

            render(
                <Provider store={store}>
                    <EmailIntegrationListItem {...defaultProps} />
                </Provider>,
            )
            expect(screen.queryByText('DEFAULT')).not.toBeInTheDocument()
        })

        it('should show appropriate status for deactivated integration', () => {
            const inactiveProps = {
                ...defaultProps,
                integration: {
                    ...defaultProps.integration,
                    deactivated_datetime: '2023-01-01T00:00:00Z',
                },
            }

            render(
                <Provider store={store}>
                    <EmailIntegrationListItem {...inactiveProps} />
                </Provider>,
            )

            expect(screen.getByText('Test Email')).toBeInTheDocument()
            expect(screen.getByText('test@example.com')).toBeInTheDocument()
        })

        it('should display connected store information when a store is connected', () => {
            const mockFind = jest.fn().mockImplementation(() => ({
                id: 2,
                name: 'Connected Store',
                type: IntegrationType.Email,
            }))

            const propsWithStore = {
                ...defaultProps,
                integrations: {
                    find: mockFind,
                } as unknown as (
                    | EmailIntegration
                    | GmailIntegration
                    | OutlookIntegration
                )[],
                storeMappings: {
                    '1': 2,
                },
            }

            render(
                <Provider store={store}>
                    <EmailIntegrationListItem {...propsWithStore} />
                </Provider>,
            )

            expect(screen.getByText('Connected Store')).toBeInTheDocument()
        })
    })
})
