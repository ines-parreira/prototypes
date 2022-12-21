import React from 'react'

import {fromJS} from 'immutable'
import {render, waitFor} from '@testing-library/react'

import {Provider} from 'react-redux'
import {MemoryRouter} from 'react-router-dom'
import configureMockStore from 'redux-mock-store'

import EmailIntegrationList from '../EmailIntegrationList.tsx'
import {fetchEmailDomains} from '../resources.ts'
import {IntegrationType} from '../../../../../../models/integration/constants.ts'

import {EmailProvider} from 'models/integration/constants'

import {renderWithRouter} from 'utils/testing'

jest.mock('../resources.ts')

describe('<EmailIntegrationList/>', () => {
    function getEmailIntegration(id) {
        return {
            id,
            type: IntegrationType.Email,
            name: `My Email Integration ${id}`,
            meta: {
                address: 'email@gorgias-test.com',
            },
        }
    }
    function getGmailIntegration(id, sendingEnabled) {
        return {
            id,
            type: IntegrationType.Gmail,
            name: `My GMail Integration ${id}`,
            meta: {
                address: 'email@gmail.com',
                enable_gmail_sending: sendingEnabled,
            },
        }
    }

    const store = configureMockStore()({})
    const commonProps = {
        integrations: fromJS([getEmailIntegration(1)]),
        loading: fromJS({}),
        gmailRedirectUri: '',
        outlookRedirectUri: '',
    }

    beforeEach(() => {
        jest.resetAllMocks()
    })

    describe('render()', () => {
        it('should render the page with a warning when the domain is not verified', async () => {
            const get = fetchEmailDomains.mockResolvedValueOnce([])

            const {container} = render(
                <Provider store={store}>
                    <EmailIntegrationList {...commonProps} />
                </Provider>,
                {wrapper: MemoryRouter}
            )
            await waitFor(() => expect(get).toHaveBeenCalledTimes(1))

            expect(container).toMatchSnapshot()
        })

        it('should render the page when there are no integrations', async () => {
            const get = fetchEmailDomains.mockResolvedValueOnce([])

            const {container} = render(
                <Provider store={store}>
                    <EmailIntegrationList
                        {...commonProps}
                        integrations={fromJS([])}
                    />
                </Provider>,
                {wrapper: MemoryRouter}
            )
            await waitFor(() => expect(get).toHaveBeenCalledTimes(1))

            expect(container).toMatchSnapshot()
        })

        it('should render the page without warning when the email is verified', async () => {
            const get = fetchEmailDomains.mockResolvedValueOnce([
                {
                    name: 'gorgias-test.com',
                    verified: true,
                },
            ])

            const {container} = render(
                <Provider store={store}>
                    <EmailIntegrationList {...commonProps} />
                </Provider>,
                {wrapper: MemoryRouter}
            )
            await waitFor(() => expect(get).toHaveBeenCalledTimes(1))

            expect(container).toMatchSnapshot()
        })

        it('should render the page with a warning when a GMail integration has sending disabled', async () => {
            const get = fetchEmailDomains.mockResolvedValueOnce([])

            const {container} = render(
                <Provider store={store}>
                    <EmailIntegrationList
                        {...commonProps}
                        integrations={fromJS([getGmailIntegration(1, false)])}
                    />
                </Provider>,
                {wrapper: MemoryRouter}
            )
            await waitFor(() => expect(get).toHaveBeenCalledTimes(1))

            expect(container).toMatchSnapshot()
        })

        it('should render the page without warning when a GMail integration has sending enabled', async () => {
            const get = fetchEmailDomains.mockResolvedValueOnce([])

            const {container} = render(
                <Provider store={store}>
                    <EmailIntegrationList
                        {...commonProps}
                        integrations={fromJS([getGmailIntegration(1, true)])}
                    />
                </Provider>,
                {wrapper: MemoryRouter}
            )
            await waitFor(() => expect(get).toHaveBeenCalledTimes(1))

            expect(container).toMatchSnapshot()
        })

        it('should redirect to preferences tab when provider is not Sendgrid', async () => {
            fetchEmailDomains.mockResolvedValueOnce([])
            const integration = getEmailIntegration(1)

            const component = renderWithRouter(
                <Provider store={store}>
                    <EmailIntegrationList
                        {...commonProps}
                        integrations={fromJS([integration])}
                    />
                </Provider>
            )

            await component.findByTestId('integration-link')
            expect(
                component.getByTestId('integration-link').getAttribute('to')
            ).toBe(`/app/settings/channels/email/${integration.id}`)
        })

        it('should redirect to domain settings tab when provider is Sendgrid', async () => {
            fetchEmailDomains.mockResolvedValueOnce([])
            const integration = getEmailIntegration(1)
            integration.meta.provider = EmailProvider.Sendgrid

            const component = renderWithRouter(
                <Provider store={store}>
                    <EmailIntegrationList
                        {...commonProps}
                        integrations={fromJS([integration])}
                    />
                </Provider>
            )

            await component.findByTestId('integration-link')
            expect(
                component.getByTestId('integration-link').getAttribute('to')
            ).toBe(`/app/settings/channels/email/${integration.id}/dns`)
        })
    })
})
