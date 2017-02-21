import React, {PropTypes} from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'
import {connect} from 'react-redux'
import {fromJS} from 'immutable'
import classnames from 'classnames'
import _noop from 'lodash/noop'

import {fieldPath as getFieldPath} from '../../../../../utils'

import FilterDropdown from '../FilterDropdown'
import ShowMoreFieldsDropdown from '../ShowMoreFieldsDropdown'

import * as viewsActions from '../../../../../state/views/actions'
import * as viewsSelectors from '../../../../../state/views/selectors'

class HeaderCell extends React.Component {
    static propTypes = {
        addFieldFilter: PropTypes.func.isRequired,
        config: ImmutablePropTypes.map.isRequired,
        fetchPage: PropTypes.func.isRequired,
        field: ImmutablePropTypes.map.isRequired,
        fields: ImmutablePropTypes.list.isRequired,
        isLast: PropTypes.bool.isRequired,
        orderBy: PropTypes.string.isRequired,
        orderDirection: PropTypes.string.isRequired,
        setOrderDirection: PropTypes.func.isRequired,
        type: PropTypes.string.isRequired,
    }

    state = {
        showFilters: false,
    }

    _showFilters = (state) => {
        this.setState({showFilters: state})
    }

    _renderOrderIcon = (isOrderingField = false) => {
        const {orderDirection} = this.props
        let className = 'icon sort'

        if (isOrderingField) {
            className = classnames(className, {
                'caret down': orderDirection === 'desc',
                'caret up': orderDirection === 'asc',
            })
        }

        return <i className={className} />
    }

    render() {
        const {config, fetchPage, field, fields, isLast, orderBy, orderDirection, setOrderDirection} = this.props

        const fieldPath = getFieldPath(field)

        let action = ''
        let onClick = _noop

        if (field.get('filter')) {
            action = field.getIn(['filter', 'sort']) ? 'sort' : 'filter'

            if (action === 'filter') {
                onClick = () => this._showFilters(!this.state.showFilters)
            } else if (action === 'sort') {
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
                        <div
                            onClick={onClick}
                            className={classnames({
                                clickable: !!action,
                            })}
                        >
                            <span
                                className={classnames({
                                    filterable: action === 'filter',
                                })}
                            >
                                {field.get('title')}
                            </span>
                            {
                                action === 'sort' && this._renderOrderIcon(fieldPath === orderBy)
                            }
                        </div>
                        {
                            action === 'filter'
                            && this.state.showFilters
                            && (
                                <FilterDropdown
                                    viewConfig={config}
                                    field={field}
                                    addFieldFilter={this.props.addFieldFilter}
                                    onClose={() => this._showFilters(false)}
                                    onAdd={() => fetchPage(1)}
                                />
                            )
                        }
                    </div>
                    {
                        isLast && (
                            <ShowMoreFieldsDropdown
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

const mapStateToProps = (state, ownProps) => {
    return {
        config: viewsSelectors.getViewConfig(ownProps.type),
        orderBy: viewsSelectors.getActiveViewOrderBy(state),
        orderDirection: viewsSelectors.getActiveViewOrderDirection(state),
    }
}

const mapDispatchToProps = {
    addFieldFilter: viewsActions.addFieldFilter,
    fetchPage: viewsActions.fetchPage,
    setOrderDirection: viewsActions.setOrderDirection,
}

export default connect(mapStateToProps, mapDispatchToProps)(HeaderCell)
