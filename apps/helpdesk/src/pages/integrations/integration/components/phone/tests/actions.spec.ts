import client from '@repo/api-resources'
import MockAdapter from 'axios-mock-adapter'
import { fromJS } from 'immutable'

import { toast } from '@gorgias/axiom'

import { IntegrationType } from '../../../../../../models/integration/types'
import * as integrationActions from '../../../../../../state/integrations/actions'
import type { RootState, StoreDispatch } from '../../../../../../state/types'
import {
    updatePhoneGreetingMessageConfiguration,
    updatePhoneIvrConfiguration,
    updatePhoneVoicemailConfiguration,
} from '../actions'

jest.mock('@gorgias/axiom', () => {
    const actual = jest.requireActual('@gorgias/axiom')
    const toastMock = Object.assign(jest.fn(), {
        info: jest.fn(),
        success: jest.fn(),
        warning: jest.fn(),
        error: jest.fn(),
        ai: jest.fn(),
        promise: jest.fn(),
        dismiss: jest.fn(),
    })
    return {
        ...actual,
        toast: toastMock,
    }
})

const mockedServer = new MockAdapter(client)

let dispatch: StoreDispatch
const getState = () =>
    ({
        integrations: fromJS({
            integration: {
                id: 1,
            },
        }),
    }) as RootState
const payload = {}

beforeEach(() => {
    dispatch = jest.fn()
    jest.restoreAllMocks()
    jest.clearAllMocks()
    mockedServer.reset()
})

describe('updatePhoneVoicemailConfiguration', () => {
    it('Should dispatch an error notification because API returned 400', async () => {
        mockedServer
            .onPut('/integrations/phone/1/voicemail-preferences/')
            .reply(400, {
                msg: 'Validation failed.',
                data: {
                    voice_message_type: ['Not a valid choice.'],
                },
            })

        await updatePhoneVoicemailConfiguration(payload)(dispatch, getState)

        expect(dispatch).toHaveBeenCalledWith(
            expect.objectContaining({
                type: 'UPDATE_INTEGRATION_ERROR',
                verbose: true,
            }),
        )
    })

    it('Should call toast.success because integration was successfully updated', async () => {
        const fetchIntegration = jest.spyOn(
            integrationActions,
            'fetchIntegration',
        )

        mockedServer
            .onPut('/integrations/phone/1/voicemail-preferences/')
            .reply(202, {})
        await updatePhoneVoicemailConfiguration(payload)(dispatch, getState)

        expect(fetchIntegration).toBeCalledWith('1', IntegrationType.Phone)
        expect(toast.success).toHaveBeenCalledWith(
            'Voicemail configuration successfully updated.',
        )
    })
})

describe('updatePhoneGreetingMessageConfiguration', () => {
    it('Should dispatch an error notification because API returned 400', async () => {
        mockedServer
            .onPut('/integrations/phone/1/greeting-message/')
            .reply(400, {
                msg: 'Validation failed.',
            })

        await updatePhoneGreetingMessageConfiguration(payload)(
            dispatch,
            getState,
        )

        expect(dispatch).toHaveBeenCalledWith(
            expect.objectContaining({
                type: 'UPDATE_INTEGRATION_ERROR',
                verbose: true,
            }),
        )
    })

    it('Should call toast.success when greeting message was successfully updated', async () => {
        mockedServer
            .onPut('/integrations/phone/1/greeting-message/')
            .reply(202, {})

        await updatePhoneGreetingMessageConfiguration(payload)(
            dispatch,
            getState,
        )

        expect(toast.success).toHaveBeenCalledWith(
            'Greeting message successfully updated.',
        )
    })
})

describe('updatePhoneIvrConfiguration', () => {
    it('Should dispatch an error notification because API returned 400', async () => {
        mockedServer.onPut('/integrations/phone/1/ivr/').reply(400, {
            msg: 'Validation failed.',
        })

        await updatePhoneIvrConfiguration(payload)(dispatch, getState)

        expect(dispatch).toHaveBeenCalledWith(
            expect.objectContaining({
                type: 'UPDATE_INTEGRATION_ERROR',
                verbose: true,
            }),
        )
    })

    it('Should call toast.success when IVR configuration was successfully updated', async () => {
        const fetchIntegration = jest.spyOn(
            integrationActions,
            'fetchIntegration',
        )

        mockedServer.onPut('/integrations/phone/1/ivr/').reply(202, {})

        await updatePhoneIvrConfiguration(payload)(dispatch, getState)

        expect(fetchIntegration).toBeCalledWith('1', IntegrationType.Phone)
        expect(toast.success).toHaveBeenCalledWith(
            'IVR configuration successfully updated.',
        )
    })
})
