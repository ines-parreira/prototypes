import React from 'react'
import classNames from 'classnames'

import {Badge} from 'reactstrap'

import {Category} from '../../../../../../../models/helpCenter/types'

import BodyCell from '../../../../../../common/components/table/cells/BodyCell'
import TableBodyRow from '../../../../../../common/components/table/TableBodyRow'

import {useReorderDnD, Callbacks} from '../../../../hooks/useReorderDnD'

import {DND_ENTITIES} from '../../constants'

import css from './DroppableCategoryRow.less'

export type RowEventListeners = {
    onRowClick?: () => void
    onMoveEntity: Callbacks['onHover']
}

type Props = RowEventListeners & {
    category: Category
    renderArticleList?: (category: Category) => React.ReactElement
}

export const DroppableCategoryRow = ({
    category,
    renderArticleList,
    onRowClick,
    onMoveEntity,
}: Props): JSX.Element => {
    const [isOpen, setOpen] = React.useState(false)
    const count = React.useMemo(() => category.articles.length, [
        category.articles,
    ])
    const {dragRef, dropRef, handlerId, isDragging} = useReorderDnD(
        {
            position: category.position,
            id: category.id,
            type: DND_ENTITIES.CATEGORY,
        },
        [DND_ENTITIES.CATEGORY],
        {onHover: onMoveEntity}
    )

    const opacity = isDragging ? 0 : 1

    React.useEffect(() => {
        if (isDragging) {
            setOpen(false)
        }
    }, [isDragging])

    return (
        <>
            <TableBodyRow
                ref={dropRef as React.Ref<HTMLTableRowElement>}
                data-handler-id={handlerId}
                style={{opacity, background: 'white'}}
                onClick={onRowClick}
            >
                <BodyCell>
                    <div
                        ref={dragRef as React.RefObject<HTMLDivElement>}
                        className={classNames(
                            css['drag-handler'],
                            'material-icons'
                        )}
                    >
                        drag_indicator
                    </div>
                </BodyCell>
                <BodyCell
                    className={css['category-cell']}
                    onClick={() => setOpen(!isOpen)}
                >
                    {count > 0 && renderArticleList ? (
                        <span
                            className={classNames(css.caret, 'material-icons')}
                        >
                            {isOpen ? 'arrow_drop_down' : 'arrow_right'}
                        </span>
                    ) : (
                        <span className={css['caret-placeholder']} />
                    )}
                    <span>{category.translation.title}</span>
                    <Badge pill color="light" className={css.count}>
                        {count > 0 ? count : 'No Published Articles'}
                    </Badge>
                </BodyCell>
            </TableBodyRow>
            {isOpen && renderArticleList && (
                <TableBodyRow>
                    <BodyCell colSpan={4} className={css['parent-cell']}>
                        {renderArticleList(category)}
                    </BodyCell>
                </TableBodyRow>
            )}
        </>
    )
}
