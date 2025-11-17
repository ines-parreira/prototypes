import { useMemo } from 'react'

import {
    fetchMetricPerDimensionWithEnrichment,
    useMetricPerDimensionWithEnrichment,
} from 'domains/reporting/hooks/useMetricPerDimension'
import type { MergedRecord } from 'domains/reporting/hooks/withEnrichment'
import { TicketDimension } from 'domains/reporting/models/cubes/TicketCube'
import { TicketSatisfactionSurveyDimension } from 'domains/reporting/models/cubes/TicketSatisfactionSurveyCube'
import { scoredSurveysQueryFactory } from 'domains/reporting/models/queryFactories/satisfaction/scoredSurveysQueryFactory'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { EnrichmentFields } from 'domains/reporting/models/types'
import { OrderDirection } from 'models/api/types'

export enum ScoredSurveyDataKey {
    ASSIGNEE = 'assignee',
    CUSTOMER_NAME = 'customerName',
    TICKET_ID = 'ticketId',
    SURVEY_SCORE = 'surveyScore',
    COMMENT = 'comment',
    SURVEY_SCORED_DATE = 'surveyScoredDate',
    SURVEY_CUSTOMER_ID = 'surveyCustomerId',
}

export type ScoredSurveyColumnApplicableSortKeys =
    | TicketDimension.SurveyScore
    | TicketSatisfactionSurveyDimension.SurveyScoredDatetime

export const getScoredSurveyOrderFromColumnKey = (
    key: ScoredSurveyDataKey,
): ScoredSurveyColumnApplicableSortKeys => {
    switch (key) {
        case ScoredSurveyDataKey.SURVEY_SCORE:
            return TicketDimension.SurveyScore
        case ScoredSurveyDataKey.SURVEY_SCORED_DATE:
        // The columns below are not applicable for sorting on the backend today, but will be in the future
        case ScoredSurveyDataKey.TICKET_ID:
        case ScoredSurveyDataKey.ASSIGNEE:
        case ScoredSurveyDataKey.CUSTOMER_NAME:
        case ScoredSurveyDataKey.SURVEY_CUSTOMER_ID:
        case ScoredSurveyDataKey.COMMENT:
            return TicketSatisfactionSurveyDimension.SurveyScoredDatetime
    }
}

export type ScoredSurveySortingType = {
    sortBy: ScoredSurveyColumnApplicableSortKeys
    sortDirection: OrderDirection
}

export const ScoredSurveySortDefaultValues: ScoredSurveySortingType = {
    sortBy: getScoredSurveyOrderFromColumnKey(
        ScoredSurveyDataKey.SURVEY_SCORED_DATE,
    ),
    sortDirection: OrderDirection.Desc,
}

export type ScoredSurveysData = Record<ScoredSurveyDataKey, string | null>

export type ScoredSurveysQueryData = {
    isFetching: boolean
    isError: boolean
    data?: ScoredSurveysData[]
}

export type RawScoredSurveyData = {
    [TicketDimension.TicketId]: string | null
    [TicketDimension.SurveyScore]: string
    [TicketSatisfactionSurveyDimension.SurveyCustomerId]: string | null
    [TicketSatisfactionSurveyDimension.SurveyComment]: string | null
    [TicketSatisfactionSurveyDimension.SurveyScoredDatetime]: string | null
    [EnrichmentFields.CustomerName]: string
    [EnrichmentFields.AssigneeName]: string
}

const mapScoredSurveysQueryResponse = (
    allData?: MergedRecord<
        TicketSatisfactionSurveyDimension | EnrichmentFields,
        TicketDimension
    >[],
): ScoredSurveysData[] | undefined => {
    if (!allData) {
        return
    }

    return allData.map((result) => ({
        ticketId: result[TicketDimension.TicketId] || null,
        surveyScore: result[TicketDimension.SurveyScore] || null,
        comment:
            result[TicketSatisfactionSurveyDimension.SurveyComment] || null,
        assignee: result[EnrichmentFields.AssigneeName] || null,
        customerName: result[EnrichmentFields.CustomerName] || null,
        surveyCustomerId:
            result[TicketSatisfactionSurveyDimension.SurveyCustomerId] || null,
        surveyScoredDate:
            result[TicketSatisfactionSurveyDimension.SurveyScoredDatetime] ||
            null,
    }))
}

export const useScoredSurveys = (
    filters: StatsFilters,
    timezone: string,
    sorting: ScoredSurveySortingType,
    limit?: number,
): ScoredSurveysQueryData => {
    const { data, isFetching, isError } = useMetricPerDimensionWithEnrichment(
        scoredSurveysQueryFactory(filters, timezone, sorting, limit),
        [EnrichmentFields.CustomerName, EnrichmentFields.AssigneeName],
        EnrichmentFields.TicketId,
    )

    const processedData = useMemo(() => {
        return mapScoredSurveysQueryResponse(data?.allData)
    }, [data?.allData])

    return {
        data: processedData,
        isFetching,
        isError,
    }
}

export const fetchScoredSurveys = (
    filters: StatsFilters,
    timezone: string,
    sorting: ScoredSurveySortingType,
    limit?: number,
) =>
    fetchMetricPerDimensionWithEnrichment(
        scoredSurveysQueryFactory(filters, timezone, sorting, limit),
        [EnrichmentFields.CustomerName, EnrichmentFields.AssigneeName],
        EnrichmentFields.TicketId,
    )
        .then((result) => {
            return {
                ...result,
                data: mapScoredSurveysQueryResponse(result.data?.allData),
            }
        })
        .catch(() => ({
            data: null,
            isFetching: false,
            isError: true,
        }))
