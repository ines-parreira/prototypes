import React, {PropTypes} from 'react'
import classnames from 'classnames'
import TooltipWidgetEditField from '../forms/TooltipWidgetEditField'

import {displayLabel} from '../utils'

class FieldInfobarWidget extends React.Component {
    constructor(props) {
        super(props)

        this.isEdited = false
    }

    componentWillReceiveProps(nextProps) {
        const {isEditing, editing, template} = nextProps

        if (editing) {
            const tp = template.get('templatePath')
            const currentlyEditedWidgetPath = editing.state.getIn(['_internal', 'currentlyEditedWidgetPath'], '')
            this.isEdited = isEditing && tp === currentlyEditedWidgetPath
        }
    }

    _startWidgetEdition = (e) => {
        const {editing, template} = this.props

        e.stopPropagation()
        if (editing) {
            editing.actions.startWidgetEdition(template.get('templatePath', ''))
        }
    }

    _deleteField = (e) => {
        const {editing, template} = this.props

        e.stopPropagation()
        if (editing) {
            const ap = template.get('absolutePath')
            const tp = template.get('templatePath')
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
        const {editing, template} = this.props
        if (this.isEdited) {
            return (
                <TooltipWidgetEditField
                    template={template}
                    actions={editing.actions}
                />
            )
        }
    }

    render() {
        const {template, value} = this.props

        const className = classnames('simple-field draggable', {
            edited: this.isEdited
        })

        return (
            <div
                className={className}
                onClick={this._startWidgetEdition}
            >
                <span className="field-label">
                    {template.get('title')}:
                </span>
                <span className="field-value">
                    {displayLabel(value)}
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
    template: PropTypes.object.isRequired,
    isEditing: PropTypes.bool.isRequired,
    isParentList: PropTypes.bool.isRequired
}

FieldInfobarWidget.defaultProps = {
    isEditing: false,
    isParentList: false
}

export default FieldInfobarWidget
