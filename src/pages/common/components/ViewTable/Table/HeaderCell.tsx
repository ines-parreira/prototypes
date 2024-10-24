import classnames from 'classnames'
import {fromJS, Map, List} from 'immutable'
import {useFlags} from 'launchdarkly-react-client-sdk'
import React, {ComponentType, useCallback, useMemo} from 'react'

import {FeatureFlagKey} from 'config/featureFlags'
import {getConfigByName} from 'config/views'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import {OrderDirection} from 'models/api/types'
import {TicketSearchSortableProperties} from 'models/search/types'
import {EntityType} from 'models/view/types'
import ShowMoreFieldsDropdown from 'pages/common/components/ViewTable/ShowMoreFieldsDropdown'
import {fetchViewItems, setOrderDirection} from 'state/views/actions'
import {
    getActiveView,
    getActiveViewOrderBy,
    getActiveViewOrderDirection,
    getSelectedItemsIds,
} from 'state/views/selectors'
import {fieldPath as getFieldPath} from 'utils'

import css from './HeaderCell.less'

type Props = {
    ActionsComponent: Maybe<ComponentType<any>>
    field: Map<any, any>
    fields: List<any>
    shouldRenderShowMoreDropdown: boolean
    isSearch: boolean
    type: EntityType
    isClickable?: boolean
}

const HeaderCell = ({
    ActionsComponent,
    field,
    fields,
    shouldRenderShowMoreDropdown,
    isSearch,
    type,
    isClickable = true,
}: Props) => {
    const dispatch = useAppDispatch()

    const activeView = useAppSelector(getActiveView)
    const config = getConfigByName(type)
    const orderBy = useAppSelector(
        getActiveViewOrderBy
    ) as TicketSearchSortableProperties
    const orderDirection = useAppSelector(getActiveViewOrderDirection)
    const selectedItemsIds = useAppSelector(getSelectedItemsIds)
    const isAdvancedSearchSortingEnabled: boolean =
        useFlags()[FeatureFlagKey.AdvancedSearchSorting]

    const fieldPath = useMemo(
        () => getFieldPath(field),
        [field]
    ) as TicketSearchSortableProperties

    const isSearchSortingEnabled = useMemo(
        () =>
            isAdvancedSearchSortingEnabled &&
            isSearch &&
            type === EntityType.Ticket,
        [isAdvancedSearchSortingEnabled, isSearch, type]
    )

    const action = useMemo(
        () =>
            field.get('filter') && (isSearchSortingEnabled || !isSearch)
                ? field.getIn(['filter', 'sort'])
                    ? 'sort'
                    : 'filter'
                : '',
        [field, isSearch, isSearchSortingEnabled]
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
        if (
            field.get('filter') &&
            (isSearchSortingEnabled || !isSearch) &&
            action === 'sort' &&
            isClickable
        ) {
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
    }, [
        action,
        dispatch,
        field,
        fieldPath,
        isSearch,
        isSearchSortingEnabled,
        orderDirection,
        isClickable,
    ])

    const isMainField = config.get('mainField') === field.get('name')

    const selectableFields = useMemo(
        () =>
            (config.get('fields', fromJS([])) as List<any>).filter(
                (field: Map<any, any>) => field.get('show', true) as boolean
            ) as List<any>,
        [config]
    )

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
                            <span className="field-title">
                                {field.get('title')}
                            </span>
                            {action === 'sort' &&
                                renderOrderIcon(fieldPath === orderBy)}
                        </div>
                    )}
                </div>
                {shouldRenderShowMoreDropdown &&
                (isSearchSortingEnabled || !isSearch) ? (
                    <ShowMoreFieldsDropdown
                        config={config}
                        fields={selectableFields}
                        visibleFields={fields}
                        shouldStoreFieldConfig={isSearchSortingEnabled}
                    />
                ) : null}
            </div>
        </td>
    )
}

export default HeaderCell
