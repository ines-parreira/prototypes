import React, {HTMLProps} from 'react'

import {
    ScoredSurveyDataKey,
    ScoredSurveysData,
} from 'hooks/reporting/quality-management/satisfaction/useScoredSurveys'
import {OrderDirection} from 'models/api/types'
import AssigneeBodyCell, {
    Props as AssigneeBodyCellProps,
} from 'pages/stats/quality-management/satisfaction/ScoredSurveysChart/AssigneeBodyCell'
import CommentBodyCell, {
    Props as CommentBodyCellProps,
} from 'pages/stats/quality-management/satisfaction/ScoredSurveysChart/CommentBodyCell'
import CustomerNameBodyCell, {
    Props as CustomerNameBodyCellProps,
} from 'pages/stats/quality-management/satisfaction/ScoredSurveysChart/CustomerNameBodyCell'
import ScoredDateBodyCell, {
    Props as ScoredDateBodyCellProps,
} from 'pages/stats/quality-management/satisfaction/ScoredSurveysChart/ScoredDateBodyCell'
import SurveyScoreBodyCell, {
    Props as SurveyScoreBodyCellProps,
} from 'pages/stats/quality-management/satisfaction/ScoredSurveysChart/SurveyScoreBodyCell'
import TicketIdBodyCell, {
    Props as TicketIdBodyCellProps,
} from 'pages/stats/quality-management/satisfaction/ScoredSurveysChart/TicketIdBodyCell'

type ColProps = Omit<HTMLProps<HTMLTableCellElement>, 'size'> & {
    title: string
    justifyContent?: 'left' | 'right' | 'center'
    width: number
    property?: ScoredSurveyDataKey
    CellComponent:
        | React.FunctionComponent<AssigneeBodyCellProps>
        | React.FunctionComponent<ScoredDateBodyCellProps>
        | React.FunctionComponent<SurveyScoreBodyCellProps>
        | React.FunctionComponent<CommentBodyCellProps>
        | React.FunctionComponent<CustomerNameBodyCellProps>
        | React.FunctionComponent<TicketIdBodyCellProps>
}

export const SCORED_SURVEYS_TABLE_COLUMNS: ColProps[] = [
    {
        title: 'date',
        justifyContent: 'left',
        property: ScoredSurveyDataKey.SURVEY_SCORED_DATE,
        width: 140,
        CellComponent: ScoredDateBodyCell,
    },
    {
        title: 'customer name',
        justifyContent: 'left',
        property: ScoredSurveyDataKey.CUSTOMER_NAME,
        width: 200,
        CellComponent: CustomerNameBodyCell,
    },
    {
        title: 'assignee',
        justifyContent: 'left',
        property: ScoredSurveyDataKey.ASSIGNEE,
        width: 140,
        CellComponent: AssigneeBodyCell,
    },
    {
        title: 'score',
        justifyContent: 'right',
        property: ScoredSurveyDataKey.SURVEY_SCORE,
        width: 100,
        CellComponent: SurveyScoreBodyCell,
    },
    {
        title: 'comment',
        justifyContent: 'left',
        property: ScoredSurveyDataKey.COMMENT,
        width: 600,
        CellComponent: CommentBodyCell,
    },
    {
        title: '',
        justifyContent: 'center',
        width: 60,
        CellComponent: TicketIdBodyCell,
    },
]

export const SCORED_SURVEYS = {
    TITLE: 'Scored surveys',
    DESCRIPTION:
        'Most recent survey responses, for surveys sent during the period.',
}

export const SURVEYS_PER_PAGE = 10

export const sortScoredSurveyData = (
    data: ScoredSurveysData[],
    orderBy: ScoredSurveyDataKey,
    orderDirection: OrderDirection
) => {
    return [...data].sort((a, b) => {
        const valA = a[orderBy]
        const valB = b[orderBy]

        if (valA == null) return 1
        if (valB == null) return -1

        const isAscending = orderDirection === OrderDirection.Asc

        if (orderBy === ScoredSurveyDataKey.SURVEY_SCORE) {
            return isAscending
                ? Number(valA) - Number(valB)
                : Number(valB) - Number(valA)
        }

        if (orderBy === ScoredSurveyDataKey.SURVEY_SCORED_DATE) {
            return isAscending
                ? new Date(valA).getTime() - new Date(valB).getTime()
                : new Date(valB).getTime() - new Date(valA).getTime()
        }

        return isAscending
            ? valA.localeCompare(valB, undefined, {sensitivity: 'base'})
            : valB.localeCompare(valA, undefined, {sensitivity: 'base'})
    })
}
