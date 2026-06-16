import type { TransformedArticle } from '../../types'
import { COLUMN_IDS, getColumns } from './columns'

const dateRange = {
    start_datetime: '2026-04-01T00:00:00.000Z',
    end_datetime: '2026-04-28T23:59:59.999Z',
}

const buildParams = (
    overrides: Partial<Parameters<typeof getColumns>[0]> = {},
): Parameters<typeof getColumns>[0] => ({
    statsDisplayMode: 'numeric',
    metricsDateRange: dateRange,
    isMetricsLoading: false,
    shopIntegrationId: 999,
    totalAiAgentTickets: 100,
    availableActions: [],
    ...overrides,
})

const idsOf = (cols: ReturnType<typeof getColumns>) => cols.map((c) => c.id)

const headerLabel = (
    cols: ReturnType<typeof getColumns>,
    id: string,
): string | undefined => {
    const col = cols.find((c) => c.id === id)
    if (!col || typeof col.header !== 'function') return undefined
    const headerInfo = {
        column: { getIsSorted: () => false as const },
    } as Parameters<NonNullable<typeof col.header>>[0]
    const rendered = col.header(headerInfo) as { props?: { label?: string } }
    return rendered?.props?.label
}

describe('getColumns', () => {
    describe('with the new reporting layer flag OFF', () => {
        const cols = getColumns(
            buildParams({ isNewReportingLayerEnabled: false }),
        )

        it('omits the Success rate column', () => {
            expect(idsOf(cols)).not.toContain(COLUMN_IDS.SUCCESS_RATE)
        })

        it('orders columns as Name, Intents, Ticket volume, Handover, Average CSAT, Status', () => {
            expect(idsOf(cols)).toEqual([
                COLUMN_IDS.NAME,
                COLUMN_IDS.INTENTS,
                COLUMN_IDS.TICKET_VOLUME,
                COLUMN_IDS.HANDOVER,
                COLUMN_IDS.AVERAGE_CSAT,
                COLUMN_IDS.STATUS,
            ])
        })

        it('uses the legacy header labels Ticket volume / Handover / Average CSAT', () => {
            expect(headerLabel(cols, COLUMN_IDS.TICKET_VOLUME)).toBe(
                'Ticket volume',
            )
            expect(headerLabel(cols, COLUMN_IDS.HANDOVER)).toBe('Handover')
            expect(headerLabel(cols, COLUMN_IDS.AVERAGE_CSAT)).toBe(
                'Average CSAT',
            )
        })
    })

    describe('with the new reporting layer flag ON', () => {
        const cols = getColumns(
            buildParams({ isNewReportingLayerEnabled: true }),
        )

        it('includes the Success rate column between Intents and Ticket volume', () => {
            const ids = idsOf(cols)
            const intentsIndex = ids.indexOf(COLUMN_IDS.INTENTS)
            const successRateIndex = ids.indexOf(COLUMN_IDS.SUCCESS_RATE)
            const ticketVolumeIndex = ids.indexOf(COLUMN_IDS.TICKET_VOLUME)

            expect(successRateIndex).toBe(intentsIndex + 1)
            expect(ticketVolumeIndex).toBe(successRateIndex + 1)
        })

        it('renames Ticket volume → Tickets, Handover → Handovers, Average CSAT → CSAT', () => {
            expect(headerLabel(cols, COLUMN_IDS.TICKET_VOLUME)).toBe('Tickets')
            expect(headerLabel(cols, COLUMN_IDS.HANDOVER)).toBe('Handovers')
            expect(headerLabel(cols, COLUMN_IDS.AVERAGE_CSAT)).toBe('CSAT')
        })

        it('exposes the new column under the canonical id', () => {
            expect(idsOf(cols)).toContain(COLUMN_IDS.SUCCESS_RATE)
        })
    })

    it('keeps the Status column at the end regardless of the flag', () => {
        const off = getColumns(
            buildParams({ isNewReportingLayerEnabled: false }),
        )
        const on = getColumns(buildParams({ isNewReportingLayerEnabled: true }))

        expect(off[off.length - 1].id).toBe(COLUMN_IDS.STATUS)
        expect(on[on.length - 1].id).toBe(COLUMN_IDS.STATUS)
    })

    it('Success rate cell renders -- when metrics are unavailable for the row', () => {
        const cols = getColumns(
            buildParams({ isNewReportingLayerEnabled: true }),
        )
        const successCol = cols.find((c) => c.id === COLUMN_IDS.SUCCESS_RATE)
        expect(successCol).toBeDefined()
        if (!successCol || typeof successCol.cell !== 'function') return

        const article: Partial<TransformedArticle> = {
            id: 42,
            title: 'Refund policy',
            metrics: undefined,
        }
        const cellInfo = {
            row: { original: article as TransformedArticle },
        } as Parameters<NonNullable<typeof successCol.cell>>[0]

        const rendered = successCol.cell(cellInfo) as {
            props?: { children?: string }
        }
        expect(rendered?.props?.children).toBe('--')
    })
})
