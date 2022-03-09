import React from 'react'
import PropTypes from 'prop-types'
import classnames from 'classnames'
import _uniqueId from 'lodash/uniqueId'
import {Popover, PopoverBody} from 'reactstrap'

import {displayLabel} from '../../../../utils.tsx'

import WidgetFieldEdit from './forms/WidgetFieldEdit'

export default class FieldInfobarWidget extends React.Component {
    static propTypes = {
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
        isParentList: PropTypes.bool.isRequired,
    }

    static defaultProps = {
        isEditing: false,
        isParentList: false,
    }

    state = {
        displayPopup: false,
    }

    constructor(props) {
        super(props)

        this.uniqueId = _uniqueId('field-widget-')
    }

    componentWillReceiveProps(nextProps) {
        const {isEditing, editing, template} = nextProps

        if (editing) {
            const tp = template.get('templatePath')
            const currentlyEditedWidgetPath = editing.state.getIn(
                ['_internal', 'currentlyEditedWidgetPath'],
                ''
            )
            this.setState({
                displayPopup: isEditing && tp === currentlyEditedWidgetPath,
            })
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
                    className="material-icons text-danger clickable"
                    onClick={this._deleteField}
                >
                    close
                </i>
            </span>
        )
    }

    _togglePopup = () => {
        return this.props.editing.actions.stopWidgetEdition()
    }

    /**
     * Render tooltip of edition
     * @returns {JSX}
     * @private
     */
    _renderPopover = () => {
        const {editing, template, widget} = this.props

        if (!editing) {
            return null
        }

        return (
            <Popover
                placement="left"
                isOpen={this.state.displayPopup}
                target={this.uniqueId}
                toggle={this._togglePopup}
                trigger="legacy"
            >
                <PopoverBody>
                    <WidgetFieldEdit
                        template={template}
                        actions={editing.actions}
                        widget={widget}
                    />
                </PopoverBody>
            </Popover>
        )
    }

    render() {
        const {template, value} = this.props

        const className = classnames('simple-field draggable', {
            edited: this.state.displayPopup,
        })

        return (
            <div
                id={this.uniqueId}
                className={className}
                onClick={this._startWidgetEdition}
            >
                <span className="field-label">{template.get('title')}:</span>
                <span className="field-value">{displayLabel(value)}</span>
                {this._renderTools()}
                {this._renderPopover()}
            </div>
        )
    }
}
