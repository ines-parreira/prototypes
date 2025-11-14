import { FeatureFlagKey } from '@repo/feature-flags'
import { assumeMock } from '@repo/testing'
import { screen } from '@testing-library/react'

import { IntegrationType, PhoneIntegration } from '@gorgias/helpdesk-queries'

import { useFlag } from 'core/flags'
import useAppSelector from 'hooks/useAppSelector'
import { renderWithRouter } from 'utils/testing'

import VoiceIntegrationSettingsFormGeneralSection from '../VoiceIntegrationSettingsFormGeneralSection'

jest.mock('core/flags')

const mockFormFieldProps: Record<string, any> = {}

jest.mock('react-hook-form', () => ({
    useFormContext: () => ({
        setValue: jest.fn(),
        watch: jest.fn(() => 'test-emoji'),
    }),
}))
jest.mock('core/forms', () => ({
    FormField: ({ field: Component, name, ...props }: any) => {
        mockFormFieldProps[name] = { field: Component, name, ...props }
        if (name === 'business_hours_id') {
            return <div data-testid="business-hours-select">Business Hours</div>
        }
        if (name === 'meta.phone_number_id') {
            return (
                <div data-testid="phone-number-select">Phone Number Select</div>
            )
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

        renderWithRouter(
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

        renderWithRouter(
            <VoiceIntegrationSettingsFormGeneralSection
                integration={phoneIntegration}
            />,
        )

        expect(screen.getByText('Integration name')).toBeInTheDocument()
        expect(screen.getByText('Phone number')).toBeInTheDocument()
        expect(screen.getByText('Manage Phone Number')).toBeInTheDocument()

        expect(screen.getByTestId('business-hours-select')).toBeInTheDocument()
    })

    it('should render editable phone number select field when feature flag is disabled', () => {
        useFlagMock.mockImplementation((flag: FeatureFlagKey) => {
            if (flag === FeatureFlagKey.ExtendedCallFlows) return true
            return false
        })

        renderWithRouter(
            <VoiceIntegrationSettingsFormGeneralSection
                integration={phoneIntegration}
            />,
        )

        expect(screen.getByTestId('phone-number-select')).toBeInTheDocument()
    })

    it('should render disabled phone number input when feature flag is enabled', () => {
        useFlagMock.mockImplementation((flag: FeatureFlagKey) => {
            if (flag === FeatureFlagKey.ExtendedCallFlows) return false
            return false
        })

        renderWithRouter(
            <VoiceIntegrationSettingsFormGeneralSection
                integration={phoneIntegration}
            />,
        )

        const textboxes = screen.getAllByRole('textbox')
        const phoneInput = textboxes.find((input) =>
            input.getAttribute('value')?.includes('555'),
        )
        expect(phoneInput).toBeDefined()
        expect(phoneInput).toBeDisabled()
        expect(
            screen.queryByTestId('phone-number-select'),
        ).not.toBeInTheDocument()
    })

    it('should pass correct inputTransform and outputTransform to phone number field', () => {
        useFlagMock.mockImplementation((flag: FeatureFlagKey) => {
            if (flag === FeatureFlagKey.ExtendedCallFlows) return true
            return false
        })

        const mockPhoneNumbers = {
            1: mockPhoneNumber,
            2: { id: 2, phone_number_friendly: '+1 (555) 987-6543' },
        }

        let callCount = 0
        useAppSelectorMock.mockImplementation(() => {
            callCount++
            if (callCount === 1) {
                return mockPhoneNumber
            }
            return mockPhoneNumbers
        })

        renderWithRouter(
            <VoiceIntegrationSettingsFormGeneralSection
                integration={phoneIntegration}
            />,
        )

        const phoneNumberFieldProps = mockFormFieldProps['meta.phone_number_id']
        expect(phoneNumberFieldProps).toBeDefined()
        expect(phoneNumberFieldProps.inputTransform).toBeDefined()
        expect(phoneNumberFieldProps.outputTransform).toBeDefined()

        expect(phoneNumberFieldProps.inputTransform(1)).toEqual(mockPhoneNumber)
        expect(phoneNumberFieldProps.inputTransform(2)).toEqual(
            mockPhoneNumbers[2],
        )
        expect(phoneNumberFieldProps.inputTransform(null)).toBeNull()

        expect(phoneNumberFieldProps.outputTransform(mockPhoneNumber)).toBe(1)
        expect(phoneNumberFieldProps.outputTransform(mockPhoneNumbers[2])).toBe(
            2,
        )
        expect(phoneNumberFieldProps.outputTransform(null)).toBeUndefined()
    })
})
