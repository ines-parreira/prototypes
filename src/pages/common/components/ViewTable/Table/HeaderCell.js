import React from 'react'
import PropTypes from 'prop-types'
import ImmutablePropTypes from 'react-immutable-proptypes'
import {connect} from 'react-redux'
import {fromJS} from 'immutable'
import classnames from 'classnames'
import _noop from 'lodash/noop'

import {fieldPath as getFieldPath} from '../../../../../utils.ts'

import ShowMoreFieldsDropdown from '../ShowMoreFieldsDropdown.tsx'

import * as viewsActions from '../../../../../state/views/actions.ts'
import * as viewsSelectors from '../../../../../state/views/selectors.ts'

import * as viewsConfig from '../../../../../config/views'

@connect(
    (state, ownProps) => {
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
export default class HeaderCell extends React.Component {
    static propTypes = {
        ActionsComponent: PropTypes.func,
        activeView: ImmutablePropTypes.map.isRequired,
        config: ImmutablePropTypes.map.isRequired,
        fetchViewItems: PropTypes.func.isRequired,
        field: ImmutablePropTypes.map.isRequired,
        fields: ImmutablePropTypes.list.isRequired,
        isLast: PropTypes.bool.isRequired,
        isSearch: PropTypes.bool.isRequired,
        orderBy: PropTypes.string.isRequired,
        orderDirection: PropTypes.string.isRequired,
        selectedItemsIds: ImmutablePropTypes.list.isRequired,
        setOrderDirection: PropTypes.func.isRequired,
        type: PropTypes.string.isRequired,
    }

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
                        orderDirection === 'desc' ? 'asc' : 'desc'
                    setOrderDirection(fieldPath, newOrderDirection)
                    fetchViewItems()
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
