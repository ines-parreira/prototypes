import { ComponentType, useCallback, useMemo } from 'react'

import classnames from 'classnames'
import { Map } from 'immutable'

import { OrderDirection, UpdateViewItemsOrderBy } from '@gorgias/helpdesk-types'

import { getConfigByName } from 'config/views'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import { TicketSearchSortableProperties } from 'models/search/types'
import { EntityType } from 'models/view/types'
import { fetchViewItems, setOrderDirection } from 'state/views/actions'
import {
    getActiveView,
    getActiveViewOrderBy,
    getActiveViewOrderDirection,
    getSelectedItemsIds,
} from 'state/views/selectors'
import { fieldPath as getFieldPath } from 'utils'

import css from './HeaderCell.less'

type Props = {
    ActionsComponent: Maybe<ComponentType<any>>
    field: Map<any, any>
    isSearch: boolean
    isEditMode: boolean
    type: EntityType
    isClickable?: boolean
}

const HeaderCell = ({
    ActionsComponent,
    field,
    isSearch,
    isEditMode,
    type,
    isClickable = true,
}: Props) => {
    const dispatch = useAppDispatch()

    const activeView = useAppSelector(getActiveView)
    const config = getConfigByName(type)
    const orderBy = useAppSelector(
        getActiveViewOrderBy,
    ) as TicketSearchSortableProperties
    const orderDirection = useAppSelector(getActiveViewOrderDirection)
    const selectedItemsIds = useAppSelector(getSelectedItemsIds)

    const fieldPath = useMemo(
        () => getFieldPath(field),
        [field],
    ) as TicketSearchSortableProperties

    const isTicketSearchSortingEnabled = useMemo(
        () => isSearch && type === EntityType.Ticket,
        [isSearch, type],
    )

    const action = useMemo(
        () =>
            field.get('filter') && (isTicketSearchSortingEnabled || !isSearch)
                ? field.getIn(['filter', 'sort'])
                    ? 'sort'
                    : 'filter'
                : '',
        [field, isSearch, isTicketSearchSortingEnabled],
    )

    const onClick = useCallback(() => {
        // if currently searching, can't do anything (no edition)
        if (
            field.get('filter') &&
            (isTicketSearchSortingEnabled || !isSearch) &&
            action === 'sort' &&
            isClickable
        ) {
            let newDirection: OrderDirection = OrderDirection.Desc
            if (
                orderBy === fieldPath &&
                orderDirection === OrderDirection.Desc
            ) {
                newDirection = OrderDirection.Asc
            }

            dispatch(
                setOrderDirection({
                    direction: newDirection,
                    isEditable: isSearch || isEditMode,
                    fieldPath,
                }),
            )
            void dispatch(
                fetchViewItems(undefined, undefined, undefined, undefined, {
                    orderBy:
                        `${fieldPath}:${newDirection}` as UpdateViewItemsOrderBy,
                }),
            )
        }
    }, [
        action,
        dispatch,
        field,
        fieldPath,
        isSearch,
        isEditMode,
        isTicketSearchSortingEnabled,
        orderDirection,
        isClickable,
        orderBy,
    ])

    const isMainField = config.get('mainField') === field.get('name')

    return (
        <td>
            <div>
                <div className={classnames('cell-wrapper', css.cellWrapper)}>
                    {isMainField ? (
                        ActionsComponent ? (
                            <ActionsComponent
                                view={activeView}
                                selectedItemsIds={selectedItemsIds}
                            />
                        ) : null
                    ) : (
                        <div
                            onClick={onClick}
                            className={classnames({
                                clickable: action === 'sort' && isClickable,
                            })}
                        >
                            <span
                                className={classnames('field-title', {
                                    active:
                                        action === 'sort' &&
                                        fieldPath === orderBy,
                                })}
                            >
                                {field.get('title')}
                            </span>

                            {fieldPath === orderBy && !!orderDirection && (
                                <i className="material-icons md-1">
                                    {orderDirection === 'desc'
                                        ? 'arrow_drop_down'
                                        : 'arrow_drop_up'}
                                </i>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </td>
    )
}

export default HeaderCell
