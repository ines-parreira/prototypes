import { screen } from '@testing-library/react'
import { setupServer } from 'msw/node'

import { mockExecuteActionHandler } from '@gorgias/helpdesk-mocks'

import {
    render,
    testAppQueryClient,
} from '../../../../../../../tests/render.utils'
import type { ButtonAction, ButtonConfig } from '../../utils/customActionTypes'
import { ActionButton } from '../ActionButton'
import { TemplateResolverProvider } from '../TemplateResolverContext'

const server = setupServer()

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

afterEach(() => {
    server.resetHandlers()
    testAppQueryClient.clear()
})

afterAll(() => {
    server.close()
})

const makeAction = (overrides: Partial<ButtonAction> = {}): ButtonAction => ({
    method: 'POST',
    url: 'https://api.example.com/action',
    headers: [],
    params: [],
    body: {
        contentType: 'application/json',
        'application/json': {},
        'application/x-www-form-urlencoded': [],
    },
    ...overrides,
})

const makeConfig = ({
    action,
    ...rest
}: Partial<Omit<ButtonConfig, 'action'>> & {
    action?: Partial<ButtonAction>
} = {}): ButtonConfig => ({
    label: 'Test Action',
    ...rest,
    action: makeAction(action),
})

describe('ActionButton', () => {
    it('resolves template variables in params', async () => {
        const executeActionMock = mockExecuteActionHandler()
        server.use(executeActionMock.handler)
        const waitForRequest = executeActionMock.waitForRequest(server)

        const config = makeConfig({
            action: {
                params: [
                    { id: '1', key: 'customer_id', value: '{{customer.id}}' },
                    { id: '2', key: 'name', value: '{{customer.name}}' },
                ],
            },
        })

        const { user } = render(
            <TemplateResolverProvider customer={{ id: '42', name: 'Alice' }}>
                <ActionButton
                    config={config}
                    integrationId={1}
                    customerId={42}
                    ticketId="100"
                />
            </TemplateResolverProvider>,
        )

        await user.click(screen.getByRole('button', { name: /test action/i }))

        await waitForRequest(async (request) => {
            const body = await request.json()
            expect(body.payload.params).toEqual({
                customer_id: '42',
                name: 'Alice',
            })
        })
    })

    it('resolves template variables in form-urlencoded body', async () => {
        const executeActionMock = mockExecuteActionHandler()
        server.use(executeActionMock.handler)
        const waitForRequest = executeActionMock.waitForRequest(server)

        const config = makeConfig({
            action: {
                body: {
                    contentType: 'application/x-www-form-urlencoded',
                    'application/json': {},
                    'application/x-www-form-urlencoded': [
                        {
                            id: '1',
                            key: 'email',
                            value: '{{customer.email}}',
                        },
                        { id: '2', key: 'ref', value: '{{customer.id}}' },
                    ],
                },
            },
        })

        const { user } = render(
            <TemplateResolverProvider
                customer={{ id: '99', email: 'alice@test.com' }}
            >
                <ActionButton
                    config={config}
                    integrationId={1}
                    customerId={42}
                    ticketId="100"
                />
            </TemplateResolverProvider>,
        )

        await user.click(screen.getByRole('button', { name: /test action/i }))

        await waitForRequest(async (request) => {
            const body = await request.json()
            expect(body.payload.form).toEqual({
                email: 'alice@test.com',
                ref: '99',
            })
        })
    })

    it('returns original json when resolved template produces invalid JSON', async () => {
        const executeActionMock = mockExecuteActionHandler()
        server.use(executeActionMock.handler)
        const waitForRequest = executeActionMock.waitForRequest(server)

        const config = makeConfig({
            action: {
                body: {
                    contentType: 'application/json',
                    'application/json': {
                        query: '{{customer.missing}}',
                    },
                    'application/x-www-form-urlencoded': [],
                },
            },
        })

        const { user } = render(
            <TemplateResolverProvider customer={{}}>
                <ActionButton
                    config={config}
                    integrationId={1}
                    customerId={42}
                    ticketId="100"
                />
            </TemplateResolverProvider>,
        )

        await user.click(screen.getByRole('button', { name: /test action/i }))

        await waitForRequest(async (request) => {
            const body = await request.json()
            expect(body.payload.json).toEqual({ query: '{{customer.missing}}' })
        })
    })
})
