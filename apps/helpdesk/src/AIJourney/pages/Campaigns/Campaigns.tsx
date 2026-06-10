import { useMemo, useState } from 'react'

import { FeatureFlagKey, useFlagWithLoading } from '@repo/feature-flags'
import { ConfigureMetricsModal } from '@repo/reporting'
import type { MetricConfigItem } from '@repo/reporting'
import { useHistory } from 'react-router-dom'
import { useLocalStorage } from '@gorgias/toolkit-react'

import { Box, PanelHeader } from '@gorgias/axiom'
import type { ColumnDef } from '@gorgias/axiom'
import type { JourneyApiDTO } from '@gorgias/convert-client'

import CampaignsTable from 'AIJourney/components/CampaignsTable/CampaignsTable'
import {
    actionColumns,
    columns,
    dateColumns,
    metricColumns,
} from 'AIJourney/components/CampaignsTable/Columns'
import { CampaignTemplatePicker } from 'AIJourney/components/CampaignTemplatePicker/CampaignTemplatePicker'
import { CreateCampaignTrigger } from 'AIJourney/components/CreateCampaignTrigger/CreateCampaignTrigger'
import { JOURNEY_TYPES, STEPS_NAMES } from 'AIJourney/constants'
import type { CampaignTemplate } from 'AIJourney/data/CampaignTemplatesData'
import {
    DEFAULT_TABLE_METRICS,
    LOADING_TABLE_METRICS,
    useAIJourneyTableKpis,
} from 'AIJourney/hooks/useAIJourneyTableKpis/useAIJourneyTableKpis'
import type { Metrics } from 'AIJourney/hooks/useAIJourneyTableKpis/useAIJourneyTableKpis'
import { useJourneyContext } from 'AIJourney/providers'
import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import { FilterKey } from 'domains/reporting/models/stat/types'
import { DrillDownModal } from 'domains/reporting/pages/common/drill-down/DrillDownModal'
import FiltersPanelWrapper from 'domains/reporting/pages/common/filters/FiltersPanelWrapper'

import { getCampaignStateLabelAndColor } from '../../utils'
import { filterImpersonatedColumns } from '../../utils/filterImpersonatedColumns'

import css from './Campaigns.less'

type JourneyMetrics = Metrics<number | string | undefined>
export type JourneyWithMetrics = JourneyApiDTO & { metrics: JourneyMetrics }
export type TableRow = JourneyWithMetrics

const CUSTOMIZABLE_METRICS: MetricConfigItem[] = [
    { id: 'updated_datetime', label: 'Updated', visibility: true },
    {
        id: 'campaign.scheduled_datetime',
        label: 'Scheduled',
        visibility: true,
    },
    {
        id: 'campaign.completed_datetime',
        label: 'Sent',
        visibility: true,
    },
    { id: 'recipients', label: 'Recipients', visibility: true },
    { id: 'revenue', label: 'Revenue', visibility: true },
    { id: 'totalOrders', label: 'Orders', visibility: false },
    {
        id: 'revenuePerRecipient',
        label: 'Revenue per Recipient',
        visibility: false,
    },
    { id: 'averageOrderValue', label: 'AOV', visibility: false },
    { id: 'messagesSent', label: 'Messages Sent', visibility: false },
    { id: 'ctr', label: 'CTR', visibility: true },
    { id: 'replyRate', label: 'Reply rate', visibility: true },
    { id: 'optOutRate', label: 'Opt out rate', visibility: false },
    { id: 'conversionRate', label: 'Conversion rate', visibility: false },
]

