import React from 'react'
import {fromJS} from 'immutable'
import {render, screen, waitFor} from '@testing-library/react'
import MockAdapter from 'axios-mock-adapter'
import configureMockStore from 'redux-mock-store'
import {Provider} from 'react-redux'
import thunk from 'redux-thunk'

import {
    basicMonthlyAutomationPrice,
    basicMonthlyHelpdeskPrice,
} from 'fixtures/productPrices'
import {AccountFeature} from 'state/currentAccount/types'
import {Integration, IntegrationType} from 'models/integration/types'
import client from 'models/api/resources'
import {List} from '../List'

const mockedServer = new MockAdapter(client)

const mockedIntegration = {id: 1, name: 'An integration'}

const mockedApp = {
    app_icon: '//ok.com/1.png',
    app_url: 'https://ok.com',
    headline: 'Some tagline here',
    id: 'someid',
    name: 'My test app',
}

const mockStore = configureMockStore([thunk])

mockedServer.onGet('/api/integrations/').reply(200, {data: [mockedIntegration]})
mockedServer.onGet('/api/apps/').reply(200, {data: [mockedApp]})

describe('<IntegrationsList />', () => {
    const minProps = {
        dispatch: jest.fn(),
        activeIntegrations: 0,
        maxIntegrations: 100,
        currentAccount: fromJS({}),
        integrations: [] as Integration[],
        integrationsList: [
            {
                type: IntegrationType.Http,
                title: 'an integration',
                description: 'this is a cool integration',
                image: 'ok.png',
                categories: [],
                count: 1,
            },
        ],
        features: {},
        helpdeskName: 'Pro',
        prices: [basicMonthlyHelpdeskPrice, basicMonthlyAutomationPrice],
        accountDomain: 'acme',
    }

    it('should display content', () => {
        const {container} = render(
            <Provider store={mockStore({})}>
                <List {...minProps} />
            </Provider>
        )

        expect(container.firstChild).toMatchSnapshot()
        expect(screen.queryByText('Loading additionnal Apps...'))
    })

    it('should fetch data and render a loaded app', async () => {
        mockedServer.resetHistory()
        render(
            <Provider store={mockStore({})}>
                <List {...minProps} />
            </Provider>
        )
        await waitFor(() => {
            expect(screen.queryByText(mockedApp.name)).toBeTruthy()
            expect(mockedServer.history.get.length).toBe(2)
        })
    })

    it('should display a limit warning', () => {
        render(
            <Provider store={mockStore({})}>
                <List
                    {...minProps}
                    activeIntegrations={2}
                    maxIntegrations={5}
                />
            </Provider>
        )

        expect(screen.queryByText(/Need more\?/i)).toBeTruthy()
    })

    it('should add the required plan name', () => {
        render(
            <Provider store={mockStore({})}>
                <List
                    {...minProps}
                    integrationsList={[
                        ...minProps.integrationsList,
                        {
                            type: IntegrationType.Twitter,
                            title: 'an integration',
                            description: 'this is a cool integration',
                            image: 'ok.png',
                            count: 1,
                            categories: [],
                            requiredFeature: AccountFeature.TwitterIntegration,
                        },
                    ]}
                />
            </Provider>
        )

        expect(screen.queryByText(/upgrade/i)).toBeTruthy()
    })

    describe('SMS integrations feature flag', () => {
        const smsMinProps = {
            ...minProps,
            integrationsList: [
                {
                    type: IntegrationType.Sms,
                    title: 'SMS',
                    description: 'this is a cool integration',
                    image: 'ok.png',
                    categories: [],
                    count: 1,
                },
            ],
        }

        it('should include SMS tile SMS preview accounts', () => {
            const props = {
                ...smsMinProps,
                currentAccount: fromJS({
                    domain: 'acme',
                }),
            }
            const {container, queryByText} = render(
                <Provider store={mockStore({})}>
                    <List {...props} />
                </Provider>
            )

            expect(queryByText('SMS')).not.toBeFalsy()
            expect(container.firstChild).toMatchSnapshot()
        })

        it('should not include SMS tile for all other accounts', () => {
            const {container, queryByText} = render(
                <Provider store={mockStore({})}>
                    <List {...minProps} />
                </Provider>
            )

            expect(queryByText('SMS')).toBeFalsy()
            expect(container.firstChild).toMatchSnapshot()
        })
    })
})
