import React from 'react'
import {fireEvent, render, screen} from '@testing-library/react'
import createMockStore from 'redux-mock-store'
import {Provider} from 'react-redux'
import thunk from 'redux-thunk'
import {fromJS} from 'immutable'
import copy from 'copy-to-clipboard'

import {notify} from 'state/notifications/actions'
import {RootState, StoreDispatch} from 'state/types'
import {assumeMock} from 'utils/testing'

import BaseEmailIntegrationInputField from '../BaseEmailIntegrationInputField'

const mockStore = createMockStore<Partial<RootState>, StoreDispatch>([thunk])
const store = mockStore({
    integrations: fromJS({
        integrations: [
            {
                id: 1,
                type: 'email',
                meta: {
                    address: 'acme@gorgias.com',
                },
            },
        ],
    }),
})

window.GORGIAS_STATE = {
    integrations: {
        authentication: {
            email: {
                forwarding_email_address: 'gorgias.com',
            },
        },
    },
} as any

jest.mock('hooks/useAppDispatch', () => () => jest.fn())
jest.mock('state/notifications/actions')
jest.mock('copy-to-clipboard')
const copyMock = assumeMock(copy)

const renderComponent = () =>
    render(
        <Provider store={store}>
            <BaseEmailIntegrationInputField />
        </Provider>
    )

describe('<BaseEmailIntegrationInputField />', () => {
    it('should render', () => {
        renderComponent()

        expect(screen.getByRole('textbox')).toBeInTheDocument()
        expect(screen.getByRole('textbox').getAttribute('value')).toBe(
            'acme@gorgias.com'
        )
        expect(
            screen.getByRole('button', {name: 'Copy content_copy'})
        ).toBeInTheDocument()
    })

    it('should copy the value when clicking on the auxiliary button', () => {
        renderComponent()

        fireEvent.click(screen.getByRole('button', {name: 'Copy content_copy'}))

        expect(copyMock).toHaveBeenCalledWith('acme@gorgias.com')

        expect(notify).toHaveBeenCalledWith({
            status: 'success',
            title: 'Address copied to clipboard',
        })
    })

    it('should display an error notification when copying fails', () => {
        renderComponent()

        copyMock.mockImplementationOnce(() => {
            throw new Error('copy failed')
        })

        fireEvent.click(screen.getByRole('button', {name: 'Copy content_copy'}))
        expect(copyMock).toHaveBeenCalledWith('acme@gorgias.com')

        expect(notify).toHaveBeenCalledWith({
            status: 'error',
            title: 'Failed to copy address',
        })
    })
})
