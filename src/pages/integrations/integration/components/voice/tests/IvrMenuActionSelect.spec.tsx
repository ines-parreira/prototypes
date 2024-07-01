import React from 'react'
import {render} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
    IvrMenuAction,
    IvrMenuActionType,
    VoiceMessageType,
} from 'models/integration/types'
import IvrMenuActionSelect from '../IvrMenuActionSelect'

describe('<IvrMenuActionSelect />', () => {
    const mockOnChange = jest.fn()
    const sendToSMSAction = {
        action: IvrMenuActionType.SendToSms,
        digit: '1',
        sms_deflection: {
            sms_content: 'test',
            sms_integration_id: 1,
            confirmation_message: {
                voice_message_type: VoiceMessageType.TextToSpeech,
                text_to_speech_content: 'test',
            },
        },
    } as IvrMenuAction
    const forwardCallAction = {
        action: IvrMenuActionType.ForwardToExternalNumber,
        digit: '2',
        forward_call: {
            phone_number: '1234567890',
        },
    } as IvrMenuAction
    const renderComponent = (
        value: IvrMenuAction,
        hasSmsIntegrations = true
    ) => {
        return render(
            <IvrMenuActionSelect
                value={value}
                onChange={mockOnChange}
                hasSmsIntegrations={hasSmsIntegrations}
            />
        )
    }

    it('should render', () => {
        const {getByText} = renderComponent(sendToSMSAction)

        expect(getByText('Send call to SMS')).toBeInTheDocument()

        userEvent.click(getByText('arrow_drop_down'))
        expect(getByText('Forward call to external number')).toBeInTheDocument()
        expect(getByText('Forward call to Gorgias number')).toBeInTheDocument()
        expect(getByText('Play message')).toBeInTheDocument()
    })

    it('should render disabled option if no integrations', () => {
        const {getByText} = renderComponent(forwardCallAction, false)

        expect(getByText('Forward call to external number')).toBeInTheDocument()

        userEvent.click(getByText('arrow_drop_down'))
        expect(getByText('Send call to SMS')).toHaveClass('disabled')
    })

    it('should select option forward options', () => {
        const {getByText} = renderComponent(sendToSMSAction)

        userEvent.click(getByText('arrow_drop_down'))
        userEvent.click(getByText('Forward call to external number'))
        expect(mockOnChange).toHaveBeenCalledWith({
            ...sendToSMSAction,
            action: 'forward_to_external_number',
            forward_call: {phone_number: ''},
        })

        userEvent.click(getByText('arrow_drop_down'))
        userEvent.click(getByText('Forward call to Gorgias number'))
        expect(mockOnChange).toHaveBeenCalledWith({
            ...sendToSMSAction,
            action: 'forward_to_gorgias_number',
            forward_call: {phone_number: ''},
        })
    })

    it('should select option play message option', () => {
        const {getByText} = renderComponent(sendToSMSAction)

        userEvent.click(getByText('arrow_drop_down'))
        userEvent.click(getByText('Play message'))
        expect(mockOnChange).toHaveBeenCalledWith({
            ...sendToSMSAction,
            action: 'play_message',
        })
    })

    it('should select option send to sms option', () => {
        const {getByText} = renderComponent(forwardCallAction)

        userEvent.click(getByText('arrow_drop_down'))
        userEvent.click(getByText('Send call to SMS'))
        expect(mockOnChange).toHaveBeenCalledWith({
            ...forwardCallAction,
            action: 'deflect_to_sms',
            sms_deflection: {
                confirmation_message: {
                    text_to_speech_content:
                        'Thank you for choosing our service! We’ve received your request and are on it.',
                    voice_message_type: 'text_to_speech',
                },
            },
        })
    })
})
