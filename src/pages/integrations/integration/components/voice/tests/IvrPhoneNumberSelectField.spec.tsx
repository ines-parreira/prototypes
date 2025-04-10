import React from 'react'

import { act, render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import { useParams } from 'react-router-dom'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import IvrPhoneNumberSelectField from '../IvrPhoneNumberSelectField'

const mockStore = configureMockStore([thunk])
jest.mock('react-router-dom', () => ({
    useParams: jest.fn(),
}))
const useParamsMock = useParams as jest.Mock

describe('<IvrPhoneNumberSelectField />', () => {
    const mockOnChange = jest.fn()
    useParamsMock.mockReturnValue({ integrationId: 123 })

    const state = {
        integrations: fromJS({
            integrations: [
                {
                    type: 'phone',
                    id: 1,
                    name: 'Phone Integration 1',
                    meta: {
                        phone_number_id: 1,
                    },
                },
            ],
        }),
        entities: {
            newPhoneNumbers: {
                1: {
                    phone_number: '123',
                },
            },
        },
    }

    it('renders existing option', () => {
        const { getByText } = render(
            <Provider store={mockStore(state)}>
                <IvrPhoneNumberSelectField
                    onChange={mockOnChange}
                    value={{
                        phone_number: '123',
                        integration_id: 1,
                    }}
                />
            </Provider>,
        )

        expect(getByText('Phone Integration 1')).toBeInTheDocument()
    })

    it('renders component', async () => {
        const { getByText } = render(
            <Provider store={mockStore(state)}>
                <IvrPhoneNumberSelectField
                    onChange={mockOnChange}
                    value={{
                        phone_number: '123',
                    }}
                />
            </Provider>,
        )

        expect(getByText('Select phone number')).toBeInTheDocument()

        await act(async () => {
            userEvent.click(getByText('arrow_drop_down'))
        })

        await act(async () => {
            userEvent.click(getByText('Phone Integration 1'))
        })

        expect(mockOnChange).toHaveBeenCalledWith({
            phone_number: '123',
            integration_id: 1,
        })
    })
})
