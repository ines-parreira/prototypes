import { useMemo } from 'react'

import moment from 'moment'
import { useShallow } from 'zustand/react/shallow'

import type { ComposedMetricTimeSeriesMarker } from '@repo/reporting'

import { useGetArticleTranslationVersions } from 'models/helpCenter/queries'
import { getAiAgentBasePath } from 'pages/aiAgent/hooks/useAiAgentNavigation'

import type { DateRange } from '../../shared/types'
import type { ArticleTranslationVersion } from '../../shared/useVersionHistoryBase/useVersionHistoryBase'
import { useSkillEditorStore } from '../context/KnowledgeEditorSkillContext'
import {
    mockSkillPerformanceChartMarkers,
    USE_MOCK_SKILL_PERFORMANCE_CHART_DATA,
} from './SkillPerformanceTrendMockData'

const SKILL_EVENT_MARKER_LABEL = 'Changes published in skill'

type SkillVersionLink = {
    skillId: number
    shopName: string
}

const buildSkillVersionActionHref = (
    { skillId, shopName }: SkillVersionLink,
    versionId: number,
): string =>
    `${getAiAgentBasePath(shopName)}/skills/${skillId}?versionId=${versionId}`

const isWithinDateRange = (
    markerDate: string,
    range: DateRange | undefined,
): boolean => {
    if (!range) return true

    return moment(markerDate).isBetween(
        range.start_datetime,
        range.end_datetime,
        'day',
        '[]',
    )
}

/**
 * Convert Help Center article-translation versions into chart event markers.
 * Each published version becomes one marker; drafts are skipped because they
 * never appear on the public timeline. `commit_message` flows through as the
 * marker description so the tooltip can render it; When a `dateRange` is supplied, only versions
 * published within the inclusive day range are returned. When `skillLink` is
 * supplied, each marker also gets an `actionHref` pointing at the skill editor
 * scoped to that specific version, so the chart tooltip can deep-link.
 */
export const deriveSkillEventMarkers = (
    versions: ArticleTranslationVersion[] | undefined,
    dateRange?: DateRange,
    skillLink?: SkillVersionLink,
): ComposedMetricTimeSeriesMarker[] => {
    if (!versions || versions.length === 0) return []

    return versions.flatMap((version) => {
        const publishedAt = version.published_datetime
        if (publishedAt === null) return []

        if (!isWithinDateRange(publishedAt, dateRange)) return []

        const marker: ComposedMetricTimeSeriesMarker = {
            id: `skill-version-${version.id}`,
            date: moment(publishedAt).format('YYYY-MM-DD'),
            label: SKILL_EVENT_MARKER_LABEL,
        }
        if (version.commit_message) {
            marker.description = version.commit_message
        }
        if (skillLink) {
            marker.actionHref = buildSkillVersionActionHref(
                skillLink,
                version.id,
            )
        }

        return [marker]
    })
}

export type SkillEventMarkersData = {
    markers: ComposedMetricTimeSeriesMarker[]
    isLoading: boolean
}

type UseSkillEventMarkersParams = {
    dateRange?: DateRange
    useMockData?: boolean
}

export const useSkillEventMarkers = (
    skillId: number | undefined,
    {
        dateRange,
        useMockData = USE_MOCK_SKILL_PERFORMANCE_CHART_DATA,
    }: UseSkillEventMarkersParams = {},
): SkillEventMarkersData => {
    const { helpCenterId, helpCenterLocale, shopName } = useSkillEditorStore(
        useShallow((storeState) => ({
            helpCenterId: storeState.config.helpCenter.id,
            helpCenterLocale:
                storeState.config.helpCenter.default_locale ?? 'en-US',
            shopName: storeState.config.shopName,
        })),
    )

    const isEnabled =
        !useMockData && !!helpCenterId && !!skillId && !!helpCenterLocale

    const { data, isLoading } = useGetArticleTranslationVersions(
        {
            help_center_id: helpCenterId,
            article_id: skillId ?? 0,
            locale: helpCenterLocale,
        },
        undefined,
        { enabled: isEnabled },
    )

    const skillLink = useMemo<SkillVersionLink | undefined>(
        () => (skillId && shopName ? { skillId, shopName } : undefined),
        [skillId, shopName],
    )

    const markers = useMemo(() => {
        if (useMockData) {
            return dateRange
                ? mockSkillPerformanceChartMarkers.filter((marker) =>
                      isWithinDateRange(marker.date, dateRange),
                  )
                : mockSkillPerformanceChartMarkers
        }

        return deriveSkillEventMarkers(data?.data, dateRange, skillLink)
    }, [useMockData, data, dateRange, skillLink])

    return {
        markers,
        isLoading: isEnabled && isLoading,
    }
}
