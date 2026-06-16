import { useEffect, useMemo, useState } from 'react'

import { DateAndTimeFormatting } from '@repo/utils'

import {
    DataTablePanel,
    DataTablePanelHeader,
    Text,
    toast,
} from '@gorgias/axiom'
import type { PaginationState } from '@gorgias/axiom'
import {
    MetricCardStatusEnum,
    useSearchMetricCards,
} from '@gorgias/helpdesk-queries'

import { getMetricsGlossaryColumns } from 'domains/reporting/pages/metrics-glossary/columns'
import { METRIC_CATEGORY_COLUMN_ID } from 'domains/reporting/pages/metrics-glossary/constants'
import type { MetricCategoryOption } from 'domains/reporting/pages/metrics-glossary/constants'
import { MetricCardDetailPanel } from 'domains/reporting/pages/metrics-glossary/MetricCardDetailPanel'
import { useGetDateAndTimeFormat } from 'hooks/useGetDateAndTimeFormat'

const DEFAULT_PAGINATION: PaginationState = {
    pageIndex: 0,
    pageSize: 50,
}

export function MetricsGlossary() {
    const [search, setSearch] = useState('')
    const [category, setCategory] = useState<string | undefined>()
    const [selectedSlug, setSelectedSlug] = useState<string | null>(null)

    const { data, isLoading, isError, errorUpdatedAt } = useSearchMetricCards({
        q: search || undefined,
        category,
        status: MetricCardStatusEnum.Published,
    })

    const metricCards = data?.data.data ?? []

    const datetimeFormat = useGetDateAndTimeFormat(
        DateAndTimeFormatting.RelativeDateAndTime,
    )
    const columns = useMemo(
        () => getMetricsGlossaryColumns(datetimeFormat),
        [datetimeFormat],
    )

    useEffect(() => {
        if (isError) {
            toast.error('Failed to load the metrics glossary')
        }
    }, [isError, errorUpdatedAt])

    return (
        <>
            <DataTablePanel
                flexDirection="column"
                w="100%"
                h="100%"
                minHeight={0}
                data={metricCards}
                columns={columns}
                isLoading={isLoading}
                // Semi-controlled (onChange, no `value`) so persisted search
                // rehydrates from the URL on reload; the value drives the
                // manual server-side `q` query param.
                search={{ enable: true, manual: true, onChange: setSearch }}
                filters={{
                    enable: true,
                    manual: true,
                    persist: false,
                    onChange: (values) => {
                        const selected = values[METRIC_CATEGORY_COLUMN_ID] as
                            | MetricCategoryOption
                            | undefined
                        setCategory(selected?.id)
                    },
                }}
                sorting={{ enable: true }}
                pagination={{ enable: true, defaultValue: DEFAULT_PAGINATION }}
                persistence={{ enable: true, id: 'metrics-glossary' }}
                onRowClick={(card) => setSelectedSlug(card.slug)}
                renderEmptyState={() => (
                    <Text color="content-neutral-secondary">
                        No metrics found.
                    </Text>
                )}
            >
                <DataTablePanelHeader title="Metrics glossary" />
            </DataTablePanel>

            <MetricCardDetailPanel
                slug={selectedSlug}
                isOpen={Boolean(selectedSlug)}
                onOpenChange={(open) => {
                    if (!open) {
                        setSelectedSlug(null)
                    }
                }}
            />
        </>
    )
}
