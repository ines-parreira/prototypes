import React, {ReactElement} from 'react'
import classNames from 'classnames'

import {useRouteMatch, Link} from 'react-router-dom'

import TableBodyRow from '../../../../../common/components/table/TableBodyRow'
import BodyCell from '../../../../../common/components/table/cells/BodyCell'
import {
    useReorderDnD,
    Callbacks,
} from '../../../../../settings/helpCenter/hooks/useReorderDnD'
import ForwardIcon from '../../../../../integrations/detail/components/ForwardIcon'

import bodyCellCss from '../../../../../common/components/table/cells/BodyCell.less'
import BodyCellContent from '../../../../../common/components/table/cells/BodyCellContent'
import css from './ReportIssueCase.less'

interface ReportIssueCaseProps {
    reportIssueCase: {
        id: string
        title: string
        description: string
    }
    position: number
    onMoveEntity: Callbacks['onHover']
    onDropEntity: Callbacks['onDrop']
    isFallbackCase: boolean
    isHighlighted: boolean
}

const ReportIssueCase = ({
    reportIssueCase: {id, title, description},
    position,
    onMoveEntity,
    onDropEntity,
    isFallbackCase,
    isHighlighted,
}: ReportIssueCaseProps): ReactElement => {
    const {dragRef, dropRef, handlerId, isDragging} = useReorderDnD(
        {
            position,
            id,
            type: `report-issue-case`,
        },
        [`report-issue-case`],
        {onHover: onMoveEntity, onDrop: onDropEntity}
    )
    const {
        params: {shopName, integrationType},
    } = useRouteMatch<{shopName: string; integrationType: string}>()

    const linkToEditor = `/app/settings/self-service/${integrationType}/${shopName}/preferences/report-issue/${position}`

    return (
        <TableBodyRow
            key={id}
            ref={
                !isFallbackCase
                    ? (dropRef as React.Ref<HTMLTableRowElement>)
                    : undefined
            }
            data-handler-id={handlerId}
            style={{
                opacity: isDragging ? 0 : 1,
                backgroundColor: isHighlighted
                    ? 'rgb(247, 249, 254)'
                    : 'default',
            }}
        >
            <BodyCell
                innerClassName={
                    isFallbackCase ? css.fallbackCell : css.dragCell
                }
                ref={
                    !isFallbackCase
                        ? (dragRef as React.Ref<HTMLTableDataCellElement>)
                        : undefined
                }
            >
                {!isFallbackCase && (
                    <div className={classNames(css.dragIcon, 'material-icons')}>
                        drag_indicator
                    </div>
                )}
            </BodyCell>

            <td
                className={classNames(
                    bodyCellCss.wrapper,
                    bodyCellCss.smallest
                )}
            >
                <Link to={linkToEditor}>
                    <BodyCellContent>
                        <b>{title}</b>
                    </BodyCellContent>
                </Link>
            </td>

            <td className={bodyCellCss.wrapper}>
                <Link to={linkToEditor}>
                    <BodyCellContent>{description}</BodyCellContent>
                </Link>
            </td>
            <BodyCell className={css.forwardCell}>
                <ForwardIcon href={linkToEditor} />
            </BodyCell>
        </TableBodyRow>
    )
}

export default ReportIssueCase
