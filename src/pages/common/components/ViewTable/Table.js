import React, {PropTypes} from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'
import {fromJS} from 'immutable'
import classnames from 'classnames'
import {connect} from 'react-redux'
import {Loader} from '../Loader'
import BlankState from '../BlankState'
import SemanticPaginator from '../SemanticPaginator'

import Row from './Table/Row'
import HeaderCell from './Table/HeaderCell'

import * as viewsActions from '../../../../state/views/actions'
import * as viewsSelectors from '../../../../state/views/selectors'

import css from './Table.less'

class Table extends React.Component {
    static propTypes = {
        activeView: ImmutablePropTypes.map.isRequired,
        config: ImmutablePropTypes.map.isRequired,
        fetchPage: PropTypes.func.isRequired,
        fields: ImmutablePropTypes.list.isRequired,
        isEditMode: PropTypes.bool.isRequired,
        isLoading: PropTypes.func.isRequired,
        isSearch: PropTypes.bool.isRequired,
        items: ImmutablePropTypes.list.isRequired,
        pagination: ImmutablePropTypes.map.isRequired,
        resetView: PropTypes.func.isRequired,
        selectedItemsIds: ImmutablePropTypes.list.isRequired,
        toggleSelection: PropTypes.func.isRequired,
        type: PropTypes.string.isRequired,
    }

    static defaultProps = {
        items: fromJS([]),
        type: 'ticket',
    }

    _toggleSelectAll = () => {
        const itemsIds = this.props.items.map(item => item.get('id'))
        this.props.toggleSelection(itemsIds, true)
    }

    render() {
        const {
            activeView,
            config,
            isEditMode,
            isLoading,
            isSearch,
            items,
            fields,
            pagination,
            selectedItemsIds,
            type,
        } = this.props

        if (isLoading('fetchList')) {
            return <Loader loading />
        }

        // if empty view or view fields => show message
        if (items.isEmpty()) {
            let message

            // if view is being modified, which resulted in an empty list
            if (activeView.get('dirty')) {
                message = (
                    <p>
                        No {config.get('singular')} found.
                        <br />
                        {
                            !isSearch && (
                                <a
                                    onClick={() => {
                                        this.props.resetView(config.get('name'))
                                        this.props.fetchPage(1)
                                    }}
                                >
                                    Reset view
                                </a>
                            )
                        }
                    </p>
                )
            }

            return <BlankState message={message} />
        }

        const areAllSelected = items.size === selectedItemsIds.size

        return (
            <div>
                <table className={classnames(css.table, 'main-table view-table')}>
                    <thead>
                        <tr>
                            {
                                !isEditMode && (
                                    <td
                                        className="cell-wrapper cell-short clickable"
                                        onClick={this._toggleSelectAll}
                                    >
                                        <span className="ui checkbox">
                                            <input
                                                type="checkbox"
                                                checked={areAllSelected}
                                            />
                                            <label />
                                        </span>
                                    </td>
                                )
                            }
                            {
                                fields.map((field, index) => {
                                    return (
                                        <HeaderCell
                                            key={field.get('name')}
                                            field={field}
                                            fields={fields}
                                            type={type}
                                            isLast={fields.size === index + 1}
                                            isSearch={isSearch}
                                        />
                                    )
                                })
                            }
                        </tr>
                    </thead>
                    <tbody>
                        {
                            items.map((item) => {
                                const id = item.get('id')

                                return (
                                    <Row
                                        key={id}
                                        canSelectItem={!isEditMode}
                                        fields={fields}
                                        item={item}
                                        isSelected={selectedItemsIds.includes(id)}
                                        type={type}
                                    />
                                )
                            })
                        }
                    </tbody>
                </table>

                <SemanticPaginator
                    page={pagination.get('page')}
                    totalPages={pagination.get('nb_pages')}
                    onChange={(page) => this.props.fetchPage(page)}
                    radius={1}
                    anchor={2}
                />
            </div>
        )
    }
}

const mapStateToProps = (state, ownProps) => {
    return {
        activeView: viewsSelectors.getActiveView(state),
        config: viewsSelectors.getViewConfig(ownProps.type),
        isEditMode: viewsSelectors.isEditMode(state),
        isLoading: viewsSelectors.makeIsLoading(state),
        pagination: viewsSelectors.getPagination(state),
        selectedItemsIds: viewsSelectors.getSelectedItemsIds(state),
    }
}

const mapDispatchToProps = {
    fetchPage: viewsActions.fetchPage,
    toggleSelection: viewsActions.toggleSelection,
    resetView: viewsActions.resetView,
}

export default connect(mapStateToProps, mapDispatchToProps)(Table)