export const Campaigns = () => {
    const {
        campaigns,
        isLoadingJourneys: isLoadingCampaigns,
        currentIntegration,
        shopName,
    } = useJourneyContext()

    const history = useHistory()

    const integrationId = useMemo(() => {
        return currentIntegration?.id || 0
    }, [currentIntegration])

    const { value: isStructuredEditorEnabled } = useFlagWithLoading(
        FeatureFlagKey.AiJourneyStructuredMessageGuidanceEnabled,
        false,
    )
    const { value: isAiJourneyV3ArchitectureEnabled } = useFlagWithLoading(
        FeatureFlagKey.AiJourneyV3ArchitectureEnabled,
        false,
    )
    const showTemplatePicker =
        isStructuredEditorEnabled && isAiJourneyV3ArchitectureEnabled

    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [isTemplatePickerOpen, setIsTemplatePickerOpen] = useState(false)

    const goToCampaignSetup = (prefill?: {
        initialMessageInstructions?: string
        initialCampaignTitle?: string
    }) => {
        const pathname = `/app/ai-journey/${shopName}/${JOURNEY_TYPES.CAMPAIGN}/${STEPS_NAMES.SETUP}`
        if (prefill) {
            history.push({ pathname, state: prefill })
        } else {
            history.push(pathname)
        }
    }

    const handleStartFromScratch = () => {
        setIsTemplatePickerOpen(false)
        goToCampaignSetup(undefined)
    }

    const handleSelectTemplate = (template: CampaignTemplate) => {
        setIsTemplatePickerOpen(false)
        goToCampaignSetup({
            initialMessageInstructions: template.content,
            initialCampaignTitle: template.name,
        })
    }

    const [keyKpisConfig, setKeyKpisConfig] = useLocalStorage<
        MetricConfigItem[]
    >('ai-journey-campaign-columns', CUSTOMIZABLE_METRICS)

    const mergedKpisConfig = useMemo(() => {
        const result = [...keyKpisConfig]
        const presentIds = new Set(result.map((item) => item.id))
        CUSTOMIZABLE_METRICS.forEach((defaultItem, defaultIndex) => {
            if (presentIds.has(defaultItem.id)) return
            let insertAt = result.length
            for (
                let j = defaultIndex + 1;
                j < CUSTOMIZABLE_METRICS.length;
                j++
            ) {
                const anchor = result.findIndex(
                    (r) => r.id === CUSTOMIZABLE_METRICS[j].id,
                )
                if (anchor !== -1) {
                    insertAt = anchor
                    break
                }
            }
            result.splice(insertAt, 0, defaultItem)
            presentIds.add(defaultItem.id)
        })
        return result
    }, [keyKpisConfig])

    const { cleanStatsFilters: statsFilters } = useStatsFilters()

    const filters = useMemo(() => {
        return {
            period: statsFilters.period,
        }
        // oxlint-disable-next-line eslint-plugin-react-hooks/exhaustive-deps
    }, [statsFilters.period.start_datetime, statsFilters.period.end_datetime])

    const isImpersonated = !!window.USER_IMPERSONATED

    const hasCampaigns = campaigns && campaigns.length > 0

    const { metrics: tableMetrics, isLoading: isMetricLoading } =
        useAIJourneyTableKpis({
            integrationId: integrationId.toString(),
            filters,
            journeyIds: campaigns?.map((c) => c.id),
            enabled: !isLoadingCampaigns && hasCampaigns,
        })

    const campaignRows = useMemo(() => {
        return campaigns?.map((campaign) => {
            const campaignMetric = isMetricLoading
                ? LOADING_TABLE_METRICS
                : tableMetrics[campaign.id] || DEFAULT_TABLE_METRICS

            const { label: stateLabel } = getCampaignStateLabelAndColor(
                campaign.campaign?.state,
            )
            return {
                ...campaign,
                stateLabel: stateLabel,
                metrics: campaignMetric,
            }
        })
    }, [campaigns, tableMetrics, isMetricLoading])

    const visibleColumns: ColumnDef<TableRow>[] = useMemo(() => {
        const configurableColumns = [...dateColumns, ...metricColumns]
        const orderedConfigurableColumns = mergedKpisConfig
            .filter((item) => item.visibility)
            .map((item) => {
                return configurableColumns.find((column) => {
                    //@ts-ignore
                    const columnId = column.id || column.accessorKey || ''
                    return (
                        item.id === columnId ||
                        item.id === columnId.replace('metrics.', '')
                    )
                })
            })
            .filter(
                (option): option is ColumnDef<TableRow> => option !== undefined,
            )

        const baseColumns = filterImpersonatedColumns(columns, isImpersonated)

        return [...baseColumns, ...orderedConfigurableColumns, ...actionColumns]
    }, [mergedKpisConfig, isImpersonated])

    return (
        <Box width="100%" flexDirection="column">
            <PanelHeader
                title="Campaigns"
                trailingSlot={
                    <CreateCampaignTrigger
                        showTemplatePicker={showTemplatePicker}
                        onStartFromScratch={handleStartFromScratch}
                        onStartFromTemplate={() =>
                            setIsTemplatePickerOpen(true)
                        }
                    />
                }
            />
            {showTemplatePicker && (
                <CampaignTemplatePicker
                    isOpen={isTemplatePickerOpen}
                    onOpenChange={setIsTemplatePickerOpen}
                    onSelectTemplate={handleSelectTemplate}
                />
            )}

            <Box className={css.filtersPanel}>
                <FiltersPanelWrapper
                    persistentFilters={[FilterKey.Period]}
                    withSavedFilters={false}
                    filterSettingsOverrides={{
                        [FilterKey.Period]: {
                            initialSettings: {
                                maxSpan: 365,
                            },
                        },
                    }}
                />
            </Box>

            <Box
                gap="lg"
                margin={0}
                flexDirection="column"
                className={css.container}
            >
                <CampaignsTable
                    columns={visibleColumns}
                    data={campaignRows || []}
                    onEditColumns={() => setIsEditModalOpen(true)}
                    isLoading={isLoadingCampaigns}
                    initialSorting={[
                        { id: 'updated_datetime', desc: true },
                        { id: 'campaign.scheduled_datetime', desc: true },
                    ]}
                    emptyStateCta={
                        <CreateCampaignTrigger
                            showTemplatePicker={showTemplatePicker}
                            onStartFromScratch={handleStartFromScratch}
                            onStartFromTemplate={() =>
                                setIsTemplatePickerOpen(true)
                            }
                        />
                    }
                />
                <DrillDownModal />
                <ConfigureMetricsModal
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    metrics={mergedKpisConfig}
                    onSave={setKeyKpisConfig}
                    maxVisibleMetric={9}
                    title="Edit columns"
                    description="Choose the columns you want to display and rearrange them as needed."
                />
            </Box>
        </Box>
    )
}
