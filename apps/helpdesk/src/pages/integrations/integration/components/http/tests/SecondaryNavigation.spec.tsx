import React from 'react'

import { render } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import * as ReactRouterDom from 'react-router-dom'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import SecondaryNavigation from '../SecondaryNavigation'

jest.mock('react-router', () => ({
    ...jest.requireActual<Record<string, unknown>>('react-router'),
    useParams: jest.fn(),
}))
const useParamsMock = jest.spyOn(ReactRouterDom, 'useParams')

const mockStore = configureMockStore([thunk])
const store = mockStore({ integrations: fromJS({ integrations: [] }) })

jest.mock('pages/common/components/Loader/Loader', () => () => (
    <div>Loader</div>
))

describe('SecondaryNavigation', () => {
    it.each([
        [{}, ['Settings', 'Events']],
        [{ integrationId: '1' }, ['About', 'Manage']],
    ])(
        'should render the correct SecondaryNavigation',
        (routeParams, expectedLinks) => {
            useParamsMock.mockReturnValue(routeParams)
            const { queryByRole } = render(
                <Provider store={store}>
                    <SecondaryNavigation />
                </Provider>,
            )
            expectedLinks.forEach((name) => {
                expect(queryByRole('link', { name }))
            })
        },
    )
})
