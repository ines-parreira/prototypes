import React, {ComponentType, useCallback, useMemo} from 'react'
import {fromJS, Map, List} from 'immutable'
import classnames from 'classnames'
import {useFlags} from 'launchdarkly-react-client-sdk'

import {TicketSearchSortableProperties} from 'models/search/types'
import {getConfigByName} from 'config/views'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import {FeatureFlagKey} from 'config/featureFlags'
import {OrderDirection} from 'models/api/types'
import ShowMoreFieldsDropdown from 'pages/common/components/ViewTable/ShowMoreFieldsDropdown'
import {fetchViewItems, setOrderDirection} from 'state/views/actions'
import {
    getActiveView,
    getActiveViewOrderBy,
    getActiveViewOrderDirection,
    getSelectedItemsIds,
} from 'state/views/selectors'
import {fieldPath as getFieldPath} from 'utils'
import {EntityType} from 'models/view/types'

type Props = {
    ActionsComponent: Maybe<ComponentType<any>>
    field: Map<any, any>
    fields: List<any>
    isLast: boolean
    isSearch: boolean
    type: string
}

const HeaderCell = ({
    ActionsComponent,
    field,
    fields,
    isLast,
    isSearch,
    type,
}: Props) => {
    const dispatch = useAppDispatch()

    const activeView = useAppSelector(getActiveView)
    const config = getConfigByName(type)
    const orderBy = useAppSelector(
        getActiveViewOrderBy
    ) as TicketSearchSortableProperties
    const orderDirection = useAppSelector(getActiveViewOrderDirection)
    const selectedItemsIds = useAppSelector(getSelectedItemsIds)
    const isAdvancedSearchSortingEnabled =
        useFlags()[FeatureFlagKey.AdvancedSearchSorting]

    const fieldPath = useMemo(
        () => getFieldPath(field),
        [field]
    ) as TicketSearchSortableProperties

    const action = useMemo(
        () =>
            field.get('filter') && !isSearch
                ? field.getIn(['filter', 'sort'])
                    ? 'sort'
                    : 'filter'
                : '',
        [field, isSearch]
    )

    const renderOrderIcon = useCallback(
        (isOrderingField = false) => {
            if (isOrderingField) {
                return (
                    <i className="material-icons md-1">
                        {orderDirection === 'desc'
                            ? 'arrow_drop_down'
                            : 'arrow_drop_up'}
                    </i>
                )
            }

            return null
        },
        [orderDirection]
    )

    const onClick = useCallback(() => {
        // if currently searching, can't do anything (no edition)
        if (field.get('filter') && !isSearch && action === 'sort') {
            const newDirection =
                orderDirection === OrderDirection.Desc
                    ? OrderDirection.Asc
                    : OrderDirection.Desc
            dispatch(setOrderDirection(fieldPath, newDirection))
            void dispatch(
                fetchViewItems(undefined, undefined, undefined, undefined, {
                    orderBy: `${fieldPath}:${newDirection}`,
                })
            )
        }
    }, [action, dispatch, field, fieldPath, isSearch, orderDirection])

    const isMainField = config.get('mainField') === field.get('name')

    return (
        <td>
            <div>
                <div className="cell-wrapper">
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
                                clickable: action === 'sort',
                            })}
                        >
                            <span className="field-title">
                                {field.get('title')}
                            </span>
                            {action === 'sort' &&
                                renderOrderIcon(fieldPath === orderBy)}
                        </div>
                    )}
                </div>
                {isLast &&
                ((isAdvancedSearchSortingEnabled &&
                    isSearch &&
                    (type === EntityType.Ticket ||
                        type === EntityType.TicketWithHighlight)) ||
                    !isSearch) ? (
                    <ShowMoreFieldsDropdown
                        config={config}
                        fields={config.get('fields', fromJS([]))}
                        visibleFields={fields}
                    />
                ) : null}
            </div>
        </td>
    )
}

export default HeaderCell
