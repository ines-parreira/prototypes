import { render } from '@repo/testing'
import { fireEvent, screen } from '@testing-library/react'
import type { Map } from 'immutable'
import { fromJS } from 'immutable'

import { account } from 'fixtures/account'
import { billingState } from 'fixtures/billing'
import { integrationsState } from 'fixtures/integrations'
import type { RootState } from 'state/types'

import { SocialsSettingsFormComponent } from '../FormComponents/SocialsSettingsFormComponent'
import { useSocialsIntegrations } from '../hooks/useSocialsIntegrations'
import type { SocialsIntegration } from '../types'

jest.mock('../hooks/useSocialsIntegrations')

jest.mock(
    '../../SocialsIntegrationListSelection/SocialsIntegrationListSelection',
    () => ({
        SocialsIntegrationListSelection: ({
            onSelectionChange,
            socialsItems,
        }: {
            selectedIds: number[]
            onSelectionChange: (ids: number[]) => void
            socialsItems: SocialsIntegration[]
        }) => (
            <div>
                <p>Socials List Selection Component</p>
                <ul>
                    {socialsItems.map((item) => (
                        <li key={item.id}>{item.pageName}</li>
                    ))}
                </ul>
                <button onClick={() => onSelectionChange([socialsItems[0].id])}>
                    Select social
                </button>
            </div>
        ),
    }),
)

const mockUseSocialsIntegrations = jest.mocked(useSocialsIntegrations)
const mockUpdateValue = jest.fn()
const mockSetIsPristine = jest.fn()

const defaultState = {
    currentAccount: fromJS(account),
    billing: fromJS(billingState),
    integrations: fromJS(integrationsState) as Map<any, any>,
} as RootState

const defaultProps = {
    monitoredSocialsIntegrations: null,
    socialsDisclaimer: null,
    updateValue: mockUpdateValue,
    setIsPristine: mockSetIsPristine,
}

const renderWithProvider = (props: any = defaultProps) => {
    render(<SocialsSettingsFormComponent {...props} />, {
        storeState: defaultState,
    })
}

describe('SocialsSettingsFormComponent', () => {
    const mockSocialsIntegrations: SocialsIntegration[] = [
        { id: 1, pageName: 'Brand IG', instagramUsername: 'brand_ig' },
        { id: 2, pageName: 'Other Brand', instagramUsername: 'other_brand' },
    ]

    beforeEach(() => {
        mockUseSocialsIntegrations.mockReturnValue(mockSocialsIntegrations)
        mockUpdateValue.mockClear()
        mockSetIsPristine.mockClear()
    })

    it('renders the Meta policies compliance notice', () => {
        renderWithProvider()
        expect(
            screen.getByText("Follow Meta's platform policies"),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('link', {
                name: /restricted goods and services/i,
            }),
        ).toBeInTheDocument()
    })

    it('renders the integrations list with required label', () => {
        renderWithProvider({ ...defaultProps, isRequired: true })
        expect(
            screen.getByText(/Select socials integrations/i),
        ).toBeInTheDocument()
        expect(
            screen.getByText('One or more socials integrations required.'),
        ).toBeInTheDocument()
    })

    it('does not show validation error when an integration is selected', () => {
        renderWithProvider({
            ...defaultProps,
            monitoredSocialsIntegrations: [1],
            isRequired: true,
        })
        expect(
            screen.queryByText('One or more socials integrations required.'),
        ).not.toBeInTheDocument()
    })

    it('calls updateValue when an integration is selected', () => {
        renderWithProvider()
        fireEvent.click(screen.getByText('Select social'))
        expect(mockUpdateValue).toHaveBeenCalledWith(
            'monitoredSocialsIntegrations',
            [1],
        )
    })

    it('calls setIsPristine when an integration is selected', () => {
        renderWithProvider()
        fireEvent.click(screen.getByText('Select social'))
        expect(mockSetIsPristine).toHaveBeenCalledWith(false)
    })

    it('shows empty state when there are no socials integrations', () => {
        mockUseSocialsIntegrations.mockReturnValue([])
        renderWithProvider()
        expect(
            screen.getByText(/don't have any socials integrations connected/i),
        ).toBeInTheDocument()
    })
})
