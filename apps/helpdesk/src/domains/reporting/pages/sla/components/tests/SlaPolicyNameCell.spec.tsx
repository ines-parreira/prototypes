import { NOT_AVAILABLE_PLACEHOLDER } from '@repo/reporting'
import { assumeMock, render } from '@repo/testing'
import { screen } from '@testing-library/react'

import { useListSlaPolicies } from '@gorgias/helpdesk-queries'

import {
    TicketSLADimension,
    TicketSLAStatus,
} from 'domains/reporting/models/cubes/sla/TicketSLACube'
import { SlaPolicyNameCell } from 'domains/reporting/pages/sla/components/SlaPolicyNameCell'

jest.mock('@gorgias/helpdesk-queries')
const useListSlaPoliciesMock = assumeMock(useListSlaPolicies)

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

const makeSlaItem = (uuid: string) => ({
    [TicketSLADimension.SlaPolicyUuid]: uuid,
    [TicketSLADimension.SlaPolicyMetricName]: 'First Response Time',
    [TicketSLADimension.SlaPolicyMetricStatus]: TicketSLAStatus.Satisfied,
    [TicketSLADimension.SlaDelta]: -60,
    [TicketSLADimension.SlaStatus]: TicketSLAStatus.Satisfied,
})

describe('SlaPolicyNameCell', () => {
    beforeEach(() => {
        useListSlaPoliciesMock.mockReturnValue({
            data: { data: { data: [policyA, policyB] } },
        } as any)
    })

    it('renders the policy name when the UUID matches a known policy', () => {
        render(<SlaPolicyNameCell item={{ sla1: makeSlaItem('uuid-a') }} />)

        expect(screen.getByText('Policy Alpha')).toBeInTheDocument()
    })

    it('renders multiple policy names comma-separated when items have different UUIDs', () => {
        render(
            <SlaPolicyNameCell
                item={{
                    sla1: makeSlaItem('uuid-a'),
                    sla2: makeSlaItem('uuid-b'),
                }}
            />,
        )

        expect(
            screen.getByText('Policy Alpha, Policy Beta'),
        ).toBeInTheDocument()
    })

    it('deduplicates UUIDs and shows each policy name only once', () => {
        render(
            <SlaPolicyNameCell
                item={{
                    sla1: makeSlaItem('uuid-a'),
                    sla2: makeSlaItem('uuid-a'),
                }}
            />,
        )

        expect(screen.getByText('Policy Alpha')).toBeInTheDocument()
        expect(screen.queryAllByText('Policy Alpha').length).toBe(1)
    })

    it('renders N/A placeholder when no policies are returned', () => {
        useListSlaPoliciesMock.mockReturnValue({
            data: { data: { data: [] } },
        } as any)

        render(<SlaPolicyNameCell item={{ sla1: makeSlaItem('uuid-a') }} />)

        expect(screen.getByText(NOT_AVAILABLE_PLACEHOLDER)).toBeInTheDocument()
    })

    it('renders N/A placeholder when no UUID matches a known policy', () => {
        render(
            <SlaPolicyNameCell item={{ sla1: makeSlaItem('uuid-unknown') }} />,
        )

        expect(screen.getByText(NOT_AVAILABLE_PLACEHOLDER)).toBeInTheDocument()
    })

    it('renders only matched names when some UUIDs have no matching policy', () => {
        render(
            <SlaPolicyNameCell
                item={{
                    sla1: makeSlaItem('uuid-a'),
                    sla2: makeSlaItem('uuid-unknown'),
                }}
            />,
        )

        expect(screen.getByText('Policy Alpha')).toBeInTheDocument()
        expect(screen.queryByText('uuid-unknown')).not.toBeInTheDocument()
    })

    it('renders N/A placeholder when policies data is unavailable', () => {
        useListSlaPoliciesMock.mockReturnValue({
            data: undefined,
        } as any)

        render(<SlaPolicyNameCell item={{ sla1: makeSlaItem('uuid-a') }} />)

        expect(screen.getByText(NOT_AVAILABLE_PLACEHOLDER)).toBeInTheDocument()
    })
})
