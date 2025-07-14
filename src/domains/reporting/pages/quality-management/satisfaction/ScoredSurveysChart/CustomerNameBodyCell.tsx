import { Link } from 'react-router-dom'

import { NOT_AVAILABLE_PLACEHOLDER } from 'domains/reporting/pages/common/utils'
import css from 'domains/reporting/pages/quality-management/satisfaction/ScoredSurveysChart/ScoredSurveysTable.less'
import BodyCell, {
    Props as BodyCellProps,
} from 'pages/common/components/table/cells/BodyCell'

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
