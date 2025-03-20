import { render } from '@testing-library/react'
import { useFormContext } from 'react-hook-form'

import { FormField } from 'core/forms'
import useAppSelector from 'hooks/useAppSelector'
import { assumeMock } from 'utils/testing'

import { formVoiceMessageValidation } from '../hooks/useVoiceMessageValidation'
import VoiceIntegrationSettingVoicemail from '../VoiceIntegrationSettingVoicemail'

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
                validation: formVoiceMessageValidation,
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
                validation: formVoiceMessageValidation,
            }),
            {},
        )
    })

    it('should disable outside business hours when not set', () => {
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
