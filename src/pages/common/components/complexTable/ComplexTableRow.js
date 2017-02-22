import React, {PropTypes} from 'react'
import classnames from 'classnames'
import ComplexTableCell from './ComplexTableCell'
import {Link} from 'react-router'

export default class ComplexTableRow extends React.Component {
    _toggleSelection = () => {
        this.props.toggleSelection(this.props.item.get('id'))
    }

    render() {
        // const style = {maxWidth: this.props.width}
        const {fields, item, selected, viewConfig, saveIndex, hasBulkActions} = this.props
        const link = `/app/${viewConfig.routeItem}/${item.get('id')}`

        return (
            <div
                className={classnames('complex-list-table-row', {
                    highlighted: item.get('is_unread'),
                })}
            >
                {
                    hasBulkActions
                    && (
                        <div
                            className="complex-list-table-col"
                            onClick={this._toggleSelection}
                        >
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
                                link={link}
                                saveIndex={saveIndex}
                                item={item}
                                field={field}
                                viewType={viewConfig.type}
                            />
                        ))
                }
                {/* empty link to make the "show more field" column clickable */}
                <Link
                    to={link}
                    onClick={saveIndex}
                    className="complex-list-table-col"
                />
            </div>
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
