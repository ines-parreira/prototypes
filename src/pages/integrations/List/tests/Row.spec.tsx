import {render, screen} from '@testing-library/react'
import React from 'react'
import configureMockStore from 'redux-mock-store'
import {Provider} from 'react-redux'
import thunk from 'redux-thunk'

import {IntegrationType} from 'models/integration/constants'
import {AppListItem} from 'models/integration/types/app'
import Row from '../Row'

const mockStore = configureMockStore([thunk])
const store = mockStore({})

describe('IntegrationsListRow', () => {
    it('should display the integration row as a link', () => {
        const integration = {
            type: IntegrationType.Http,
            title: 'an integration',
            description: 'this is a cool integration',
            image: 'ok.png',
            count: 1,
        }

        const {container} = render(
            <Provider store={store}>
                <Row integration={integration} />
            </Provider>
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should display an external integration', () => {
        const integration: AppListItem = {
            type: IntegrationType.App,
            isConnected: false,
            grantedScopes: [],
            title: 'an integration',
            description: 'this is a cool integration',
            appId: '420',
            image: 'ok.png',
        }

        const {container} = render(
            <Provider store={store}>
                <Row integration={integration} />
            </Provider>
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should display an external integration with a connected badge', () => {
        const integration: AppListItem = {
            type: IntegrationType.App,
            isConnected: true,
            grantedScopes: ['write:all'],
            title: 'an integration',
            description: 'this is a cool integration',
            appId: '420',
            image: 'ok.png',
        }

        render(
            <Provider store={store}>
                <Row integration={integration} />
            </Provider>
        )
        expect(screen.queryByText('Connected')).toBeTruthy()
    })

    it('should display an integration with upgrade requirement', () => {
        const integration = {
            type: IntegrationType.Twitter,
            title: 'an integration',
            description: 'this is a cool integration',
            requiredPlanName: 'Basic',
            image: 'ok.png',
            count: 0,
        }

        const {container} = render(
            <Provider store={store}>
                <Row integration={integration} />
            </Provider>
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should open the list of connections for Shopify and BigCommerce when connections exist', () => {
        const integration = {
            type: IntegrationType.Shopify,
            title: 'Shopify',
            description: '',
            image: 'ok.png',
            count: 2,
        }

        const {container} = render(
            <Provider store={store}>
                <Row integration={integration} />
            </Provider>
        )

        expect(container.querySelector('a')?.getAttribute('to')).toBe(
            '/app/settings/integrations/shopify/connections'
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should open the list of integrations for Voice and SMS when integrations exist', () => {
        const integration = {
            type: IntegrationType.Phone,
            title: 'Shopify',
            description: '',
            image: 'ok.png',
            count: 2,
        }

        const {container} = render(
            <Provider store={store}>
                <Row integration={integration} />
            </Provider>
        )

        expect(container.querySelector('a')?.getAttribute('to')).toBe(
            '/app/settings/integrations/phone'
        )
        expect(container.firstChild).toMatchSnapshot()
    })
})
