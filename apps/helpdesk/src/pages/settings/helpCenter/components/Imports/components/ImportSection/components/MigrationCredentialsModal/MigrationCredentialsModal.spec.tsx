import React from 'react'

import { render, userEvent } from '@repo/testing'
import { screen } from '@testing-library/react'
import { Map } from 'immutable'
import { noop } from '@gorgias/toolkit'
import { migrationProviders } from '../../fixtures/migration-providers'
import { MigrationCredentialsModal } from './MigrationCredentialsModal'

const provider = migrationProviders[0]
const credentials = {
    email: 'email@email.com',
    apiKey: 'api-key',
}

describe('<MigrationCredentialsModal />', () => {
    describe('renders correctly for each state', () => {
        test('basic', () => {
            render(
                <MigrationCredentialsModal
                    isOpen
                    onClose={noop}
                    isLoading={false}
                    onSubmit={noop}
                    provider={provider}
                />,
            )

            expect(screen.getByRole('dialog')).toBeInTheDocument()
            expect(screen.getByText('Setup migration')).toBeInTheDocument()
            expect(screen.getByLabelText(/Email/)).toBeInTheDocument()
            expect(screen.getByLabelText(/API Key/)).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: /Connect/ }),
            ).not.toBeDisabled()
        })
        test('loading', () => {
            render(
                <MigrationCredentialsModal
                    isOpen
                    onClose={noop}
                    isLoading
                    onSubmit={noop}
                    provider={provider}
                />,
            )

            expect(screen.getByRole('dialog')).toBeInTheDocument()
            expect(screen.getByText('Connecting')).toBeInTheDocument()
        })
        test('errors on fields', () => {
            render(
                <MigrationCredentialsModal
                    isOpen
                    onClose={noop}
                    isLoading={true}
                    onSubmit={noop}
                    provider={provider}
                    errors={Map({
                        email: ['This is not a valid email'],
                        api_key: ['The provided API key is outdated'],
                    })}
                />,
            )

            expect(screen.getByRole('dialog')).toBeInTheDocument()
            expect(
                screen.getByText('This is not a valid email'),
            ).toBeInTheDocument()
            expect(
                screen.getByText('The provided API key is outdated'),
            ).toBeInTheDocument()
        })
    })
    describe('submit handling', () => {
        it('should send valid fields value to submit handler', async () => {
            const submitHandler = jest.fn()

            render(
                <MigrationCredentialsModal
                    isOpen
                    onClose={noop}
                    isLoading={false}
                    onSubmit={submitHandler}
                    provider={provider}
                />,
            )

            const emailInput = screen.getByLabelText(/Email/)
            const apiKeyInput = screen.getByLabelText(/API Key/)
            const submitButton = screen.getByText('Connect')

            await userEvent.type(emailInput, credentials.email)
            await userEvent.type(apiKeyInput, credentials.apiKey)
            userEvent.click(submitButton)

            expect(submitHandler).toBeCalledWith(
                Map({
                    // [API field name]: field value
                    email: credentials.email,
                    api_key: credentials.apiKey,
                }),
            )
        })
        it('should not call sumbit handler when fields have no data', async () => {
            const submitHandler = jest.fn()

            render(
                <MigrationCredentialsModal
                    isOpen
                    onClose={noop}
                    isLoading={false}
                    onSubmit={submitHandler}
                    provider={provider}
                />,
            )

            const emailInput = screen.getByLabelText(/Email/)
            const submitButton = screen.getByText('Connect')

            await userEvent.type(emailInput, credentials.email)
            // I'm not typing the api key

            userEvent.click(submitButton)

            expect(submitHandler).not.toBeCalled()
        })
    })
})
