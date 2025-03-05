import React from 'react'

import { render, screen } from '@testing-library/react'
import { Route, StaticRouter } from 'react-router-dom'

import { IntegrationType, StoreIntegration } from 'models/integration/types'
import { useStoreSelector } from 'settings/automate'
import { assumeMock } from 'utils/testing'

import { BASE_PATH, FlowsSettings } from '../FlowsSettings'

jest.mock('settings/automate', () => ({
    ...jest.requireActual('settings/automate'),
    useStoreSelector: jest.fn(),
}))
const useStoreSelectorMock = assumeMock(useStoreSelector)

describe('FlowsSettings', () => {
    const integrations = [
        { id: 1, type: IntegrationType.Shopify, name: 'my-first-store' },
    ] as StoreIntegration[]

    let onChange: jest.Mock

    beforeEach(() => {
        onChange = jest.fn()
        useStoreSelectorMock.mockReturnValue({
            integrations,
            onChange,
            selected: undefined,
        })
    })

    it('should render the header', () => {
        render(
            <StaticRouter location={BASE_PATH}>
                <Route path={`${BASE_PATH}/:shopType?/:shopName?`}>
                    <FlowsSettings />
                </Route>
            </StaticRouter>,
        )
        expect(screen.getByText('Flows')).toBeInTheDocument()
    })

    it('should not render the navigation if no store is selected', () => {
        render(
            <StaticRouter location={BASE_PATH}>
                <Route path={`${BASE_PATH}/:shopType?/:shopName?`}>
                    <FlowsSettings />
                </Route>
            </StaticRouter>,
        )
        expect(screen.queryByText('Configuration')).not.toBeInTheDocument()
    })

    it('should render the navigation once a store has been selected', () => {
        useStoreSelectorMock.mockReturnValue({
            integrations,
            onChange,
            selected: integrations[0],
        })

        render(
            <StaticRouter location={`${BASE_PATH}/shopify/my-first-store`}>
                <Route path={`${BASE_PATH}/:shopType?/:shopName?`}>
                    <FlowsSettings />
                </Route>
            </StaticRouter>,
        )
        expect(screen.getByText('Configuration')).toBeInTheDocument()
    })

    it.each([
        ['Configuration', '', 'Configuration content.'],
        ['Channels', 'channels', 'Channels content.'],
    ])('should show content for %s', (__tabName, path, content) => {
        useStoreSelectorMock.mockReturnValue({
            integrations,
            onChange,
            selected: integrations[0],
        })

        render(
            <StaticRouter
                location={`${BASE_PATH}/shopify/my-first-store/${path}`}
            >
                <Route path={`${BASE_PATH}/:shopType?/:shopName?`}>
                    <FlowsSettings />
                </Route>
            </StaticRouter>,
        )
        expect(screen.getByText(content)).toBeInTheDocument()
    })
})
