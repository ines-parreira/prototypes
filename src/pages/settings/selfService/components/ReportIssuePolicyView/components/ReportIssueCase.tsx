import React, {ReactElement} from 'react'
import classNames from 'classnames'

import {Link, useRouteMatch} from 'react-router-dom'

import TableBodyRow from 'pages/common/components/table/TableBodyRow'
import BodyCell from 'pages/common/components/table/cells/BodyCell'
import {Callbacks, useReorderDnD} from 'pages/common/hooks/useReorderDnD'
import ForwardIcon from 'pages/integrations/common/components/ForwardIcon'
import BodyCellContent from 'pages/common/components/table/cells/BodyCellContent'

import bodyCellCss from 'pages/common/components/table/cells/BodyCell.less'

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
                    bodyCellCss.smallest,
                    css.titleCell
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
