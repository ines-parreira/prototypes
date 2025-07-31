import { userEvent } from '@repo/testing'
import { screen, waitFor } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {
    IvrForwardCallMenuAction,
    IvrMenuAction,
    IvrMenuActionType,
    IvrPlayVoiceMessageAction,
    IvrSendToSmsMenuAction,
    VoiceMessageType,
} from 'models/integration/types'
import { renderWithQueryClientAndRouter } from 'tests/renderWIthQueryClientAndRouter'

import IvrMenuActionField from '../IvrMenuActionField'

const mockStore = configureMockStore([thunk])

const defaultPlayMessageAction: IvrPlayVoiceMessageAction = {
    action: IvrMenuActionType.PlayMessage,
    digit: '1',
    voice_message: {
        voice_message_type: VoiceMessageType.TextToSpeech,
        text_to_speech_content: 'Test message',
    },
}

type Props = {
    value: IvrMenuAction
    onChange: (value: IvrMenuAction) => void
    onRemove: () => void
}

const defaultProps: Props = {
    value: defaultPlayMessageAction,
    onChange: jest.fn(),
    onRemove: jest.fn(),
}

const renderComponent = (props = defaultProps) => {
    const store = mockStore({
        integrations: fromJS({
            integrations: [],
            smsIntegrations: [],
        }),
    })

    return renderWithQueryClientAndRouter(
        <Provider store={store}>
            <IvrMenuActionField {...props} />
        </Provider>,
    )
}

describe('<IvrMenuActionField />', () => {
    beforeEach(() => {
        jest.useFakeTimers()
    })

    afterEach(() => {
        jest.useRealTimers()
    })

    it('should render the digit', () => {
        renderComponent()
        expect(screen.getByText('1')).toBeInTheDocument()
    })

    it('should render the action select', () => {
        renderComponent()
        expect(screen.getByText('Play message')).toBeInTheDocument()
    })

    it('should render the edit message button when voice message exists', () => {
        renderComponent()
        expect(screen.getByText('Edit message')).toBeInTheDocument()
    })

    it('should render the add message button when voice message is empty', () => {
        const emptyMessageAction: IvrPlayVoiceMessageAction = {
            action: IvrMenuActionType.PlayMessage,
            digit: '1',
            voice_message: undefined as any,
        }
        renderComponent({
            ...defaultProps,
            value: emptyMessageAction,
        })

        expect(screen.getByText('Add message')).toBeInTheDocument()
    })

    it('should open drawer when clicking edit message button', async () => {
        renderComponent()

        await userEvent.click(screen.getByText('Edit message'))

        await waitFor(() => {
            expect(screen.getByText('Message')).toBeInTheDocument()
        })
    })

    it('should open drawer when clicking add message button', async () => {
        const emptyMessageAction: IvrPlayVoiceMessageAction = {
            action: IvrMenuActionType.PlayMessage,
            digit: '1',
            voice_message: undefined as any,
        }
        renderComponent({
            ...defaultProps,
            value: emptyMessageAction,
        })

        userEvent.click(screen.getByText('Add message'))

        expect(screen.getByText('Message')).toBeInTheDocument()
    })

    it('should close drawer when clicking cancel button', async () => {
        renderComponent()

        userEvent.click(screen.getByText('Edit message'))
        userEvent.click(screen.getByText('Cancel'))

        await waitFor(() => {
            expect(screen.queryByText('Message')).not.toBeVisible()
        })
    })

    it('should close drawer when clicking close button', async () => {
        renderComponent()

        userEvent.click(screen.getByText('Edit message'))

        await screen.findByRole('button', { name: 'close edit drawer' })

        userEvent.click(
            screen.getByRole('button', { name: 'close edit drawer' }),
        )

        await waitFor(() => {
            expect(screen.queryByText('Message')).not.toBeVisible()
        })
    })

    it('should save changes when clicking save button', async () => {
        renderComponent()

        userEvent.click(screen.getByText('Edit message'))

        const textbox = await screen.findByRole('textbox')

        expect(textbox).toHaveValue('Test message')

        userEvent.click(screen.getByText('Save Changes'))

        await waitFor(() => {
            expect(defaultProps.onChange).toHaveBeenCalledWith(
                defaultPlayMessageAction,
            )
        })
    })

    it('should call onRemove when clicking remove button', async () => {
        renderComponent()

        userEvent.click(screen.getByText('close'))

        await waitFor(() => {
            expect(defaultProps.onRemove).toHaveBeenCalled()
        })
    })

    it('should render phone number input for forward to external number action', () => {
        const forwardAction: IvrForwardCallMenuAction = {
            action: IvrMenuActionType.ForwardToExternalNumber,
            digit: '1',
            forward_call: {
                phone_number: '+1234567890',
            },
        }
        renderComponent({
            ...defaultProps,
            value: forwardAction,
        })

        expect(screen.getByRole('textbox')).toHaveValue('234 567 890')
    })

    it('should render phone number select for forward to Gorgias number action', () => {
        const forwardAction: IvrForwardCallMenuAction = {
            action: IvrMenuActionType.ForwardToGorgiasNumber,
            digit: '1',
            forward_call: {
                phone_number: '+1234567890',
            },
        }
        renderComponent({
            ...defaultProps,
            value: forwardAction,
        })

        expect(screen.getAllByRole('combobox').length).toBe(2)
    })

    it('should render SMS deflection field for send to SMS action', () => {
        const smsAction: IvrSendToSmsMenuAction = {
            action: IvrMenuActionType.SendToSms,
            digit: '1',
            sms_deflection: {
                confirmation_message: {
                    voice_message_type: VoiceMessageType.TextToSpeech,
                    text_to_speech_content: 'Test',
                },
            },
        }
        renderComponent({
            ...defaultProps,
            value: smsAction,
        })

        expect(screen.getByText('Send call to SMS')).toBeInTheDocument()
    })
})
