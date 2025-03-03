import React from 'react'

import { render, screen } from '@testing-library/react'
import { Route, StaticRouter } from 'react-router-dom'

import { IntegrationType, StoreIntegration } from 'models/integration/types'
import { assumeMock } from 'utils/testing'

import { BASE_PATH, useAutomateSettings } from '../../hooks/useAutomateSettings'
import { AutomateSettings } from '../AutomateSettings'

jest.mock('../../hooks/useAutomateSettings', () => ({
    BASE_PATH: '/app/settings/automate',
    useAutomateSettings: jest.fn(),
}))
const useAutomateSettingsMock = assumeMock(useAutomateSettings)

describe('AutomateSettings', () => {
    const integrations = [
        { id: 1, type: IntegrationType.Shopify, name: 'my-first-store' },
    ] as StoreIntegration[]

    let onChangeIntegration: jest.Mock

    beforeEach(() => {
        onChangeIntegration = jest.fn()
        useAutomateSettingsMock.mockReturnValue({
            integrations,
            onChangeIntegration,
            selected: undefined,
        })
    })

    it('should render the header', () => {
        render(
            <StaticRouter location={BASE_PATH}>
                <Route path={`${BASE_PATH}/:shopType?/:shopName?`}>
                    <AutomateSettings />
                </Route>
            </StaticRouter>,
        )
        expect(screen.getByText('Automate')).toBeInTheDocument()
    })

    it('should not render the navigation if no store is selected', () => {
        render(
            <StaticRouter location={BASE_PATH}>
                <Route path={`${BASE_PATH}/:shopType?/:shopName?`}>
                    <AutomateSettings />
                </Route>
            </StaticRouter>,
        )
        expect(screen.queryByText('Order Management')).not.toBeInTheDocument()
    })

    it('should render the navigation once a store has been selected', () => {
        useAutomateSettingsMock.mockReturnValue({
            integrations,
            onChangeIntegration,
            selected: integrations[0],
        })

        render(
            <StaticRouter location={`${BASE_PATH}/shopify/my-first-store`}>
                <Route path={`${BASE_PATH}/:shopType?/:shopName?`}>
                    <AutomateSettings />
                </Route>
            </StaticRouter>,
        )
        expect(screen.getByText('Order Management')).toBeInTheDocument()
    })

    it.each([
        ['Flows', 'flows', 'Flows content.'],
        ['Order Management', 'order-management', 'Order management content.'],
        [
            'Article Recommendations',
            'article-recommendations',
            'Article recommendations content.',
        ],
        ['Channels', 'channels', 'Channels content.'],
    ])('should show content for %s', (__tabName, path, content) => {
        useAutomateSettingsMock.mockReturnValue({
            integrations,
            onChangeIntegration,
            selected: integrations[0],
        })

        render(
            <StaticRouter
                location={`${BASE_PATH}/shopify/my-first-store/${path}`}
            >
                <Route path={`${BASE_PATH}/:shopType?/:shopName?`}>
                    <AutomateSettings />
                </Route>
            </StaticRouter>,
        )
        expect(screen.getByText(content)).toBeInTheDocument()
    })
})
