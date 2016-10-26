import React, {PropTypes} from 'react'
import {browserHistory} from 'react-router'
import ComplexTableCell from './ComplexTableCell'

export default class ComplexTableRow extends React.Component {
    _handleClick = () => {
        this.props.saveIndex()
        browserHistory.push(`/app/${this.props.viewConfig.routeItem}/${this.props.item.get('id')}`)
    }

    _toggleSelection = (e, id) => {
        e.stopPropagation()
        this.props.toggleSelection(id)
    }

    render() {
        // const style = {maxWidth: this.props.width}
        const {fields, item, currentUser, selected, hasBulkActions} = this.props

        return (
            <tr onClick={this._handleClick}>
                {
                    hasBulkActions
                    && (
                        <td onClick={e => this._toggleSelection(e, item.get('id'))}>
                            <span className="ui checkbox">
                                <input
                                    type="checkbox"
                                    checked={selected}
                                />
                                <label />
                            </span>
                        </td>
                    )
                }
                {
                    fields
                        .map((field) => (
                            <ComplexTableCell
                                key={`${item.id}-${field.get('name')}`}
                                item={item}
                                currentUser={currentUser}
                                field={field}
                            />
                        ))
                }
                <td></td>
            </tr>
        )
    }
}

ComplexTableRow.propTypes = {
    viewConfig: PropTypes.object.isRequired,
    item: PropTypes.object.isRequired,
    fields: PropTypes.object.isRequired,
    currentUser: PropTypes.object.isRequired,
    toggleSelection: PropTypes.func.isRequired,
    selected: PropTypes.bool.isRequired,
    saveIndex: PropTypes.func.isRequired,
    hasBulkActions: PropTypes.bool.isRequired,
}
