import React, {SyntheticEvent} from 'react'
import classnames from 'classnames'
import _uniqueId from 'lodash/uniqueId'
import {Popover, PopoverBody} from 'reactstrap'
import {Map} from 'immutable'

import {displayValue} from 'pages/common/components/infobar/utils'
import {WidgetsActionsType} from 'pages/common/components/infobar/Infobar/Infobar'
import {Editing} from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarCustomerInfo'
import FieldEdit from './forms/FieldEdit'
import css from './Field.less'
import {Copy} from './CopyButton'

type Props = {
    editing?: Editing
    value: (string | number | boolean | Record<string, unknown>)[] | unknown
    type: string
    isEditing: boolean
    isParentList: boolean
    widget: Map<string, unknown>
    template: Map<string, unknown>
    copyableValue: string | null
}

export default class Field extends React.Component<
    Props,
    {displayPopup: boolean}
> {
    uniqueId: string

    static defaultProps = {
        isEditing: false,
        isParentList: false,
    }

    state = {
        displayPopup: false,
    }

    constructor(props: Props) {
        super(props)

        this.uniqueId = _uniqueId('field-widget-')
    }

    componentWillReceiveProps(nextProps: Props) {
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

    _startWidgetEdition = (e: SyntheticEvent) => {
        const {editing, template} = this.props

        e.stopPropagation()
        if (editing) {
            editing.actions.startWidgetEdition(
                template.get('templatePath', '') as string
            )
        }
    }

    _deleteField = (e: SyntheticEvent) => {
        const {editing, template} = this.props

        e.stopPropagation()
        if (editing) {
            const ap = template.get('absolutePath') as string[]
            const tp = template.get('templatePath') as string
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
        return this.props.editing?.actions?.stopWidgetEdition()
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
                        actions={editing.actions as WidgetsActionsType}
                        widget={widget}
                    />
                </PopoverBody>
            </Popover>
        )
    }

    render() {
        const {editing, isEditing, template, value, type, copyableValue} =
            this.props

        const title = template.get('title') as string
        // keep the unscoped class here to have drag and drop greying feature
        const className = classnames(
            `${css.widgetField} widget-field draggable`,
            {
                [css.widgetFieldEditing]: editing,
            }
        )

        return (
            <div id={this.uniqueId} className={className}>
                <span className={css.widgetFieldLabel}>{title}:</span>
                <span
                    className={classnames(css.widgetFieldValue, {
                        [css.overflow]: type === 'editableList',
                    })}
                >
                    {displayValue(value)}
                    {!isEditing && copyableValue && (
                        <Copy
                            value={copyableValue}
                            className={css.copyButton}
                            name={title}
                            onCopyMessage={`${title} copied to clipboard`}
                        />
                    )}
                </span>
                {this._renderTools()}
                {this._renderPopover()}
            </div>
        )
    }
}
