import { assumeMock } from '@repo/testing'
import { render } from '@testing-library/react'
import { useFormContext } from 'react-hook-form'

import { FormField } from 'core/forms'
import { RECORDING_NOTIFICATION_MAX_DURATION } from 'models/integration/constants'

import VoiceIntegrationSettingCallRecording from '../VoiceIntegrationSettingCallRecording'
import VoiceIntegrationSettingCallRecording_DEPRECATED from '../VoiceIntegrationSettingCallRecording_DEPRECATED'

jest.mock('core/forms')
const FormFieldMock = assumeMock(FormField)

const watchMock = jest.fn()
const mockUseFormContextReturnValue = {
    watch: watchMock,
} as unknown as ReturnType<typeof useFormContext>

jest.mock('react-hook-form')
const useFormContextMock = assumeMock(useFormContext)

describe('VoiceIntegrationSettingCallRecording_DEPRECATED', () => {
    const renderComponent = () =>
        render(<VoiceIntegrationSettingCallRecording_DEPRECATED />)

    beforeEach(() => {
        FormFieldMock.mockImplementation(({ children, label }: any) => (
            <div>
                <div>{label}</div>
                <div>{children}</div>
            </div>
        ))
        useFormContextMock.mockReturnValue(mockUseFormContextReturnValue)
    })

    it('renders with toggles on', () => {
        watchMock.mockReturnValue([true, true] as any)

        const { getByText } = renderComponent()
        expect(getByText('Outbound calls')).toBeInTheDocument()
        expect(getByText('Inbound calls')).toBeInTheDocument()
        expect(getByText('Call recording notification')).toBeInTheDocument()

        expect(FormFieldMock).toHaveBeenCalledWith(
            expect.objectContaining({
                name: 'meta.preferences.record_outbound_calls',
            }),
            {},
        )
        expect(FormFieldMock).toHaveBeenCalledWith(
            expect.objectContaining({
                name: 'meta.preferences.record_inbound_calls',
            }),
            {},
        )
        expect(FormFieldMock).toHaveBeenCalledWith(
            expect.objectContaining({
                name: 'meta.recording_notification',
                shouldUpload: true,
                radioButtonId: 'call_recording_notification',
                maxRecordingDuration: RECORDING_NOTIFICATION_MAX_DURATION,
            }),
            {},
        )
    })

    it('renders with toggles off', () => {
        watchMock.mockReturnValue([false, false] as any)

        const { queryByText } = renderComponent()
        expect(queryByText('Outbound calls')).toBeInTheDocument()
        expect(queryByText('Inbound calls')).toBeInTheDocument()
        expect(queryByText('Call recording notification')).toBeNull()
    })
})

describe('VoiceIntegrationSettingCallRecording', () => {
    const renderComponent = () =>
        render(<VoiceIntegrationSettingCallRecording integrationId={1234} />)

    beforeEach(() => {
        FormFieldMock.mockImplementation(({ children, label }: any) => (
            <div>
                <div>{label}</div>
                <div>{children}</div>
            </div>
        ))
        useFormContextMock.mockReturnValue(mockUseFormContextReturnValue)
    })

    it('renders with toggles on', () => {
        watchMock.mockReturnValue([true, true] as any)

        const { getByText } = renderComponent()
        expect(getByText('Outbound calls')).toBeInTheDocument()
        expect(getByText('Inbound calls')).toBeInTheDocument()
        expect(getByText('Call recording notification')).toBeInTheDocument()

        expect(FormFieldMock).toHaveBeenCalledWith(
            expect.objectContaining({
                name: 'meta.preferences.record_outbound_calls',
            }),
            {},
        )
        expect(FormFieldMock).toHaveBeenCalledWith(
            expect.objectContaining({
                name: 'meta.preferences.record_inbound_calls',
            }),
            {},
        )
        expect(FormFieldMock).toHaveBeenCalledWith(
            expect.objectContaining({
                name: 'meta.recording_notification',
                shouldUpload: true,
                radioButtonId: 'call_recording_notification',
                maxRecordingDuration: RECORDING_NOTIFICATION_MAX_DURATION,
            }),
            {},
        )
    })

    it('renders with toggles off', () => {
        watchMock.mockReturnValue([false, false] as any)

        const { queryByText } = renderComponent()
        expect(queryByText('Outbound calls')).toBeInTheDocument()
        expect(queryByText('Inbound calls')).toBeInTheDocument()
        expect(queryByText('Call recording notification')).toBeNull()
    })
})
