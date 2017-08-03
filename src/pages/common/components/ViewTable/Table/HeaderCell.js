import React, {PropTypes} from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'
import {connect} from 'react-redux'
import {fromJS} from 'immutable'
import classnames from 'classnames'
import _noop from 'lodash/noop'

import {fieldPath as getFieldPath} from '../../../../../utils'

import ShowMoreFieldsDropdown from '../ShowMoreFieldsDropdown'

import * as viewsActions from '../../../../../state/views/actions'
import * as viewsSelectors from '../../../../../state/views/selectors'

import * as viewsConfig from '../../../../../config/views'

@connect((state, ownProps) => {
    return {
        activeView: viewsSelectors.getActiveView(state),
        config: viewsConfig.getConfigByName(ownProps.type),
        orderBy: viewsSelectors.getActiveViewOrderBy(state),
        orderDirection: viewsSelectors.getActiveViewOrderDirection(state),
        selectedItemsIds: viewsSelectors.getSelectedItemsIds(state),
    }
}, {
    fetchPage: viewsActions.fetchPage,
    setOrderDirection: viewsActions.setOrderDirection,
})
export default class HeaderCell extends React.Component {
    static propTypes = {
        ActionsComponent: PropTypes.func,
        activeView: ImmutablePropTypes.map.isRequired,
        config: ImmutablePropTypes.map.isRequired,
        fetchPage: PropTypes.func.isRequired,
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
        let className = 'fa fa-fw fa-sort'

        if (isOrderingField) {
            className = classnames('fa fa-fw', {
                'fa-sort-desc': orderDirection === 'desc',
                'fa-sort-asc': orderDirection === 'asc',
            })
        }

        return <i className={className} />
    }

    render() {
        const {
            ActionsComponent,
            config,
            fetchPage,
            field,
            fields,
            isLast,
            isSearch,
            orderBy,
            orderDirection,
            setOrderDirection
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
                    const newOrderDirection = orderDirection === 'desc' ? 'asc' : 'desc'
                    setOrderDirection(fieldPath, newOrderDirection)
                    fetchPage(1)
                }
            }
        }

        return (
            <td>
                <div>
                    <div className="cell-wrapper">
                        {
                            isMainField ? (
                                    ActionsComponent && (
                                        <ActionsComponent
                                            view={this.props.activeView}
                                            selectedItemsIds={this.props.selectedItemsIds}
                                        />
                                    )
                                ) : (
                                    <div
                                        onClick={onClick}
                                        className={classnames({
                                            clickable: action === 'sort',
                                        })}
                                    >
                                        <span>
                                            {field.get('title')}
                                        </span>
                                        {
                                            action === 'sort' && this._renderOrderIcon(fieldPath === orderBy)
                                        }
                                    </div>
                                )
                        }
                    </div>
                    {
                        isLast && !isSearch && (
                            <ShowMoreFieldsDropdown
                                config={config}
                                fields={config.get('fields', fromJS([]))}
                                visibleFields={fields}
                            />
                        )
                    }
                </div>
            </td>
        )
    }
}
