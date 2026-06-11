import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { Form } from '@repo/forms'
import { assumeMock, render } from '@repo/testing'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import type { PhoneIntegration } from '@gorgias/helpdesk-queries'
import { IntegrationType } from '@gorgias/helpdesk-types'

import { VoiceIntegrationSettingsFormGeneralSection } from '../VoiceIntegrationSettingsFormGeneralSection'

jest.mock('@repo/feature-flags')

jest.mock('pages/phoneNumbers/PhoneNumberSelectField', () => ({
    PhoneNumberSelectField: ({
        value,
        onChange,
    }: {
        value: { id: number } | null
        onChange: (value: { id: number } | null) => void
    }) => (
        <div>
            <span>Phone number select{value ? `: ${value.id}` : ''}</span>
            <button type="button" onClick={() => onChange({ id: 2 })}>
                Change phone number
            </button>
        </div>
    ),
}))

jest.mock('pages/settings/businessHours/BusinessHoursSelectField', () => ({
    BusinessHoursSelectField: () => <div>Business hours select</div>,
}))

jest.mock('pages/common/forms/EmojiTextInput/EmojiTextInput', () => ({
    EmojiTextInput: ({
        emoji,
        value,
        placeholder,
        onChange,
        onEmojiChange,
    }: {
        emoji: string | null
        value: string
        placeholder: string
        onChange: (value: string) => void
        onEmojiChange: (emoji: string | null) => void
    }) => (
        <div>
            <span>Selected emoji: {emoji}</span>
            <input
                placeholder={placeholder}
                value={value}
                onChange={(event) => onChange(event.target.value)}
            />
            <button type="button" onClick={() => onEmojiChange('🎉')}>
                Change emoji
            </button>
        </div>
    ),
}))

const useFlagMock = assumeMock(useFlag)

const mockPhoneNumber = {
    id: 1,
    phone_number_friendly: '+1 (555) 123-4567',
}

const mockOtherPhoneNumber = {
    id: 2,
    phone_number_friendly: '+1 (555) 987-6543',
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

const renderComponent = () =>
    render(
        <Form
            defaultValues={{
                name: phoneIntegration.name,
                business_hours_id: phoneIntegration.business_hours_id,
                meta: {
                    emoji: '🤠',
                    phone_number_id: phoneIntegration.meta.phone_number_id,
                },
            }}
            onValidSubmit={jest.fn()}
        >
            <VoiceIntegrationSettingsFormGeneralSection
                integration={phoneIntegration}
            />
        </Form>,
        {
            storeState: {
                entities: {
                    newPhoneNumbers: {
                        1: mockPhoneNumber,
                        2: mockOtherPhoneNumber,
                    },
                },
            },
        },
    )

describe('VoiceIntegrationSettingsFormGeneralSection', () => {
    afterEach(() => {
        jest.clearAllMocks()
    })

    it('should render all fields without business hours when feature flag is disabled', () => {
        useFlagMock.mockImplementation((flag: FeatureFlagKey) => {
            if (flag === FeatureFlagKey.CustomBusinessHours) return false
            return false
        })

        renderComponent()

        expect(screen.getByText('Integration name')).toBeInTheDocument()
        expect(screen.getByText('Phone number')).toBeInTheDocument()
        expect(screen.getByText('Manage Phone Number')).toBeInTheDocument()

        expect(
            screen.queryByText('Business hours select'),
        ).not.toBeInTheDocument()
    })

    it('should render all fields', () => {
        useFlagMock.mockImplementation((flag: FeatureFlagKey) => {
            if (flag === FeatureFlagKey.CustomBusinessHours) return true
            return false
        })

        renderComponent()

        expect(screen.getByText('Integration name')).toBeInTheDocument()
        expect(screen.getByText('Phone number')).toBeInTheDocument()
        expect(screen.getByText('Manage Phone Number')).toBeInTheDocument()

        expect(screen.getByText('Business hours select')).toBeInTheDocument()
    })

    it('should render an editable integration name input with the current value', () => {
        useFlagMock.mockReturnValue(false)

        renderComponent()

        expect(
            screen.getByPlaceholderText('Ex: Company Support Line'),
        ).toHaveValue(phoneIntegration.name)
    })

    it('should resolve the selected phone number from the store', () => {
        useFlagMock.mockReturnValue(false)

        renderComponent()

        expect(
            screen.getByText(`Phone number select: ${mockPhoneNumber.id}`),
        ).toBeInTheDocument()
    })

    it('should update the integration emoji when changed', async () => {
        const user = userEvent.setup()
        useFlagMock.mockReturnValue(false)

        renderComponent()

        expect(screen.getByText('Selected emoji: 🤠')).toBeInTheDocument()

        await user.click(screen.getByRole('button', { name: /change emoji/i }))

        expect(
            await screen.findByText('Selected emoji: 🎉'),
        ).toBeInTheDocument()
    })

    it('should resolve the newly selected phone number on change', async () => {
        const user = userEvent.setup()
        useFlagMock.mockReturnValue(false)

        renderComponent()

        expect(
            screen.getByText(`Phone number select: ${mockPhoneNumber.id}`),
        ).toBeInTheDocument()

        await user.click(
            screen.getByRole('button', { name: /change phone number/i }),
        )

        expect(
            screen.getByText(`Phone number select: ${mockOtherPhoneNumber.id}`),
        ).toBeInTheDocument()
    })
})
