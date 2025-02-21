import React from 'react'

import BodyCell, {
    Props as BodyCellProps,
} from 'pages/common/components/table/cells/BodyCell'
import css from 'pages/stats/quality-management/satisfaction/ScoredSurveysChart/ScoredSurveysTable.less'

export type Props = Omit<BodyCellProps, 'children' | 'ref'> & {
    surveyScore: string | null
}

export default function SurveyScoreBodyCell({
    surveyScore,
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
            <div className={css.surveyScore}>
                <span>{surveyScore}</span>
                <span className="material-icons md-2">star</span>
            </div>
        </BodyCell>
    )
}
