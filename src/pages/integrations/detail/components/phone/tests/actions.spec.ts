import MockAdapter from 'axios-mock-adapter'
import {fromJS} from 'immutable'

import {updatePhoneVoicemailConfiguration} from '../actions'
import client from '../../../../../../models/api/resources'
import {RootState, StoreDispatch} from '../../../../../../state/types'
import {IntegrationType} from '../../../../../../models/integration/types'
import * as notificationActions from '../../../../../../state/notifications/actions'

import * as integrationActions from '../../../../../../state/integrations/actions'

describe('updatePhoneVoicemailConfiguration', () => {
    const mockedServer = new MockAdapter(client)
    let dispatch: StoreDispatch
    const getState = () =>
        ({
            integrations: fromJS({
                integration: {
                    id: 1,
                },
            }),
        } as RootState)
    const formData = new FormData()

    beforeEach(() => {
        dispatch = jest.fn()
        jest.resetAllMocks()
        mockedServer.reset()
    })

    it('Should dispatch an error notification because API returned 400', async () => {
        mockedServer
            .onPut('/integrations/phone/1/voicemail-preferences/')
            .reply(400, {
                msg: 'Validation failed.',
                data: {
                    voice_message_type: ['Not a valid choice.'],
                },
            })

        await updatePhoneVoicemailConfiguration(formData)(dispatch, getState)

        expect((dispatch as jest.Mock).mock.calls).toMatchSnapshot()
    })

    it('Should dispatch success notification because integration was successfully updated', async () => {
        const fetchIntegration = jest.spyOn(
            integrationActions,
            'fetchIntegration'
        )
        const notify = jest.spyOn(notificationActions, 'notify')

        mockedServer
            .onPut('/integrations/phone/1/voicemail-preferences/')
            .reply(202, {})
        await updatePhoneVoicemailConfiguration(formData)(dispatch, getState)

        expect(fetchIntegration).toBeCalledWith('1', IntegrationType.Phone)
        expect(notify.mock.calls).toMatchSnapshot()
    })
})
