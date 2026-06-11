import { render } from '@repo/testing'
import { screen } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import { mockListTrackstarHandler } from '@gorgias/workflows-mocks'
import type { ListTrackstarConnectionsResponseItem } from '@gorgias/workflows-types'

import { StoreTrackstarContext } from '../StoreTrackstarContext'
import { StoreTrackstarProvider } from '../StoreTrackstarProvider'

const server = setupServer()

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

afterEach(() => {
    server.resetHandlers()
})

afterAll(() => {
    server.close()
})

const sandboxConnection: ListTrackstarConnectionsResponseItem = {
    account_id: 1,
    connection_id: 'sandbox_connection_id',
    error: false,
    integration_name: 'sandbox',
    store_name: 'acme',
    store_type: 'shopify',
}

describe('<StoreTrackstarProvider />', () => {
    it('should expose trackstar connections keyed by integration name', async () => {
        server.use(
            mockListTrackstarHandler(async () =>
                HttpResponse.json([sandboxConnection]),
            ).handler,
        )

        render(
            <StoreTrackstarProvider storeName="acme" storeType="shopify">
                <StoreTrackstarContext.Consumer>
                    {(contextValue) =>
                        `Trackstar integration: ${contextValue.connections.sandbox?.connection_id ?? 'none'}`
                    }
                </StoreTrackstarContext.Consumer>
            </StoreTrackstarProvider>,
        )

        expect(
            await screen.findByText(
                'Trackstar integration: sandbox_connection_id',
            ),
        ).toBeInTheDocument()
    })
})
