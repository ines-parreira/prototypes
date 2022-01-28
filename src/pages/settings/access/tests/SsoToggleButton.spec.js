import React from 'react'
import {render, waitFor} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MockAdapter from 'axios-mock-adapter'

import client from '../../../../models/api/resources'

import {SsoToggleButton} from '../SsoToggleButton.tsx'

const basicProps = {
    id: 'google',
    name: 'Google',
    logo: null,
    value: false,
    loading: false,
    disabled: false,
    setValue: jest.fn(),
}

describe('<SsoToggleButton/>', () => {
    const mockServer = new MockAdapter(client)

    beforeEach(() => {
        mockServer.reset()
    })

    it('should render properly', () => {
        const {container} = render(<SsoToggleButton {...basicProps} />)
        expect(container).toMatchSnapshot()
    })

    it('should directly save when trying to enable SSO', () => {
        const setValue = jest.fn()
        const {container} = render(
            <SsoToggleButton
                {...basicProps}
                value={false}
                setValue={setValue}
            />
        )

        userEvent.click(container.getElementsByClassName('toggle-switch')[0])
        expect(setValue).toHaveBeenCalledWith(true)
    })

    it('should directly save when trying to disable active SSO without active users', async () => {
        mockServer.onGet('/api/sso/users').reply(200, {})

        const setValue = jest.fn()
        const {container} = render(
            <SsoToggleButton {...basicProps} value={true} setValue={setValue} />
        )

        userEvent.click(container.getElementsByClassName('toggle-switch')[0])
        await waitFor(() => expect(setValue).toHaveBeenCalledWith(false))
    })

    it('should show a confirmation popup when trying to disable active SSO with active users', async () => {
        mockServer.onGet('/api/sso/users').reply(200, {google: 123})

        const setValue = jest.fn()
        const {container, findByText} = render(
            <SsoToggleButton {...basicProps} value={true} setValue={setValue} />
        )

        userEvent.click(container.getElementsByClassName('toggle-switch')[0])
        expect(
            await findByText('Deactivate Google Single Sign-On?')
        ).not.toBeNull()

        userEvent.click(await findByText('Deactivate'))
        expect(setValue).toHaveBeenCalledWith(false)
    })
})
