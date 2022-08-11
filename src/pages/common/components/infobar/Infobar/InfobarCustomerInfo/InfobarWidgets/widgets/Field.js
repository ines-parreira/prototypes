import React from 'react'
import PropTypes from 'prop-types'
import classnames from 'classnames'
import _uniqueId from 'lodash/uniqueId'
import {Popover, PopoverBody} from 'reactstrap'

import FieldEdit from './forms/FieldEdit'
import css from './Field.less'

import {displayValue} from 'pages/common/components/infobar/utils.tsx'

export default class Field extends React.Component {
    static propTypes = {
        editing: PropTypes.object,
        value: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.number,
            PropTypes.bool,
            PropTypes.object,
        ]).isRequired,
        type: PropTypes.string.isRequired,
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
            <span className={css.widgetFieldTools}>
                <i
                    className={`material-icons ${css.widgetFieldToolIcon}`}
                    onClick={this._startWidgetEdition}
                >
                    edit
                </i>
                <i
                    className={`material-icons text-danger ${css.widgetFieldToolIcon}`}
                    onClick={this._deleteField}
                >
                    delete
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
                    <FieldEdit
                        template={template}
                        actions={editing.actions}
                        widget={widget}
                    />
                </PopoverBody>
            </Popover>
        )
    }

    render() {
        const {editing, template, value, type} = this.props
        // keep the unscoped class here to have drag and drop greying feature
        const className = classnames(
            `${css.widgetField} widget-field draggable`,
            {
                [css.widgetFieldEditing]: editing,
            }
        )

        return (
            <div id={this.uniqueId} className={className}>
                <span className={css.widgetFieldLabel}>
                    {template.get('title')}:
                </span>
                <span
                    className={classnames(css.widgetFieldValue, {
                        [css.overflow]: type === 'editableList',
                    })}
                >
                    {displayValue(value)}
                </span>
                {this._renderTools()}
                {this._renderPopover()}
            </div>
        )
    }
}
