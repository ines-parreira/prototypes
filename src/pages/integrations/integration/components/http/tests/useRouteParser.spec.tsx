import React from 'react'

import { renderHook } from '@testing-library/react-hooks'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import * as ReactRouterDom from 'react-router-dom'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { integrationBase } from 'fixtures/integrations'
import { IntegrationType } from 'models/integration/constants'

import {
    EVENTS_PATH,
    INTEGRATIONS_LIST_PATH,
    NEW_INTEGRATION_PATH,
} from '../constants'
import { useRouteParser } from '../useRouteParser'

jest.mock('react-router', () => ({
    ...jest.requireActual<Record<string, unknown>>('react-router'),
    useParams: jest.fn(),
}))
const useParamsMock = jest.spyOn(ReactRouterDom, 'useParams')

const integration = { ...integrationBase, type: IntegrationType.Http }
const integrationBaseId = integrationBase.id.toString()

const mockStore = configureMockStore([thunk])
const store = mockStore({
    integrations: fromJS({
        integrations: [integration],
        state: {
            loading: {},
        },
    }),
})

const defaultData = {
    eventId: undefined,
    integration: undefined,
    integrationId: undefined,
    isDetail: false,
    isEvent: false,
    isEvents: false,
    isIntegration: false,
    isList: false,
    isNewIntegration: false,
}

describe('useRouteParser', () => {
    beforeEach(() => {
        useParamsMock.mockClear()
    })
    it.each([
        [
            {},
            {
                ...defaultData,
                isDetail: true,
            },
        ],
        [
            { integrationId: INTEGRATIONS_LIST_PATH },
            {
                ...defaultData,
                isList: true,
                integrationId: INTEGRATIONS_LIST_PATH,
            },
        ],
        [
            { integrationId: integrationBaseId },
            {
                ...defaultData,
                isIntegration: true,
                integrationId: integrationBaseId,
                integration,
            },
        ],
        [
            { integrationId: NEW_INTEGRATION_PATH },
            {
                ...defaultData,
                isIntegration: true,
                isNewIntegration: true,
                integrationId: NEW_INTEGRATION_PATH,
            },
        ],
        [
            { integrationId: integrationBaseId, extra: EVENTS_PATH },
            {
                ...defaultData,
                integration,
                integrationId: integrationBaseId,
                isEvents: true,
            },
        ],
        [
            {
                integrationId: integrationBaseId,
                extra: EVENTS_PATH,
                subId: '1',
            },
            {
                ...defaultData,
                integrationId: integrationBaseId,
                integration,
                isEvent: true,
                eventId: '1',
            },
        ],
    ])('should return the correct data', (routeParams, expectedData) => {
        useParamsMock.mockReturnValue(routeParams)
        const { result } = renderHook(() => useRouteParser(), {
            wrapper: ({ children }) => (
                <Provider store={store}>{children}</Provider>
            ),
        })

        expect(result.current).toEqual(expectedData)
    })
})
