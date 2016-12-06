import React, {PropTypes} from 'react'
import {Link} from 'react-router'
import ComplexTableCell from './ComplexTableCell'

export default class ComplexTableRow extends React.Component {
    _toggleSelection = (e, id) => {
        e.preventDefault()
        e.stopPropagation()
        this.props.toggleSelection(id)
    }

    render() {
        // const style = {maxWidth: this.props.width}
        const {fields, item, selected, viewConfig, hasBulkActions} = this.props

        return (
            <Link
                to={`/app/${this.props.viewConfig.routeItem}/${this.props.item.get('id')}`}
                className="complex-list-table-row"
            >
                {
                    hasBulkActions
                    && (
                        <div className="complex-list-table-col" onClick={e => this._toggleSelection(e, item.get('id'))}>
                            <span className="ui checkbox">
                                <input
                                    type="checkbox"
                                    checked={selected}
                                />
                                <label />
                            </span>
                        </div>
                    )
                }
                {
                    fields
                        .map((field) => (
                            <ComplexTableCell
                                key={`${item.id}-${field.get('name')}`}
                                item={item}
                                field={field}
                                viewType={viewConfig.type}
                            />
                        ))
                }
                <div className="complex-list-table-col"></div>
            </Link>
        )
    }
}

ComplexTableRow.propTypes = {
    viewConfig: PropTypes.object.isRequired,
    item: PropTypes.object.isRequired,
    fields: PropTypes.object.isRequired,
    toggleSelection: PropTypes.func.isRequired,
    selected: PropTypes.bool.isRequired,
    saveIndex: PropTypes.func.isRequired,
    hasBulkActions: PropTypes.bool.isRequired,
}
