import { assumeMock } from '@repo/testing'
import { render, screen } from '@testing-library/react'

import { IntegrationType, PhoneIntegration } from '@gorgias/helpdesk-queries'

import { FeatureFlagKey } from 'config/featureFlags'
import { useFlag } from 'core/flags'
import useAppSelector from 'hooks/useAppSelector'

import VoiceIntegrationSettingsFormGeneralSection from '../VoiceIntegrationSettingsFormGeneralSection'

jest.mock('core/flags')
jest.mock('react-hook-form', () => ({
    useFormContext: () => ({
        setValue: jest.fn(),
        watch: jest.fn(() => 'test-emoji'),
    }),
}))
jest.mock('core/forms', () => ({
    FormField: ({ field: Component, name, ...props }: any) => {
        if (name === 'business_hours_id') {
            return <div data-testid="business-hours-select">Business Hours</div>
        }
        return <Component {...props} />
    },
}))
jest.mock('hooks/useAppSelector')

const useFlagMock = assumeMock(useFlag)
const useAppSelectorMock = assumeMock(useAppSelector)

const mockPhoneNumber = {
    id: 1,
    phone_number_friendly: '+1 (555) 123-4567',
}

const phoneIntegration: PhoneIntegration = {
    id: 1,
    name: 'Test Phone Integration',
    type: IntegrationType.Phone,
    business_hours_id: 1,
    meta: {
        phone_number_id: 1,
    },
} as PhoneIntegration

describe('VoiceIntegrationSettingsFormGeneralSection', () => {
    beforeEach(() => {
        useAppSelectorMock.mockReturnValue(mockPhoneNumber)
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    it('should render all fields without business hours when feature flag is disabled', () => {
        useFlagMock.mockImplementation((flag: FeatureFlagKey) => {
            if (flag === FeatureFlagKey.CustomBusinessHours) return false
            return false
        })

        render(
            <VoiceIntegrationSettingsFormGeneralSection
                integration={phoneIntegration}
            />,
        )

        expect(screen.getByText('Integration name')).toBeInTheDocument()
        expect(screen.getByText('Phone number')).toBeInTheDocument()
        expect(screen.getByText('Manage Phone Number')).toBeInTheDocument()

        expect(
            screen.queryByTestId('business-hours-select'),
        ).not.toBeInTheDocument()
    })

    it('should render all fields', () => {
        useFlagMock.mockImplementation((flag: FeatureFlagKey) => {
            if (flag === FeatureFlagKey.CustomBusinessHours) return true
            return false
        })

        render(
            <VoiceIntegrationSettingsFormGeneralSection
                integration={phoneIntegration}
            />,
        )

        expect(screen.getByText('Integration name')).toBeInTheDocument()
        expect(screen.getByText('Phone number')).toBeInTheDocument()
        expect(screen.getByText('Manage Phone Number')).toBeInTheDocument()

        expect(screen.getByTestId('business-hours-select')).toBeInTheDocument()
    })
})
