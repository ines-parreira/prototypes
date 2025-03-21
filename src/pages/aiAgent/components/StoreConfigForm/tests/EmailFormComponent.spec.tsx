import React from 'react'

import { QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, screen } from '@testing-library/react'
import { fromJS, Map } from 'immutable'
import { useFlags } from 'launchdarkly-react-client-sdk'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { FeatureFlagKey } from 'config/featureFlags'
import { account } from 'fixtures/account'
import { billingState } from 'fixtures/billing'
import { chatIntegrationFixtures } from 'fixtures/chat'
import { integrationsState, shopifyIntegration } from 'fixtures/integrations'
import useAppSelector from 'hooks/useAppSelector'
import { RootState, StoreDispatch } from 'state/types'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { renderWithRouter } from 'utils/testing'

import { EmailFormComponent } from '../FormComponents/EmailFormComponent'

// Mock dependencies
jest.mock('launchdarkly-react-client-sdk')

jest.mock('hooks/useAppSelector', () => jest.fn())

type EmailItem = {
    id: number
    email: string
}

jest.mock(
    '../../EmailIntegrationListSelection/EmailIntegrationListSelection',
    () => ({
        EmailIntegrationListSelection: ({
            onSelectionChange,
            emailItems,
        }: {
            selectedIds: number[]
            onSelectionChange: (ids: number[]) => void
            emailItems: EmailItem[]
        }) => (
            <div>
                <p>Email List Selection Component</p>
                <ul>
                    {emailItems.map((item: EmailItem) => (
                        <li key={item.id} data-testid={`email-item-${item.id}`}>
                            {item.email}
                        </li>
                    ))}
                </ul>
                <button onClick={() => onSelectionChange([emailItems[0].id])}>
                    Select Email
                </button>
            </div>
        ),
    }),
)

const mockUseAppSelector = jest.mocked(useAppSelector)
const mockUseFlags = jest.mocked(useFlags)
const mockUpdateValue = jest.fn()

const mockStore = configureMockStore<RootState, StoreDispatch>([thunk])

const defaultState = {
    currentAccount: fromJS(account),
    billing: fromJS(billingState),
    integrations: (fromJS(integrationsState) as Map<any, any>).mergeDeep({
        integrations: [shopifyIntegration, ...chatIntegrationFixtures],
    }),
} as RootState

const defaultProps = {
    monitoredEmailIntegrations: null,
    updateValue: mockUpdateValue,
}

const renderWithProvider = (props: any = defaultProps) => {
    renderWithRouter(
        <QueryClientProvider client={mockQueryClient()}>
            <Provider store={mockStore(defaultState)}>
                <EmailFormComponent {...props} />
            </Provider>
        </QueryClientProvider>,
    )
}
describe('EmailFormComponent', () => {
    const mockEmailIntegrations = [
        { id: 1, meta: { address: 'email1@example.com' } },
        { id: 2, meta: { address: 'email2@example.com' } },
    ]

    beforeEach(() => {
        mockUseAppSelector.mockReturnValue(mockEmailIntegrations)
        mockUseFlags.mockReturnValue({
            AiAgentChat: false,
        })
        mockUpdateValue.mockClear()
    })

    it('renders the form with default email list and shows required label', () => {
        renderWithProvider({ ...defaultProps, isRequired: true })
        screen.debug(document.body, Infinity)
        expect(
            screen.getByText(
                /AI Agent responds to tickets sent to the following email addresses/,
            ),
        ).toBeInTheDocument()
        expect(screen.getByText('email1@example.com')).toBeInTheDocument()
        expect(screen.getByText('email2@example.com')).toBeInTheDocument()
        expect(
            screen.getByText('One or more addresses required.'),
        ).toBeInTheDocument()
    })

    it('displays correct footer message when email is selected', () => {
        const props = {
            ...defaultProps,
            monitoredEmailIntegrations: [
                { id: 1, email: 'email1@example.com' },
            ],
        }

        renderWithProvider(props)

        expect(
            screen.getByText(
                'Select one or more email addresses for AI Agent to use. It will also reply to contact forms linked to these email addresses.',
            ),
        ).toBeInTheDocument()
    })

    it('calls updateValue when an email integration is selected', () => {
        renderWithProvider()

        fireEvent.click(screen.getByText('Select Email'))

        expect(mockUpdateValue).toHaveBeenCalledWith(
            'monitoredEmailIntegrations',
            [{ id: 1, email: 'email1@example.com' }],
        )
    })

    it('hides the required label if AiAgentChat feature flag is enabled', () => {
        mockUseFlags.mockReturnValue({
            [FeatureFlagKey.AiAgentChat]: true,
        })

        renderWithProvider()

        expect(
            screen.getByText(
                /AI Agent responds to tickets sent to the following email addresses/,
            ),
        ).toBeInTheDocument()
        expect(
            screen.queryByText('At least one email is required.'),
        ).not.toBeInTheDocument()
    })

    it('shows an error message when no email is selected and AiAgentChat is disabled and value is required', () => {
        mockUseFlags.mockReturnValue({
            [FeatureFlagKey.AiAgentChat]: false,
        })

        renderWithProvider({ ...defaultProps, isRequired: true })

        expect(
            screen.getByText('One or more addresses required.'),
        ).toBeInTheDocument()
        expect(
            screen.getByText(
                /AI Agent responds to tickets sent to the following email addresses/,
            ),
        ).toBeInTheDocument()
    })
})
