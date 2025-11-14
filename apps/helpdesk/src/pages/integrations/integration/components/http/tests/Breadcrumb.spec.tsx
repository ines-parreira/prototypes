import React from 'react'

import { render } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import { MemoryRouter, useParams } from 'react-router-dom'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { integrationBase } from 'fixtures/integrations'
import { IntegrationType } from 'models/integration/constants'
import { getIntegrationConfig } from 'state/integrations/helpers'

import Breadcrumb from '../Breadcrumb'
import {
    EVENTS_PATH,
    INTEGRATIONS_LIST_PATH,
    NEW_INTEGRATION_PATH,
} from '../constants'

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useParams: jest.fn(),
}))

const useParamsMock = useParams as jest.Mock

const httpConfig = getIntegrationConfig(IntegrationType.Http)

const integrationsState = {
    integrations: [{ ...integrationBase, type: IntegrationType.Http }],
}
const integrationBaseId = integrationBase.id.toString()

const mockStore = configureMockStore([thunk])
const store = mockStore({ integrations: fromJS(integrationsState) })

jest.mock('pages/common/components/Loader/Loader', () => () => (
    <div>Loader</div>
))

describe('Breadcrumb', () => {
    it.each([
        [{}, [], [httpConfig!.title]],
        [{ integrationId: INTEGRATIONS_LIST_PATH }, [], [httpConfig!.title]],
        [
            { integrationId: NEW_INTEGRATION_PATH },
            [httpConfig!.title],
            ['Add a new HTTP integration'],
        ],
        [
            { integrationId: integrationBaseId },
            [httpConfig!.title],
            [integrationBase.name],
        ],
        [
            { integrationId: integrationBaseId, extra: EVENTS_PATH },
            [httpConfig!.title, integrationBase.name],
            ['Events'],
        ],
        [
            {
                integrationId: integrationBaseId,
                extra: EVENTS_PATH,
                subId: '1',
            },
            [httpConfig!.title, integrationBase.name, 'Events'],
            ['#1'],
        ],
    ])(
        'should render the correct breadcrumb',
        (routeParams, expectedLinks, expectedTexts) => {
            useParamsMock.mockReturnValue(routeParams)
            const { queryByRole, queryByText } = render(
                <MemoryRouter>
                    <Provider store={store}>
                        <Breadcrumb />
                    </Provider>
                </MemoryRouter>,
            )
            expectedLinks.forEach((name) => {
                expect(queryByRole('link', { name }))
            })
            expectedTexts.forEach((text) => {
                expect(queryByText(text))
            })
        },
    )
})
