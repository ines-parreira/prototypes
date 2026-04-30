import React from 'react'

import { render } from '@repo/testing'
import { fireEvent, screen, waitFor } from '@testing-library/react'

import * as client from 'models/integration/resources'

import RequestApp from '../RequestApp'

describe('<RequestApp />', () => {
    beforeEach(() => {
        jest.resetAllMocks()
    })

    it('should render correctly', () => {
        const { container } = render(<RequestApp />)
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should focus the textarea when the modal is open', () => {
        const { queryByText } = render(<RequestApp />)

        expect(
            queryByText(
                /Provide any relevant details such as app name, or app category/i,
            ),
        ).not.toBeInTheDocument()
        fireEvent.click(screen.getByRole('button', { name: 'Request App' }))

        expect(screen.getByRole('textbox')).toHaveFocus()
    })

    it('should open the modal on Request App Click', () => {
        const { queryByText } = render(<RequestApp />)

        expect(
            queryByText(
                /Provide any relevant details such as app name, or app category/i,
            ),
        ).not.toBeInTheDocument()
        fireEvent.click(screen.getByRole('button', { name: 'Request App' }))

        expect(
            queryByText(
                /Provide any relevant details such as app name, or app category/i,
            ),
        ).toBeInTheDocument()
    })

    it('should close the modal on Cancel Click', async () => {
        const { queryByText } = render(<RequestApp />)

        expect(
            queryByText(
                /Provide any relevant details such as app name, or app category/i,
            ),
        ).not.toBeInTheDocument()
        fireEvent.click(screen.getByRole('button', { name: 'Request App' }))
        fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))

        await waitFor(() =>
            expect(
                queryByText(
                    /Provide any relevant details such as app name, or app category/i,
                ),
            ).not.toBeInTheDocument(),
        )
    })

    it('should have the Submit Request button disabled without description', () => {
        render(<RequestApp />)
        fireEvent.click(screen.getByRole('button', { name: 'Request App' }))

        expect(
            screen.getByRole('button', { name: 'Submit Request' }),
        ).toBeAriaDisabled()
    })

    it('should have the Submit Request button enabled with description', () => {
        render(<RequestApp />)
        fireEvent.click(screen.getByRole('button', { name: 'Request App' }))
        fireEvent.change(screen.getByRole('textbox'), {
            target: { value: 'test' },
        })

        expect(
            screen.getByRole('button', { name: 'Submit Request' }),
        ).toBeAriaEnabled()
    })

    it('should send the request on Submit Request Click', async () => {
        const payload = { description: 'test' }
        const requestNewIntegration = jest
            .spyOn(client, 'requestNewIntegration')
            .mockReturnValue(new Promise((resolve) => resolve(payload)))

        const { queryByText } = render(<RequestApp />)

        expect(
            queryByText(
                /Provide any relevant details such as app name, or app category/i,
            ),
        ).not.toBeInTheDocument()
        fireEvent.click(screen.getByRole('button', { name: 'Request App' }))

        fireEvent.change(screen.getByRole('textbox'), {
            target: { value: 'test' },
        })

        fireEvent.click(screen.getByRole('button', { name: 'Submit Request' }))
        expect(requestNewIntegration).toHaveBeenCalledWith(payload)

        await waitFor(() => {
            const toast = screen.getByRole('status', {
                name: 'Thank you for your feedback!',
            })
            expect(toast).toHaveAttribute('data-intent', 'success')
        })
        await waitFor(() => {
            expect(
                queryByText(
                    /Provide any relevant details such as app name, or app category/i,
                ),
            ).not.toBeInTheDocument()
        })
    })

    it('should not send the request on Submit Request Click when error', async () => {
        const payload = { description: 'test' }
        const requestNewIntegration = jest
            .spyOn(client, 'requestNewIntegration')
            .mockReturnValue(new Promise((resolve, reject) => reject(payload)))

        const { queryByText } = render(<RequestApp />)

        expect(
            queryByText(
                /Provide any relevant details such as app name, or app category/i,
            ),
        ).not.toBeInTheDocument()
        fireEvent.click(screen.getByRole('button', { name: 'Request App' }))

        fireEvent.change(screen.getByRole('textbox'), {
            target: { value: 'test' },
        })

        fireEvent.click(screen.getByRole('button', { name: 'Submit Request' }))
        expect(requestNewIntegration).toHaveBeenCalledWith(payload)

        await waitFor(() => {
            const toast = screen.getByRole('status', {
                name: 'Uh oh! An error happened trying to save your request, please try again.',
            })
            expect(toast).toHaveAttribute('data-intent', 'destructive')
        })

        expect(
            queryByText(
                /Provide any relevant details such as app name, or app category/i,
            ),
        ).toBeInTheDocument()
    })
})
