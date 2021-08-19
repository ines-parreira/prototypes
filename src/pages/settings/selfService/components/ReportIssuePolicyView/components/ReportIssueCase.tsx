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
}

const ReportIssueCase = ({
    reportIssueCase: {id, title, description},
    position,
    onMoveEntity,
    onDropEntity,
    isFallbackCase,
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
            style={{opacity: isDragging ? 0 : 1}}
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

            <td className="link-full-td">
                <Link to={linkToEditor}>
                    <div>
                        <b>{title}</b>
                    </div>
                </Link>
            </td>

            <td className={classNames(css.caseDescription, 'link-full-td')}>
                <Link to={linkToEditor}>
                    <div>{description}</div>
                </Link>
            </td>

            <td className="link-full-td">
                <Link to={linkToEditor}>
                    <ForwardIcon href={linkToEditor} />
                </Link>
            </td>
        </TableBodyRow>
    )
}

export default ReportIssueCase
