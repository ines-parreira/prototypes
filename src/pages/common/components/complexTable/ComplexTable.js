import React, {PropTypes} from 'react'
import {fromJS} from 'immutable'
import ComplexTableRow from './ComplexTableRow'
import ColumnHeaderWrapper from './ColumnHeaderWrapper'
import ShowMoreFieldsDropdown from './ShowMoreFieldsDropdown'
import SemanticPaginator from '../SemanticPaginator'
import {Loader} from '../Loader'
import {viewFields} from '../../../../utils'

export default class ComplexTable extends React.Component {
    _toggleSelectAll = () => {
        const itemsIds = this.props.items.map(item => item.get('id'))
        this.props.toggleSelection(itemsIds, true)
    }

    render() {
        const {view, views, viewConfig, items, fields, style, hasBulkActions} = this.props
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
        if (items.isEmpty()) {
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

        const displayedFields = fields.filter(f => view.get('fields', fromJS([])).contains(f.get('name')))

        const selectedItemsIds = views.getIn(['_internal', 'selectedItemsIds'], fromJS([]))
        const allItemsChecked = items.size === selectedItemsIds.size

        return (
            <div className="complex-list-content" style={style}>
                <div className="complex-list-table ui selectable very basic table">
                    <div className="complex-list-table-row complex-list-table-header">
                        {
                            hasBulkActions
                            && (
                                <div
                                    className="complex-list-table-col"
                                    style={{cursor: 'pointer'}}
                                    onClick={this._toggleSelectAll}
                                >
                                    <span className="ui checkbox">
                                        <input
                                            type="checkbox"
                                            ref="toggleSelection"
                                            checked={allItemsChecked}
                                        />
                                        <label />
                                    </span>
                                </div>
                            )
                        }
                        {
                            displayedFields
                                .map((field) => (
                                    <ColumnHeaderWrapper
                                        key={field.get('name')}
                                        viewConfig={viewConfig}
                                        field={field}
                                        view={view}
                                        schemas={this.props.schemas}
                                        updateView={this.props.updateView}
                                        addFieldFilter={this.props.addFieldFilter}
                                    />
                                ))
                        }
                        <ShowMoreFieldsDropdown
                            fields={viewFields(view.get('type'))}
                            visibleFields={view.get('fields', fromJS([]))}
                        />
                    </div>
                    <div className="complex-list-table-body">
                        {
                            items
                                .map((item, index) => (
                                    <ComplexTableRow
                                        hasBulkActions={hasBulkActions}
                                        viewConfig={viewConfig}
                                        key={item.get('id')}
                                        fields={displayedFields}
                                        item={item}
                                        toggleSelection={this.props.toggleSelection}
                                        selected={selectedItemsIds.includes(item.get('id'))}
                                        saveIndex={() => this.props.saveIndex(index)}
                                    />
                                ))
                        }
                    </div>
                </div>

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

    resetView: PropTypes.func.isRequired,
    updateView: PropTypes.func.isRequired,
    addFieldFilter: PropTypes.func.isRequired,
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
    hasBulkActions: false
}
