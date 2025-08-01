import { assumeMock } from '@repo/testing'

import { FormField, useFormContext } from 'core/forms'
import { renderWithQueryClientProvider } from 'tests/reactQueryTestingUtils'

import VoiceIntegrationSettingDistributionBehavior from '../VoiceIntegrationSettingDistributionBehavior'

jest.mock('core/forms')
const FormFieldMock = assumeMock(FormField)

const watchMock = jest.fn()
const mockUseFormContextReturnValue = {
    watch: watchMock,
} as unknown as ReturnType<typeof useFormContext>

jest.mock('react-hook-form')
const useFormContextMock = assumeMock(useFormContext)

jest.mock('../VoiceQueueSummary', () => () => <div>VoiceQueueSummary</div>)

describe('VoiceIntegrationSettingDistributionBehavior', () => {
    const renderComponent = (
        props: {
            showVoicemailOutsideBusinessHours?: boolean
        } = {},
    ) =>
        renderWithQueryClientProvider(
            <VoiceIntegrationSettingDistributionBehavior {...props} />,
        )

    beforeEach(() => {
        FormFieldMock.mockImplementation(({ label }: any) => <div>{label}</div>)
        useFormContextMock.mockReturnValue(mockUseFormContextReturnValue)
    })

    it('should render send calls to voicemail', () => {
        watchMock.mockReturnValue([true, null])

        const { queryByText } = renderComponent()
        expect(FormFieldMock).toHaveBeenCalledWith(
            expect.objectContaining({
                name: 'meta.send_calls_to_voicemail',
                options: [
                    {
                        label: 'Ring to agents or teams',
                        caption:
                            'Route calls to a queue to ensure they reach the right agents or teams.',
                        value: 'ring_agents',
                    },
                    {
                        label: 'Send calls directly to voicemail',
                        caption:
                            'Calls will go directly to voicemail without ringing any agents or teams.',
                        value: 'send_calls_to_voicemail',
                    },
                ],
            }),
            {},
        )
        expect(queryByText('Queue name')).toBeNull()
        expect(
            queryByText('Send calls to voicemail outside business hours'),
        ).toBeNull()
    })

    it('should render distribution options', () => {
        watchMock.mockReturnValue([false, 20])

        const { getByText } = renderComponent()

        expect(
            getByText('Send calls to voicemail outside business hours'),
        ).toBeInTheDocument()
        expect(getByText('VoiceQueueSummary')).toBeInTheDocument()

        expect(FormFieldMock).toHaveBeenCalledWith(
            expect.objectContaining({
                name: 'meta.queue_id',
            }),
            {},
        )
        expect(FormFieldMock).toHaveBeenCalledWith(
            expect.objectContaining({
                name: 'meta.send_calls_to_voicemail',
            }),
            {},
        )
        expect(FormFieldMock).toHaveBeenCalledWith(
            expect.objectContaining({
                name: 'meta.queue_id',
            }),
            {},
        )
        expect(FormFieldMock).toHaveBeenCalledWith(
            expect.objectContaining({
                name: 'meta.preferences.voicemail_outside_business_hours',
            }),
            {},
        )
    })

    it('should hide voicemail outside business hours', () => {
        watchMock.mockReturnValue([false, 20])

        const { queryByText } = renderComponent({
            showVoicemailOutsideBusinessHours: false,
        })

        expect(
            queryByText('Send calls to voicemail outside business hours'),
        ).toBeNull()
    })

    it.each`
        sendCallsToVoicemail | inputValue
        ${true}              | ${'send_calls_to_voicemail'}
        ${false}             | ${'ring_agents'}
    `(
        'should transform send_calls_to_voicemail correctly',
        ({ sendCallsToVoicemail, inputValue }) => {
            watchMock.mockReturnValue([true, null])

            FormFieldMock.mockImplementation(
                ({ inputTransform, outputTransform }: any) => (
                    <div>
                        <span>{inputTransform(sendCallsToVoicemail)}</span>
                        <span>
                            {outputTransform(
                                inputTransform(sendCallsToVoicemail),
                            ).toString()}
                        </span>
                    </div>
                ),
            )

            const { getByText } = renderComponent()
            expect(getByText(inputValue)).toBeInTheDocument()
            expect(
                getByText(sendCallsToVoicemail.toString()),
            ).toBeInTheDocument()
        },
    )
})
