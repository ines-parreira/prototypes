import React from 'react'

import { render } from '@repo/testing'
import { screen } from '@testing-library/react'

import { JourneyCampaignStateEnum } from '@gorgias/convert-client'

import {
    DEFAULT_TABLE_METRICS,
    LOADING_TABLE_METRICS,
} from '../../hooks/useAIJourneyTableKpis/useAIJourneyTableKpis'
import type { TableRow } from '../../pages/Campaigns/Campaigns'
import { columns } from './Columns'

jest.mock('@gorgias/axiom', () => ({
    ...jest.requireActual('@gorgias/axiom'),
    Tooltip: ({
        trigger,
        children,
    }: {
        trigger: React.ReactNode
        children: React.ReactNode
    }) => (
        <>
            {trigger}
            {children}
        </>
    ),
    TooltipContent: ({ title }: { title?: React.ReactNode }) => (
        <div role="tooltip">{title}</div>
    ),
}))

const baseRow: TableRow = {
    id: '1',
    account_id: 1,
    created_datetime: '2025-07-04T12:24:29.121874',
    state: 'active',
    store_integration_id: 2,
    store_name: 'test-store',
    store_type: 'shopify',
    type: 'campaign',
    metrics: DEFAULT_TABLE_METRICS,
} as unknown as TableRow

const statusColumn = columns[1] as (typeof columns)[1] & {
    cell: (info: any) => React.ReactNode
}

const renderStatusCell = (row: TableRow) => {
    const cell = statusColumn.cell as (info: any) => React.ReactNode
    return render(<>{cell({ row: { original: row } })}</>)
}

describe('Columns - Status cell', () => {
    it('renders the Scheduled badge with a tooltip showing the scheduled date/time', () => {
        renderStatusCell({
            ...baseRow,
            campaign: {
                title: 'Birthday campaign',
                state: JourneyCampaignStateEnum.Scheduled,
                has_included_audiences: true,
                scheduled_datetime: '2026-06-15T11:30:00',
            },
        } as TableRow)

        expect(screen.getByText('Scheduled')).toBeInTheDocument()
        expect(screen.getByRole('tooltip')).toHaveTextContent(
            /Jun 15, 2026 at \d{1,2}:\d{2} (AM|PM)/,
        )
    })

    it('renders the Scheduled badge without a tooltip when scheduled_datetime is missing', () => {
        renderStatusCell({
            ...baseRow,
            campaign: {
                title: 'Birthday campaign',
                state: JourneyCampaignStateEnum.Scheduled,
                has_included_audiences: true,
            },
        } as TableRow)

        expect(screen.getByText('Scheduled')).toBeInTheDocument()
        expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
    })

    it('renders a "No audience" hint next to the Draft badge when audiences are missing', () => {
        renderStatusCell({
            ...baseRow,
            campaign: {
                title: 'Birthday campaign',
                state: JourneyCampaignStateEnum.Draft,
                has_included_audiences: false,
            },
        } as TableRow)

        expect(screen.getByText('Draft')).toBeInTheDocument()
        expect(screen.getByText('No audience')).toBeInTheDocument()
    })

    it('does not render a tooltip or "No audience" hint for non-Scheduled, non-Draft states', () => {
        renderStatusCell({
            ...baseRow,
            campaign: {
                title: 'Birthday campaign',
                state: JourneyCampaignStateEnum.Sent,
                has_included_audiences: true,
                scheduled_datetime: '2026-06-15T11:30:00',
            },
        } as TableRow)

        expect(screen.getByText('Delivered')).toBeInTheDocument()
        expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
        expect(screen.queryByText('No audience')).not.toBeInTheDocument()
    })

    it('renders without crashing when the row has no campaign', () => {
        renderStatusCell({
            ...baseRow,
            campaign: undefined,
            metrics: LOADING_TABLE_METRICS,
        } as unknown as TableRow)

        expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
        expect(screen.queryByText('No audience')).not.toBeInTheDocument()
    })
})
