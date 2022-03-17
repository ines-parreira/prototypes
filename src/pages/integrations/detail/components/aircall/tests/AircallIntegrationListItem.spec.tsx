import React from 'react'
import {render, fireEvent, screen, act} from '@testing-library/react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'

import {IntegrationType} from 'models/integration/constants'
import {RootState, StoreDispatch} from 'state/types'
import {AircallIntegration} from 'models/integration/types'
import {deleteIntegration} from 'state/integrations/actions'

import AircallIntegrationListItem from '../AircallIntegrationListItem'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>()
const store = mockStore({} as RootState)

const deleteIntegrationMock = deleteIntegration as jest.MockedFunction<
    typeof deleteIntegration
>
jest.mock('state/integrations/actions', () => ({
    deleteIntegration: jest.fn().mockResolvedValue({}),
}))

describe('<AircallIntegrationListItem/>', () => {
    const props = {
        integration: {
            id: 7,
            name: 'my Aircall integration',
            type: IntegrationType.Aircall,
            meta: {
                address: '+18443076830',
            },
            deactivated_datetime: null,
        } as AircallIntegration,
    }

    describe('render()', () => {
        it('should render the aircall integration list item', () => {
            const {container} = render(
                <Provider store={store}>
                    <AircallIntegrationListItem {...props} />
                </Provider>
            )
            expect(container.firstChild).toMatchSnapshot()
        })

        it('should render the aircall integration list item and click on delete integration', () => {
            const {container} = render(
                <Provider store={store}>
                    <AircallIntegrationListItem {...props} />
                </Provider>
            )
            expect(container.firstChild).toMatchSnapshot()

            const deleteButton = container.querySelector(`#delete-button-7`)
            if (!deleteButton) {
                fail()
            }
            fireEvent.click(deleteButton)

            const confirmButton = screen.getByText(/confirm/i)
            act(() => {
                fireEvent.click(confirmButton)
            })

            expect(deleteIntegrationMock.mock.calls[0]).toMatchInlineSnapshot(`
                Array [
                  Immutable.Map {
                    "id": 7,
                    "name": "my Aircall integration",
                    "type": "aircall",
                    "meta": Immutable.Map {
                      "address": "+18443076830",
                    },
                    "deactivated_datetime": null,
                  },
                ]
            `)
        })
    })
})
