import { screen, waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import { mockListBusinessHoursIntegrationsHandler } from '@gorgias/helpdesk-mocks'

import { renderWithQueryClientProvider } from 'tests/reactQueryTestingUtils'

import LinkedIntegrationsList from '../LinkedIntegrationsList'

const server = setupServer()

const notifyMock = {
    error: jest.fn(),
}

jest.mock('hooks/useNotify', () => ({
    useNotify: () => notifyMock,
}))

const mockHandler = mockListBusinessHoursIntegrationsHandler(async ({ data }) =>
    HttpResponse.json({
        ...data,
        meta: {
            next_cursor: 'next-cursor-123',
            prev_cursor: null,
            total_resources: 3,
        },
    }),
)

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

beforeEach(() => {
    server.use(mockHandler.handler)
})

afterEach(() => {
    server.resetHandlers()
})

afterAll(() => {
    server.close()
})

describe('LinkedIntegrationsList', () => {
    it('should render', async () => {
        renderWithQueryClientProvider(
            <LinkedIntegrationsList businessHoursId={1} />,
        )

        await waitFor(() => {
            expect(
                mockHandler.data.data.forEach((integration) => {
                    expect(
                        screen.getAllByText(integration.integration_name)
                            .length,
                    ).toBeGreaterThanOrEqual(1)
                }),
            )
        })
    })
})
