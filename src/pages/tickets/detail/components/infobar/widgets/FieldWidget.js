import React, {PropTypes} from 'react'
import TooltipWidgetEditField from '../forms/TooltipWidgetEditField'

class FieldWidget extends React.Component {
    _startWidgetEdition = (e) => {
        const {
            editing,
            widget
        } = this.props

        e.stopPropagation()
        if (editing) {
            editing.actions.startWidgetEdition(widget.get('templatePath', ''))
        }
    }

    _removeField = (e) => {
        const {editing} = this.props

        e.stopPropagation()
        if (editing) {
            const ap = this.props.widget.get('absolutePath')
            const tp = this.props.widget.get('templatePath')
            editing.actions.removeEditedWidget(tp, ap)
        }
    }

    _renderTools = () => {
        const {isEditing} = this.props
        if (!isEditing) {
            return null
        }
        return (
            <span style={{float: 'right'}}>
                <i
                    className="link write icon"
                    onClick={(e) => {
                        e.stopPropagation()
                    }}
                />
                <i
                    className="red link remove icon"
                    onClick={this._removeField}
                />
            </span>
        )
    }
    _renderTooltip = () => {
        const {isEditing, editing, widget} = this.props
        const tp = widget.get('templatePath')
        if (isEditing && tp === editing._internal.get('currentlyEditedWidgetPath', '')) {
            return (
                <TooltipWidgetEditField
                    widget={widget}
                    actions={editing.actions}
                />
            )
        }
        return null
    }

    render() {
        const {widget, value} = this.props

        return (
            <div
                className="simple-field"
                onClick={this._startWidgetEdition}
            >
                <span className="field-label">
                    {widget.get('title')}:
                </span>
                <span className="field-value">
                    {value || '-'}
                </span>
                {this._renderTools()}
                {this._renderTooltip()}
            </div>
        )
    }
}

FieldWidget.propTypes = {
    editing: PropTypes.object,
    value: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
        PropTypes.object,
    ]).isRequired,
    widget: PropTypes.object.isRequired,
    isEditing: PropTypes.bool.isRequired,
    isParentList: PropTypes.bool.isRequired
}

FieldWidget.defaultProps = {
    isEditing: false,
    isParentList: false
}

export default FieldWidget
