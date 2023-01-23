import React, {ComponentType, Component} from 'react'
import {connect, ConnectedProps} from 'react-redux'
import {fromJS, Map, List} from 'immutable'
import classnames from 'classnames'
import _noop from 'lodash/noop'

import {getConfigByName} from 'config/views'
import {OrderDirection} from 'models/api/types'
import ShowMoreFieldsDropdown from 'pages/common/components/ViewTable/ShowMoreFieldsDropdown'
import {RootState} from 'state/types'
import {fetchViewItems, setOrderDirection} from 'state/views/actions'
import {
    getActiveView,
    getActiveViewOrderBy,
    getActiveViewOrderDirection,
    getSelectedItemsIds,
} from 'state/views/selectors'
import {fieldPath as getFieldPath} from 'utils'

type OwnProps = {
    ActionsComponent: Maybe<ComponentType<any>>
    field: Map<any, any>
    fields: List<any>
    isLast: boolean
    isSearch: boolean
    type: string
}

type Props = OwnProps & ConnectedProps<typeof connector>

export class HeaderCellContainer extends Component<Props> {
    _renderOrderIcon = (isOrderingField = false) => {
        const {orderDirection} = this.props

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
    }

    render() {
        const {
            ActionsComponent,
            config,
            fetchViewItems,
            field,
            fields,
            isLast,
            isSearch,
            orderBy,
            orderDirection,
            setOrderDirection,
        } = this.props

        const isMainField = config.get('mainField') === field.get('name')

        const fieldPath = getFieldPath(field)

        let action = ''
        let onClick = _noop

        // if currently searching, can't do anything (no edition)
        if (field.get('filter') && !isSearch) {
            action = field.getIn(['filter', 'sort']) ? 'sort' : 'filter'

            if (action === 'sort') {
                onClick = () => {
                    const newOrderDirection =
                        orderDirection === OrderDirection.Desc
                            ? OrderDirection.Asc
                            : OrderDirection.Desc
                    setOrderDirection(fieldPath, newOrderDirection)
                    void fetchViewItems()
                }
            }
        }

        return (
            <td>
                <div>
                    <div className="cell-wrapper">
                        {isMainField ? (
                            ActionsComponent ? (
                                <ActionsComponent
                                    view={this.props.activeView}
                                    selectedItemsIds={
                                        this.props.selectedItemsIds
                                    }
                                />
                            ) : null
                        ) : (
                            <div
                                onClick={onClick}
                                className={classnames({
                                    clickable: action === 'sort',
                                })}
                            >
                                <span>{field.get('title')}</span>
                                {action === 'sort' &&
                                    this._renderOrderIcon(
                                        fieldPath === orderBy
                                    )}
                            </div>
                        )}
                    </div>
                    {isLast && !isSearch ? (
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
}

const connector = connect(
    (state: RootState, ownProps: OwnProps) => {
        return {
            activeView: getActiveView(state),
            config: getConfigByName(ownProps.type),
            orderBy: getActiveViewOrderBy(state),
            orderDirection: getActiveViewOrderDirection(state),
            selectedItemsIds: getSelectedItemsIds(state),
        }
    },
    {
        fetchViewItems,
        setOrderDirection,
    }
)

export default connector(HeaderCellContainer)
