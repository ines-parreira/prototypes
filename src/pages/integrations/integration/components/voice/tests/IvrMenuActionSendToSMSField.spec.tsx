import {render} from '@testing-library/react'
import React from 'react'
import thunk from 'redux-thunk'
import configureMockStore from 'redux-mock-store'
import {Provider} from 'react-redux'
import userEvent from '@testing-library/user-event'
import {RootState, StoreDispatch} from 'state/types'
import {IvrSmsDeflection, VoiceMessageType} from 'models/integration/types'
import {
    DEFAULT_IVR_DEFLECTION_CONFIRMATION_MESSAGE,
    DEFAULT_IVR_DEFLECTION_SMS_CONTENT,
} from 'models/integration/constants'
import IvrMenuActionSendToSMSField from '../IvrMenuActionSendToSMSField'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

describe('<IvrMenuActionSendToSMSField />', () => {
    const mockOnChange = jest.fn()
    const mockSetDrawerOpen = jest.fn()

    const renderComponent = (
        settings: IvrSmsDeflection,
        integrations: any = [],
        isDrawerOpen = false
    ) =>
        render(
            <Provider store={mockStore({})}>
                <IvrMenuActionSendToSMSField
                    settings={settings}
                    smsIntegrations={integrations}
                    isDrawerOpen={isDrawerOpen}
                    setDrawerOpen={mockSetDrawerOpen}
                    onChange={mockOnChange}
                />
            </Provider>
        )

    it('should render defaults', () => {
        const {getByText, getByLabelText} = renderComponent(
            {
                confirmation_message:
                    DEFAULT_IVR_DEFLECTION_CONFIRMATION_MESSAGE,
            },
            [],
            true
        )

        expect(getByText('Add message')).toBeInTheDocument()
        expect(getByText('Message')).toBeInTheDocument()
        expect(getByText('Select SMS integration')).toBeInTheDocument()
        expect(getByText('SMS confirmation message')).toBeInTheDocument()
        expect(getByText('Outbound SMS Message')).toBeInTheDocument()
        expect(getByLabelText('Insert Voice Recording')).not.toBeChecked()
        expect(getByLabelText('Text To Speech')).toBeChecked()
        expect(
            getByText(DEFAULT_IVR_DEFLECTION_SMS_CONTENT)
        ).toBeInTheDocument()
        expect(getByText('Save Changes')).toBeInTheDocument()
        expect(
            getByText(
                'This message will be sent to callers in a form of SMS once this IVR option is selected'
            )
        ).toBeInTheDocument()
    })

    it('should render prefilled values', () => {
        const {getByText} = renderComponent(
            {
                confirmation_message: {
                    voice_message_type: VoiceMessageType.TextToSpeech,
                    text_to_speech_content: 'confirmation message',
                },
                sms_content: 'sms content',
                sms_integration_id: 1,
            },
            [
                {
                    id: 1,
                    name: 'TEST SMS INTEGRATION',
                },
            ],
            true
        )

        expect(getByText('Edit message')).toBeInTheDocument()
        expect(getByText('confirmation message')).toBeInTheDocument()
        expect(getByText('sms content')).toBeInTheDocument()
        expect(getByText('TEST SMS INTEGRATION')).toBeInTheDocument()
    })

    it('should save values', async () => {
        const {getByText} = renderComponent(
            {
                confirmation_message: {
                    voice_message_type: VoiceMessageType.TextToSpeech,
                    text_to_speech_content: 'confirmation message',
                },
                sms_content: 'sms content',
                sms_integration_id: 1,
            },
            [
                {
                    id: 1,
                    name: 'TEST SMS INTEGRATION',
                },
                {
                    id: 2,
                    name: 'Another integration',
                },
            ],
            true
        )

        await userEvent.type(getByText('confirmation message'), ' test')
        await userEvent.type(getByText('sms content'), ' test')
        userEvent.click(getByText('Another integration'))
        userEvent.click(getByText('Save Changes'))

        expect(mockOnChange).toHaveBeenCalledWith({
            confirmation_message: {
                voice_message_type: VoiceMessageType.TextToSpeech,
                text_to_speech_content: 'confirmation message test',
            },
            sms_content: 'sms content test',
            sms_integration_id: 2,
        })
    })

    it.each(['confirmation message', 'sms content'])(
        'should disable save changes button',
        (inputText) => {
            const {getByText} = renderComponent(
                {
                    confirmation_message: {
                        voice_message_type: VoiceMessageType.TextToSpeech,
                        text_to_speech_content: 'confirmation message',
                    },
                    sms_content: 'sms content',
                    sms_integration_id: 1,
                },
                [
                    {
                        id: 1,
                        name: 'TEST SMS INTEGRATION',
                    },
                ],
                true
            )

            userEvent.clear(getByText(inputText))

            expect(getByText('Save Changes')).toHaveAttribute(
                'aria-disabled',
                'true'
            )
        }
    )

    it('should not allow saving without integration', () => {
        const {getByText} = renderComponent(
            {
                confirmation_message: {
                    voice_message_type: VoiceMessageType.TextToSpeech,
                    text_to_speech_content: 'confirmation message',
                },
                sms_content: 'sms content',
            },
            [],
            true
        )

        userEvent.click(getByText('Save Changes'))

        expect(mockOnChange).not.toHaveBeenCalled()
    })

    it('should not allow saving without recording', () => {
        const {getByText} = renderComponent(
            {
                confirmation_message: {
                    voice_message_type: VoiceMessageType.VoiceRecording,
                },
                sms_content: 'sms content',
            },
            [
                {
                    id: 1,
                    name: 'TEST SMS INTEGRATION',
                },
            ],
            true
        )

        userEvent.click(getByText('Save Changes'))

        expect(mockOnChange).not.toHaveBeenCalled()
    })

    it('should not close drawer on cancel', () => {
        const {getByText} = renderComponent(
            {
                confirmation_message: {
                    voice_message_type: VoiceMessageType.VoiceRecording,
                },
                sms_content: 'sms content',
            },
            [
                {
                    id: 1,
                    name: 'TEST SMS INTEGRATION',
                },
            ],
            true
        )

        userEvent.click(getByText('Cancel'))

        expect(mockSetDrawerOpen).toHaveBeenCalled()
    })

    it('should open drawer on new option', () => {
        const {getByText, container} = renderComponent(
            {
                confirmation_message: {
                    voice_message_type: VoiceMessageType.VoiceRecording,
                },
                sms_content: 'sms content',
            },
            [
                {
                    id: 1,
                    name: 'TEST SMS INTEGRATION',
                },
            ],
            false
        )

        userEvent.click(getByText('Add message'))
        expect(mockSetDrawerOpen).toHaveBeenCalledWith(true)

        // click outside the drawer
        const backdrop = container.querySelector('.backdrop')
        if (backdrop) {
            userEvent.click(backdrop)
            expect(mockSetDrawerOpen).toHaveBeenCalledWith(false)
        }
    })

    it('should open drawer on existing settings', () => {
        const {getByText} = renderComponent(
            {
                confirmation_message: {
                    voice_message_type: VoiceMessageType.VoiceRecording,
                },
                sms_content: 'sms content',
                sms_integration_id: 1,
            },
            [
                {
                    id: 1,
                    name: 'TEST SMS INTEGRATION',
                },
            ],
            false
        )

        userEvent.click(getByText('Edit message'))
        expect(mockSetDrawerOpen).toHaveBeenCalledWith(true)

        userEvent.click(getByText('keyboard_tab'))
        expect(mockSetDrawerOpen).toHaveBeenCalledWith(false)
    })
})
