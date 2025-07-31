import { render } from '@testing-library/react'
import { useFormContext } from 'react-hook-form'

import { FeatureFlagKey } from 'config/featureFlags'
import { useFlag } from 'core/flags'
import { FormField } from 'core/forms'
import useAppSelector from 'hooks/useAppSelector'
import { assumeMock } from 'utils/testing'

import VoiceIntegrationSettingVoicemail from '../VoiceIntegrationSettingVoicemail'
import VoiceMessageField from '../VoiceMessageField'

jest.mock('core/forms')
const FormFieldMock = assumeMock(FormField)

const watchMock = jest.fn()
const mockUseFormContextReturnValue = {
    watch: watchMock,
} as unknown as ReturnType<typeof useFormContext>

jest.mock('react-hook-form')
const useFormContextMock = assumeMock(useFormContext)

jest.mock('hooks/useAppSelector')
const useAppSelectorMock = useAppSelector as jest.Mock

jest.mock('core/flags')
const useFlagMock = assumeMock(useFlag)

describe('VoiceIntegrationSettingVoicemail', () => {
    const renderComponent = () => render(<VoiceIntegrationSettingVoicemail />)

    beforeEach(() => {
        FormFieldMock.mockImplementation(({ label, caption }: any) => (
            <div>
                {label}
                <span>{caption}</span>
            </div>
        ))
        useFormContextMock.mockReturnValue(mockUseFormContextReturnValue)
        watchMock.mockReturnValue(true)
        useAppSelectorMock.mockReturnValue({
            data: {
                business_hours: [{ id: 1 }],
            },
        })
        useFlagMock.mockImplementation((flag) => {
            if (flag === FeatureFlagKey.CustomBusinessHours) {
                return true
            }
        })
    })

    it('should render', () => {
        const { getByText } = renderComponent()
        expect(
            getByText('Allow caller to leave a voicemail'),
        ).toBeInTheDocument()
        expect(
            getByText('Use same voicemail outside of business hours'),
        ).toBeInTheDocument()

        expect(FormFieldMock).toHaveBeenCalledWith(
            expect.objectContaining({
                name: 'meta.voicemail',
                shouldUpload: true,
                radioButtonId: 'voicemail',
            }),
            {},
        )
        expect(FormFieldMock).toHaveBeenCalledWith(
            expect.objectContaining({
                name: 'meta.voicemail.outside_business_hours.use_during_business_hours_settings',
                isDisabled: false,
            }),
            {},
        )
        expect(FormFieldMock).toHaveBeenCalledWith(
            expect.objectContaining({
                name: 'meta.voicemail.allow_to_leave_voicemail',
            }),
            {},
        )
    })

    it('should render outside business hours message', () => {
        watchMock.mockReturnValue(false)
        renderComponent()

        expect(FormFieldMock).toHaveBeenCalledWith(
            expect.objectContaining({
                name: 'meta.voicemail.outside_business_hours',
                shouldUpload: true,
                radioButtonId: 'voicemail-outside-business-hours',
            }),
            {},
        )
    })

    it('should not disable outside business hours when not set', () => {
        useAppSelectorMock.mockReturnValue({
            data: {
                business_hours: [],
            },
        })

        const { queryByText } = renderComponent()
        expect(queryByText('Set business hours')).not.toBeInTheDocument()

        expect(FormFieldMock).toHaveBeenCalledWith(
            expect.objectContaining({
                name: 'meta.voicemail.outside_business_hours.use_during_business_hours_settings',
                isDisabled: false,
            }),
            {},
        )

        // Simulate the checkbox being unchecked to show outside business hours field
        watchMock.mockReturnValue(false)
        renderComponent()

        expect(FormFieldMock).toHaveBeenCalledWith(
            expect.objectContaining({
                name: 'meta.voicemail.outside_business_hours',
                field: VoiceMessageField,
            }),
            {},
        )
    })

    it('should disable outside business hours when not set and CBH FF off', () => {
        useFlagMock.mockImplementation((flag) => {
            if (flag === FeatureFlagKey.CustomBusinessHours) {
                return false
            }
        })

        useAppSelectorMock.mockReturnValue({
            data: {
                business_hours: [],
            },
        })

        const { getByText } = renderComponent()
        expect(getByText('Set business hours')).toBeInTheDocument()

        expect(FormFieldMock).toHaveBeenCalledWith(
            expect.objectContaining({
                name: 'meta.voicemail.outside_business_hours.use_during_business_hours_settings',
                isDisabled: true,
            }),
            {},
        )
    })
})
