import React from 'react'

import { Link } from 'react-router-dom'

import BodyCell, {
    Props as BodyCellProps,
} from 'pages/common/components/table/cells/BodyCell'
import { NOT_AVAILABLE_PLACEHOLDER } from 'pages/stats/common/utils'
import css from 'pages/stats/quality-management/satisfaction/ScoredSurveysChart/ScoredSurveysTable.less'

export type Props = Omit<BodyCellProps, 'children' | 'ref'> & {
    customerName: string | null
    surveyCustomerId: string | null
}

export default function CustomerNameBodyCell({
    customerName,
    surveyCustomerId,
    width,
    height,
    innerClassName,
    justifyContent,
}: Props) {
    return (
        <BodyCell
            width={width}
            height={height}
            innerClassName={innerClassName}
            justifyContent={justifyContent}
        >
            {customerName && surveyCustomerId ? (
                <Link
                    to={`/app/customer/${surveyCustomerId}`}
                    className={css.customerName}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    {customerName}
                </Link>
            ) : (
                NOT_AVAILABLE_PLACEHOLDER
            )}
        </BodyCell>
    )
}
