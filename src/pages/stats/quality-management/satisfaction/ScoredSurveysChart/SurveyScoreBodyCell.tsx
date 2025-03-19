import BodyCell, {
    Props as BodyCellProps,
} from 'pages/common/components/table/cells/BodyCell'
import css from 'pages/stats/quality-management/satisfaction/ScoredSurveysChart/ScoredSurveysTable.less'

export type Props = Omit<BodyCellProps, 'children' | 'ref'> & {
    surveyScore: string | null
}

export default function SurveyScoreBodyCell({
    surveyScore,
    height,
    innerClassName,
    justifyContent,
    width,
}: Props) {
    return (
        <BodyCell
            height={height}
            innerClassName={innerClassName}
            justifyContent={justifyContent}
            width={width}
        >
            <div className={css.surveyScore}>
                <span>{surveyScore}</span>
                <span className="material-icons md-2">star</span>
            </div>
        </BodyCell>
    )
}
