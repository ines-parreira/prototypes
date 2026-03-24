import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, screen } from '@testing-library/react'
import type { Map } from 'immutable'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { account } from 'fixtures/account'
import { billingState } from 'fixtures/billing'
import { chatIntegrationFixtures } from 'fixtures/chat'
import { integrationsState, shopifyIntegration } from 'fixtures/integrations'
import useAppSelector from 'hooks/useAppSelector'
import type { RootState, StoreDispatch } from 'state/types'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { renderWithRouter } from 'utils/testing'

import {
    EmailFormComponent,
    emailSortingCallback,
} from '../FormComponents/EmailFormComponent'

// Mock dependencies

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

jest.mock('@repo/feature-flags', () => ({
    ...jest.requireActual('@repo/feature-flags'),
    useFlag: jest.fn(),
}))
const mockUseFlag = jest.mocked(useFlag)

const mockUseAppSelector = jest.mocked(useAppSelector)
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
        mockUseFlag.mockReturnValue(false)
        mockUpdateValue.mockClear()
    })

    it('renders the form with default email list and shows required label', () => {
        renderWithProvider({ ...defaultProps, isRequired: true })

        screen.getByText(/Select one or more emails/i)
        screen.getByText('email1@example.com')
        screen.getByText('email2@example.com')
        screen.getByText('One or more addresses required.')
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
                'AI Agent will also respond to any contact forms linked to these email addresses.',
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
        mockUseFlag.mockImplementation(
            (key) => key === FeatureFlagKey.AiAgentChat || false,
        )

        renderWithProvider()

        screen.getByText(/Select one or more emails/i)

        screen.queryByText('At least one email is required.')
    })

    it('shows an error message when no email is selected and AiAgentChat is disabled and value is required', () => {
        renderWithProvider({ ...defaultProps, isRequired: true })

        screen.getByText('One or more addresses required.')
        screen.getByText(/Select one or more emails/i)
    })
})

describe('emailSortingCallback', () => {
    const makeEmail = (
        email: string,
        { isDisabled = false, isDefault = false } = {},
    ) => ({ email, id: 0, isDisabled, isDefault })

    it('should sort disabled emails after enabled ones', () => {
        const a = makeEmail('a@test.com', { isDisabled: true })
        const b = makeEmail('b@test.com')

        expect(emailSortingCallback(a, b)).toBe(1)
        expect(emailSortingCallback(b, a)).toBe(-1)
    })

    it('should sort default email before non-default', () => {
        const a = makeEmail('a@test.com', { isDefault: true })
        const b = makeEmail('b@test.com')

        expect(emailSortingCallback(a, b)).toBe(-1)
    })

    it('should sort non-default before default when b is default', () => {
        const a = makeEmail('a@test.com')
        const b = makeEmail('b@test.com', { isDefault: true })

        expect(emailSortingCallback(a, b)).toBe(1)
    })

    it('should sort alphabetically when both have the same flags', () => {
        const a = makeEmail('alpha@test.com')
        const b = makeEmail('beta@test.com')

        expect(emailSortingCallback(a, b)).toBeLessThan(0)
        expect(emailSortingCallback(b, a)).toBeGreaterThan(0)
    })

    it('should return 0 for identical emails with same flags', () => {
        const a = makeEmail('same@test.com')
        const b = makeEmail('same@test.com')

        expect(emailSortingCallback(a, b)).toBe(0)
    })
})
