import { NOT_AVAILABLE_PLACEHOLDER } from '@repo/reporting'
import { render } from '@repo/testing'
import { screen } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import {
    mockListSlaPoliciesHandler,
    mockListSlaPoliciesResponse,
} from '@gorgias/helpdesk-mocks'

import {
    TicketSLADimension,
    TicketSLAStatus,
} from 'domains/reporting/models/cubes/sla/TicketSLACube'
import { SlaPolicyNameCell } from 'domains/reporting/pages/sla/components/SlaPolicyNameCell'

const server = setupServer()

const basePolicy = {
    archived_datetime: null,
    created_datetime: '2024-01-01T00:00:00Z',
    deactivated_datetime: null,
    metrics: [],
    target_channels: [],
    updated_datetime: '2024-01-01T00:00:00Z',
    version: 1,
    priority: '0.5',
    business_hours_only: false,
}

const policyA = { ...basePolicy, uuid: 'uuid-a', name: 'Policy Alpha' }
const policyB = { ...basePolicy, uuid: 'uuid-b', name: 'Policy Beta' }

const mockSlaPolicies = (policies: Array<typeof policyA>) =>
    mockListSlaPoliciesHandler(async () =>
        HttpResponse.json(mockListSlaPoliciesResponse({ data: policies })),
    ).handler

const makeSlaItem = (uuid: string) => ({
    [TicketSLADimension.SlaPolicyUuid]: uuid,
    [TicketSLADimension.SlaPolicyMetricName]: 'First Response Time',
    [TicketSLADimension.SlaPolicyMetricStatus]: TicketSLAStatus.Satisfied,
    [TicketSLADimension.SlaDelta]: -60,
    [TicketSLADimension.SlaStatus]: TicketSLAStatus.Satisfied,
})

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

beforeEach(() => {
    server.use(mockSlaPolicies([policyA, policyB]))
})

afterEach(() => {
    server.resetHandlers()
})

afterAll(() => {
    server.close()
})

describe('SlaPolicyNameCell', () => {
    it('renders the policy name when the UUID matches a known policy', async () => {
        render(<SlaPolicyNameCell item={{ sla1: makeSlaItem('uuid-a') }} />)

        expect(await screen.findByText('Policy Alpha')).toBeInTheDocument()
    })

    it('renders multiple policy names comma-separated when items have different UUIDs', async () => {
        render(
            <SlaPolicyNameCell
                item={{
                    sla1: makeSlaItem('uuid-a'),
                    sla2: makeSlaItem('uuid-b'),
                }}
            />,
        )

        expect(
            await screen.findByText('Policy Alpha, Policy Beta'),
        ).toBeInTheDocument()
    })

    it('deduplicates UUIDs and shows each policy name only once', async () => {
        render(
            <SlaPolicyNameCell
                item={{
                    sla1: makeSlaItem('uuid-a'),
                    sla2: makeSlaItem('uuid-a'),
                }}
            />,
        )

        expect(await screen.findByText('Policy Alpha')).toBeInTheDocument()
        expect(screen.queryAllByText('Policy Alpha').length).toBe(1)
    })

    it('renders N/A placeholder when no policies are returned', async () => {
        server.use(mockSlaPolicies([]))

        render(<SlaPolicyNameCell item={{ sla1: makeSlaItem('uuid-a') }} />)

        expect(
            await screen.findByText(NOT_AVAILABLE_PLACEHOLDER),
        ).toBeInTheDocument()
    })

    it('renders N/A placeholder when no UUID matches a known policy', async () => {
        render(
            <SlaPolicyNameCell item={{ sla1: makeSlaItem('uuid-unknown') }} />,
        )

        expect(
            await screen.findByText(NOT_AVAILABLE_PLACEHOLDER),
        ).toBeInTheDocument()
    })

    it('renders only matched names when some UUIDs have no matching policy', async () => {
        render(
            <SlaPolicyNameCell
                item={{
                    sla1: makeSlaItem('uuid-a'),
                    sla2: makeSlaItem('uuid-unknown'),
                }}
            />,
        )

        expect(await screen.findByText('Policy Alpha')).toBeInTheDocument()
        expect(screen.queryByText('uuid-unknown')).not.toBeInTheDocument()
    })

    it('renders N/A placeholder when policies data is unavailable', () => {
        server.use(
            mockListSlaPoliciesHandler(async () => {
                await new Promise(() => undefined)

                return HttpResponse.json(
                    mockListSlaPoliciesResponse({ data: [] }),
                )
            }).handler,
        )

        render(<SlaPolicyNameCell item={{ sla1: makeSlaItem('uuid-a') }} />)

        expect(screen.getByText(NOT_AVAILABLE_PLACEHOLDER)).toBeInTheDocument()
    })
})
