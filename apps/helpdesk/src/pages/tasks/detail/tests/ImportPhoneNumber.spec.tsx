import React from 'react'

import client from '@repo/api-resources'
import { render } from '@repo/testing'
import { fireEvent, screen } from '@testing-library/react'
import MockAdapter from 'axios-mock-adapter'

import { ImportPhoneNumber } from '../ImportPhoneNumber'

const mockedServer = new MockAdapter(client)

describe('<ImportPhoneNumber />', () => {
    beforeEach(() => {
        mockedServer.reset()
    })

    it('shows a success toast when the import succeeds', async () => {
        mockedServer.onPost('/api/integrations/phone/tasks').reply(200, {})

        render(<ImportPhoneNumber />)

        fireEvent.click(screen.getByRole('button', { name: 'Start porting' }))

        const toastEl = await screen.findByRole('status', {
            name: 'Number ported successfully.',
        })
        expect(toastEl).toHaveAttribute('data-intent', 'success')
    })

    it('shows an error toast with the API error data when the import fails', async () => {
        mockedServer.onPost('/api/integrations/phone/tasks').reply(400, {
            error: { data: { phone_number: 'Invalid number' } },
        })

        render(<ImportPhoneNumber />)

        fireEvent.click(screen.getByRole('button', { name: 'Start porting' }))

        const toastEl = await screen.findByRole('status', {
            name: '{"phone_number":"Invalid number"}',
        })
        expect(toastEl).toHaveAttribute('data-intent', 'destructive')
    })
})
