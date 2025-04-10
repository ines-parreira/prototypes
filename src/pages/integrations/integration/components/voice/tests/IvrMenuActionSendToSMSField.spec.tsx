import React from 'react'

import { act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {
    DEFAULT_IVR_DEFLECTION_CONFIRMATION_MESSAGE,
    DEFAULT_IVR_DEFLECTION_SMS_CONTENT,
} from 'models/integration/constants'
import { IvrSmsDeflection, VoiceMessageType } from 'models/integration/types'
import { RootState, StoreDispatch } from 'state/types'
import { renderWithQueryClientProvider } from 'tests/reactQueryTestingUtils'

import IvrMenuActionSendToSMSField from '../IvrMenuActionSendToSMSField'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

describe('<IvrMenuActionSendToSMSField />', () => {
    const mockOnChange = jest.fn()
    const mockSetDrawerOpen = jest.fn()

    const renderComponent = (
        settings: IvrSmsDeflection,
        integrations: any = [],
        isDrawerOpen = false,
    ) =>
        renderWithQueryClientProvider(
            <Provider store={mockStore({})}>
                <IvrMenuActionSendToSMSField
                    settings={settings}
                    smsIntegrations={integrations}
                    isDrawerOpen={isDrawerOpen}
                    setDrawerOpen={mockSetDrawerOpen}
                    onChange={mockOnChange}
                />
            </Provider>,
        )

    it('should render defaults', () => {
        const { getByText, getAllByText, getByLabelText } = renderComponent(
            {
                confirmation_message:
                    DEFAULT_IVR_DEFLECTION_CONFIRMATION_MESSAGE,
            },
            [],
            true,
        )

        expect(getByText('Add message')).toBeInTheDocument()
        expect(getByText('Message')).toBeInTheDocument()
        expect(getAllByText('Select SMS integration')).toHaveLength(2)
        expect(getByText('SMS confirmation message')).toBeInTheDocument()
        expect(getByText('Outbound SMS Message')).toBeInTheDocument()
        expect(getByLabelText('Custom recording')).not.toBeChecked()
        expect(getByLabelText('Text-to-speech')).toBeChecked()
        expect(
            getByText(DEFAULT_IVR_DEFLECTION_SMS_CONTENT),
        ).toBeInTheDocument()
        expect(getByText('Save Changes')).toBeInTheDocument()
        expect(
            getByText(
                'This message will be sent to callers in a form of SMS once this IVR option is selected',
            ),
        ).toBeInTheDocument()
    })

    it('should render prefilled values', () => {
        const { getByText } = renderComponent(
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
            true,
        )

        expect(getByText('Edit message')).toBeInTheDocument()
        expect(getByText('confirmation message')).toBeInTheDocument()
        expect(getByText('sms content')).toBeInTheDocument()
        expect(getByText('TEST SMS INTEGRATION')).toBeInTheDocument()
    })

    it('should save values', async () => {
        const { getByText, getAllByRole } = renderComponent(
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
            true,
        )

        const [confirmationMessageInput, smsContentInput] =
            getAllByRole('textbox')

        await act(async () => {
            await userEvent.clear(confirmationMessageInput)
            await userEvent.type(
                confirmationMessageInput,
                'confirmation message test',
            )

            await userEvent.clear(smsContentInput)
            await userEvent.type(smsContentInput, 'sms content test')
        })

        act(() => {
            userEvent.click(getByText('arrow_drop_down'))
        })

        act(() => {
            userEvent.click(getByText('Another integration'))
        })

        act(() => {
            userEvent.click(getByText('Save Changes'))
        })

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
            const { getByText, getByRole } = renderComponent(
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
                true,
            )

            userEvent.clear(getByText(inputText))

            expect(
                getByRole('button', { name: 'Save Changes' }),
            ).toBeAriaDisabled()
        },
    )

    it('should not allow saving without integration', () => {
        const { getByText } = renderComponent(
            {
                confirmation_message: {
                    voice_message_type: VoiceMessageType.TextToSpeech,
                    text_to_speech_content: 'confirmation message',
                },
                sms_content: 'sms content',
            },
            [],
            true,
        )

        userEvent.click(getByText('Save Changes'))

        expect(mockOnChange).not.toHaveBeenCalled()
    })

    it('should not allow saving without recording', () => {
        const { getByText } = renderComponent(
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
            true,
        )

        userEvent.click(getByText('Save Changes'))

        expect(mockOnChange).not.toHaveBeenCalled()
    })

    it('should not close drawer on cancel', () => {
        const { getByText } = renderComponent(
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
            true,
        )

        userEvent.click(getByText('Cancel'))

        expect(mockSetDrawerOpen).toHaveBeenCalled()
    })

    it('should open drawer on new option', () => {
        const { getByText, container } = renderComponent(
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
            false,
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

    it('should open drawer on existing settings', async () => {
        const { getByText, queryByText } = renderComponent(
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
            false,
        )

        userEvent.click(getByText('Edit message'))
        expect(mockSetDrawerOpen).toHaveBeenCalledWith(true)

        // type something
        await userEvent.type(getByText('sms content'), ' test')

        userEvent.click(getByText('keyboard_tab'))
        expect(mockSetDrawerOpen).toHaveBeenCalledWith(false)

        // closing the drawer should reset the message to the initial state
        userEvent.click(getByText('Edit message'))
        expect(queryByText('sms content test')).toBeNull()
    })

    it('should open drawer on new settings', async () => {
        const { getByText, queryByText } = renderComponent(
            {
                confirmation_message: {
                    voice_message_type: VoiceMessageType.VoiceRecording,
                },
            },
            [
                {
                    id: 1,
                    name: 'TEST SMS INTEGRATION',
                },
            ],
            false,
        )

        userEvent.click(getByText('Add message'))
        expect(mockSetDrawerOpen).toHaveBeenCalledWith(true)

        // type something
        await userEvent.type(
            getByText(
                'Hello! Thanks for choosing our messaging service. How can I help you?',
            ),
            ' test',
        )

        userEvent.click(getByText('keyboard_tab'))
        expect(mockSetDrawerOpen).toHaveBeenCalledWith(false)

        // closing the drawer should reset the message to the initial state
        userEvent.click(getByText('Add message'))
        expect(
            queryByText(
                'Hello! Thanks for choosing our messaging service. How can I help you? test',
            ),
        ).toBeNull()
    })
})
