import React, {PropTypes} from 'react'
import {fromJS} from 'immutable'
import ComplexTableRow from './ComplexTableRow'
import ColumnHeader from './ColumnHeaderWrapper'
import ShowMoreFieldsDropdown from './ShowMoreFieldsDropdown'
import SemanticPaginator from '../SemanticPaginator'
import {Loader} from '../Loader'

export default class ComplexTable extends React.Component {
    _toggleSelectAll = () => {
        const itemsIds = this.props.items.map(item => item.get('id'))
        this.props.toggleSelection(itemsIds, true)
    }

    render() {
        const {view, views, viewConfig, items, currentUser, fields, style, hasBulkActions} = this.props
        const isLoading = views.getIn(['_internal', 'loading', 'fetchList'])

        // if loading => show message
        if (isLoading) {
            return (
                <div className="complex-list complex-list-limited" style={style}>
                    <div>
                        <Loader
                            loading={isLoading}
                        />
                    </div>
                </div>
            )
        }

        // if empty view or view fields => show message
        if (items.isEmpty() || fields.isEmpty()) {
            let message = <p>This view is empty. Enjoy your day!</p>

            if (view.get('dirty')) {
                message = <p>No {viewConfig.singular} found.<br /><a onClick={this.props.resetView}>Reset view</a></p>
            }

            return (
                <div className="complex-list complex-list-limited" style={style}>
                    <div>
                        <Loader
                            message={message}
                            loading={false}
                        />
                    </div>
                </div>
            )
        }

        // temporary remove priority from available fields
        const displayedFields = fields.filter((f) => f.get('visible', false)).filter(f => f.get('name') !== 'priority')
        const updatedView = view.set('fields', view.get('fields').filter(f => f.get('name') !== 'priority'))

        const selectedItemsIds = views.getIn(['_internal', 'selectedItemsIds'], fromJS([]))
        const checked = items.size === selectedItemsIds.size

        return (
            <div className="complex-list-table" style={style}>
                <table className="ui selectable very basic table">
                    <thead>
                        <tr>
                            {
                                hasBulkActions
                                && (
                                    <th
                                        style={{cursor: 'pointer'}}
                                        onClick={this._toggleSelectAll}
                                    >
                                        <span className="ui checkbox">
                                            <input
                                                type="checkbox"
                                                ref="toggleSelection"
                                                checked={checked}
                                            />
                                            <label />
                                        </span>
                                    </th>
                                )
                            }
                            {
                                displayedFields
                                    .map((field) => (
                                        <ColumnHeader
                                            key={field.get('name')}
                                            viewConfig={viewConfig}
                                            field={field}
                                            view={updatedView}
                                            schemas={this.props.schemas}
                                            updateView={this.props.updateView}
                                            addFieldFilter={this.props.addFieldFilter}
                                            updateFieldEnumSearch={this.props.updateFieldEnumSearch}
                                            timezone={currentUser.get('timezone')}
                                        />
                                    ))
                            }
                            <ShowMoreFieldsDropdown view={updatedView} />
                        </tr>
                    </thead>
                    <tbody>
                    {
                        items
                            .map((item, index) => (
                                <ComplexTableRow
                                    hasBulkActions={hasBulkActions}
                                    viewConfig={viewConfig}
                                    key={item.get('id')}
                                    fields={displayedFields}
                                    item={item}
                                    currentUser={currentUser}
                                    toggleSelection={this.props.toggleSelection}
                                    selected={selectedItemsIds.includes(item.get('id'))}
                                    saveIndex={() => this.props.saveIndex(index)}
                                />
                            ))
                    }
                    </tbody>
                </table>

                <SemanticPaginator
                    page={views.getIn(['_internal', 'pagination', 'page'])}
                    totalPages={views.getIn(['_internal', 'pagination', 'nb_pages'])}
                    onChange={(page) => this.props.setPage(page)}
                    radius={1}
                    anchor={2}
                />
            </div>
        )
    }
}

ComplexTable.propTypes = {
    views: PropTypes.object.isRequired,
    viewConfig: PropTypes.object.isRequired,
    items: PropTypes.object.isRequired,
    view: PropTypes.object.isRequired,
    fields: PropTypes.object.isRequired,
    schemas: PropTypes.object.isRequired,
    currentUser: PropTypes.object.isRequired,

    resetView: PropTypes.func.isRequired,
    updateView: PropTypes.func.isRequired,
    addFieldFilter: PropTypes.func.isRequired,
    updateFieldEnumSearch: PropTypes.func.isRequired,
    setPage: PropTypes.func.isRequired,

    saveIndex: PropTypes.func.isRequired,

    toggleSelection: PropTypes.func.isRequired,
    hasBulkActions: PropTypes.bool.isRequired,

    style: PropTypes.object.isRequired
}

ComplexTable.defaultProps = {
    items: fromJS([]),
    view: fromJS({}),
    views: fromJS({}),
    schemas: fromJS({}),
    currentUser: fromJS({}),
    hasBulkActions: false
}
