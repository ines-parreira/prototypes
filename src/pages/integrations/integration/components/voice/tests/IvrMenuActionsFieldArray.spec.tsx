import React from 'react'
import {fromJS} from 'immutable'
import {times} from 'lodash'
import {fireEvent, render} from '@testing-library/react'
import {Provider} from 'react-redux'
import thunk from 'redux-thunk'
import configureMockStore from 'redux-mock-store'
import LD from 'launchdarkly-react-client-sdk'

import {FeatureFlagKey} from 'config/featureFlags'
import {
    IvrMenuAction,
    IvrMenuActionType,
    VoiceMessageType,
} from 'models/integration/types'
import {RootState} from 'state/types'

import IvrMenuActionsFieldArray from '../IvrMenuActionsFieldArray'

const mockStore = configureMockStore([thunk])

describe('<IvrMenuActionsFieldArray />', () => {
    const onChange: jest.MockedFunction<(value: IvrMenuAction[]) => void> =
        jest.fn()

    const options: IvrMenuAction[] = [
        {
            action: IvrMenuActionType.ForwardToExternalNumber,
            digit: '1',
            forward_call: {
                phone_number: '+123456789',
            },
        },
    ]

    beforeEach(() => {
        jest.resetAllMocks()
        jest.spyOn(LD, 'useFlags').mockImplementation(() => ({
            [FeatureFlagKey.DeflectToSMS]: true,
        }))
    })

    const renderComponent = (
        options: IvrMenuAction[],
        integrationsState = []
    ) =>
        render(
            <Provider
                store={mockStore({
                    integrations: fromJS({integrations: integrationsState}),
                } as RootState)}
            >
                <IvrMenuActionsFieldArray value={options} onChange={onChange} />
            </Provider>
        )

    it('should render', () => {
        const {container} = renderComponent(options)

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should allow adding menu options', () => {
        const {getByText} = renderComponent(options)

        const addButton = getByText('Add option')
        fireEvent.click(addButton)

        expect(onChange).toHaveBeenCalledWith([
            ...options,
            {
                action: IvrMenuActionType.ForwardToExternalNumber,
                digit: '2',
                forward_call: {
                    phone_number: '',
                },
            },
        ])
    })

    it('should allow removing menu options', () => {
        const {getByText} = renderComponent(options)

        const removeButton = getByText('close')
        fireEvent.click(removeButton)

        expect(onChange).toHaveBeenCalledWith([])
    })

    it('should limit the number of actions to 9', () => {
        const options: IvrMenuAction[] = times(9, (index) => ({
            digit: (index + 1).toString(),
            action: IvrMenuActionType.ForwardToExternalNumber,
            forward_call: {
                phone_number: '',
            },
        }))

        const {queryByText} = renderComponent(options)

        const addButton = queryByText('Add option')
        expect(addButton).toBeNull()
    })

    it('should display the deflect to sms action', () => {
        const options: IvrMenuAction[] = [
            {
                action: IvrMenuActionType.SendToSms,
                digit: '1',
                sms_deflection: {
                    confirmation_message: {
                        voice_message_type: VoiceMessageType.TextToSpeech,
                        text_to_speech_content: 'test',
                    },
                },
            },
        ]

        const {getByText} = renderComponent(options)

        expect(getByText('Send call to SMS')).toBeInTheDocument()
    })

    it('should not display the deflect to sms action when FF is off', () => {
        jest.spyOn(LD, 'useFlags').mockImplementation(() => ({
            [FeatureFlagKey.DeflectToSMS]: false,
        }))

        const options: IvrMenuAction[] = [
            {
                action: IvrMenuActionType.SendToSms,
                digit: '1',
                sms_deflection: {
                    confirmation_message: {
                        voice_message_type: VoiceMessageType.TextToSpeech,
                        text_to_speech_content: 'test',
                    },
                },
            },
        ]

        const {queryByText} = renderComponent(options)

        expect(queryByText('Send to SMS')).toBeNull()
    })
})
