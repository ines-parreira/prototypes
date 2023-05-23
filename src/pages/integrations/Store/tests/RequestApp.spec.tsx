import React from 'react'
import {fireEvent, screen, render, waitFor} from '@testing-library/react'
import configureMockStore from 'redux-mock-store'
import {Provider} from 'react-redux'

import * as client from 'models/integration/resources'
import {notify} from 'state/notifications/actions'

import {NotificationStatus} from 'state/notifications/types'
import RequestApp from '../RequestApp'

jest.mock('state/notifications/actions')

const mockedDispatch = jest.fn()
jest.mock('hooks/useAppDispatch', () => () => mockedDispatch)
const mockStore = configureMockStore()

describe('<RequestApp />', () => {
    beforeEach(() => {
        jest.resetAllMocks()
    })

    it('should render correctly', () => {
        const {container} = render(
            <Provider store={mockStore()}>
                <RequestApp />
            </Provider>
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should focus the textarea when the modal is open', () => {
        render(
            <Provider store={mockStore()}>
                <RequestApp />
            </Provider>
        )

        expect(screen.getByRole('dialog')).not.toHaveClass('open')
        fireEvent.click(screen.getByRole('button', {name: 'Request App'}))

        expect(screen.getByRole('textbox')).toHaveFocus()
    })

    it('should open the modal on Request App Click', () => {
        render(
            <Provider store={mockStore()}>
                <RequestApp />
            </Provider>
        )

        expect(screen.getByRole('dialog')).not.toHaveClass('open')
        fireEvent.click(screen.getByRole('button', {name: 'Request App'}))

        expect(screen.getByRole('dialog')).toHaveClass('open')
    })

    it('should close the modal on Cancel Click', () => {
        render(
            <Provider store={mockStore()}>
                <RequestApp />
            </Provider>
        )

        expect(screen.getByRole('dialog')).not.toHaveClass('open')
        fireEvent.click(screen.getByRole('button', {name: 'Request App'}))
        fireEvent.click(screen.getByRole('button', {name: 'Cancel'}))

        expect(screen.getByRole('dialog')).not.toHaveClass('open')
    })

    it('should have the Submit Request button disabled without description', () => {
        render(
            <Provider store={mockStore()}>
                <RequestApp />
            </Provider>
        )
        fireEvent.click(screen.getByRole('button', {name: 'Request App'}))

        expect(
            screen
                .getByRole('button', {name: 'Submit Request'})
                .hasAttribute('disabled')
        ).toBeTruthy()
    })

    it('should have the Submit Request button enabled with description', () => {
        render(
            <Provider store={mockStore()}>
                <RequestApp />
            </Provider>
        )
        fireEvent.click(screen.getByRole('button', {name: 'Request App'}))
        fireEvent.change(screen.getByRole('textbox'), {
            target: {value: 'test'},
        })

        expect(
            screen
                .getByRole('button', {name: 'Submit Request'})
                .hasAttribute('disabled')
        ).toBeFalsy()
    })

    it('should send the request on Submit Request Click', async () => {
        const payload = {description: 'test'}
        const requestNewIntegration = jest
            .spyOn(client, 'requestNewIntegration')
            .mockReturnValue(new Promise((resolve) => resolve(payload)))

        render(
            <Provider store={mockStore()}>
                <RequestApp />
            </Provider>
        )

        expect(screen.getByRole('dialog')).not.toHaveClass('open')
        fireEvent.click(screen.getByRole('button', {name: 'Request App'}))

        fireEvent.change(screen.getByRole('textbox'), {
            target: {value: 'test'},
        })

        fireEvent.click(screen.getByRole('button', {name: 'Submit Request'}))
        expect(requestNewIntegration).toHaveBeenCalledWith(payload)

        await waitFor(() => {
            expect(notify).toHaveBeenNthCalledWith(1, {
                message: 'Thank you for your feedback!',
                status: NotificationStatus.Success,
            })
        })

        expect(screen.getByRole('dialog')).not.toHaveClass('open')
    })

    it('should not send the request on Submit Request Click when error', async () => {
        const payload = {description: 'test'}
        const requestNewIntegration = jest
            .spyOn(client, 'requestNewIntegration')
            .mockReturnValue(new Promise((resolve, reject) => reject(payload)))

        render(
            <Provider store={mockStore()}>
                <RequestApp />
            </Provider>
        )

        expect(screen.getByRole('dialog')).not.toHaveClass('open')
        fireEvent.click(screen.getByRole('button', {name: 'Request App'}))

        fireEvent.change(screen.getByRole('textbox'), {
            target: {value: 'test'},
        })

        fireEvent.click(screen.getByRole('button', {name: 'Submit Request'}))
        expect(requestNewIntegration).toHaveBeenCalledWith(payload)

        await waitFor(() => {
            expect(notify).toHaveBeenNthCalledWith(1, {
                message:
                    'Uh oh! An error happened trying to save your request, please try again.',
                status: NotificationStatus.Error,
            })
        })

        expect(screen.getByRole('dialog')).toHaveClass('open')
    })
})
