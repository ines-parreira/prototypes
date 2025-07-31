import React from 'react'

import { userEvent } from '@repo/testing'
import { render, screen } from '@testing-library/react'
import { Map } from 'immutable'
import { noop } from 'lodash'

import { migrationProviders } from '../../fixtures/migration-providers'
import MigrationCredentialsModal from './MigrationCredentialsModal'

const provider = migrationProviders[0]
const credentials = {
    email: 'email@email.com',
    apiKey: 'api-key',
}

describe('<MigrationCredentialsModal />', () => {
    describe('snapshots', () => {
        test('basic', () => {
            const { baseElement } = render(
                <MigrationCredentialsModal
                    isOpen
                    onClose={noop}
                    isLoading={false}
                    onSubmit={noop}
                    provider={provider}
                />,
            )

            expect(baseElement).toMatchSnapshot()
        })
        test('loading', () => {
            const { baseElement } = render(
                <MigrationCredentialsModal
                    isOpen
                    onClose={noop}
                    isLoading
                    onSubmit={noop}
                    provider={provider}
                />,
            )

            expect(baseElement).toMatchSnapshot()
        })
        test('errors on fields', () => {
            const { baseElement } = render(
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

            expect(baseElement).toMatchSnapshot()
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
