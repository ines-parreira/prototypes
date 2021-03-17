import React, {ComponentType, Component} from 'react'
import {connect, ConnectedProps} from 'react-redux'
import {fromJS, Map, List} from 'immutable'
import classnames from 'classnames'
import _noop from 'lodash/noop'

import {fieldPath as getFieldPath} from '../../../../../utils'

import ShowMoreFieldsDropdown from '../ShowMoreFieldsDropdown'

import * as viewsActions from '../../../../../state/views/actions'
import * as viewsSelectors from '../../../../../state/views/selectors'

import * as viewsConfig from '../../../../../config/views'
import {OrderDirection} from '../../../../../models/api/types'
import {RootState} from '../../../../../state/types'

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
            activeView: viewsSelectors.getActiveView(state),
            config: viewsConfig.getConfigByName(ownProps.type),
            orderBy: viewsSelectors.getActiveViewOrderBy(state),
            orderDirection: viewsSelectors.getActiveViewOrderDirection(state),
            selectedItemsIds: viewsSelectors.getSelectedItemsIds(state),
        }
    },
    {
        fetchViewItems: viewsActions.fetchViewItems,
        setOrderDirection: viewsActions.setOrderDirection,
    }
)

export default connector(HeaderCellContainer)
