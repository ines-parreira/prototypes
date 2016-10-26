import React, {PropTypes} from 'react'
import _ from 'lodash'
import classnames from 'classnames'
import TooltipWidgetEditField from '../forms/TooltipWidgetEditField'

class FieldInfobarWidget extends React.Component {
    constructor(props) {
        super(props)

        this.isEdited = false
    }

    componentWillReceiveProps(nextProps) {
        const {isEditing, editing, widget} = nextProps

        if (editing) {
            const tp = widget.get('templatePath')
            const currentlyEditedWidgetPath = editing.state.getIn(['_internal', 'currentlyEditedWidgetPath'], '')
            this.isEdited = isEditing && tp === currentlyEditedWidgetPath
        }
    }

    /**
     * Display label (before the value)
     * @param label
     * @returns {*}
     * @private
     */
    _displayLabel = (label) => {
        const defaultLabel = '-'

        if (_.isUndefined(label)) {
            return defaultLabel
        }

        if (_.isNull(label)) {
            return defaultLabel
        }

        if (_.isString(label) && !label) {
            return defaultLabel
        }

        return label
    }

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

    _deleteField = (e) => {
        const {editing} = this.props

        e.stopPropagation()
        if (editing) {
            const ap = this.props.widget.get('absolutePath')
            const tp = this.props.widget.get('templatePath')
            editing.actions.removeEditedWidget(tp, ap)
        }
    }

    /**
     * Render buttons of action for this field
     * @returns {*}
     * @private
     */
    _renderTools = () => {
        const {isEditing} = this.props

        if (!isEditing) {
            return null
        }

        return (
            <span className="tools">
                <i
                    className="red link remove icon"
                    onClick={this._deleteField}
                />
            </span>
        )
    }

    /**
     * Render tooltip of edition
     * @returns {JSX}
     * @private
     */
    _renderTooltip = () => {
        const {editing, widget} = this.props
        if (this.isEdited) {
            return (
                <TooltipWidgetEditField
                    widget={widget}
                    actions={editing.actions}
                />
            )
        }
    }

    render() {
        const {widget, value} = this.props

        const className = classnames('simple-field draggable', {
            edited: this.isEdited
        })

        return (
            <div
                className={className}
                onClick={this._startWidgetEdition}
            >
                <span className="field-label">
                    {widget.get('title')}:
                </span>
                <span className="field-value">
                    {this._displayLabel(value)}
                </span>
                {this._renderTools()}
                {this._renderTooltip()}
            </div>
        )
    }
}

FieldInfobarWidget.propTypes = {
    editing: PropTypes.object,
    value: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
        PropTypes.bool,
        PropTypes.object,
    ]).isRequired,
    widget: PropTypes.object.isRequired,
    isEditing: PropTypes.bool.isRequired,
    isParentList: PropTypes.bool.isRequired
}

FieldInfobarWidget.defaultProps = {
    isEditing: false,
    isParentList: false
}

export default FieldInfobarWidget
