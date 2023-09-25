import React, {SyntheticEvent} from 'react'
import classnames from 'classnames'
import _uniqueId from 'lodash/uniqueId'
import {Popover, PopoverBody} from 'reactstrap'
import {connect, ConnectedProps} from 'react-redux'
import {Map} from 'immutable'

import {RootState} from 'state/types'
import {
    removeEditedWidget,
    startWidgetEdition,
    stopWidgetEdition,
} from 'state/widgets/actions'

import FieldEdit from './forms/FieldEdit'
import css from './Field.less'
import {Copy} from './CopyButton'

type Props = {
    value: (string | number | boolean | Record<string, unknown>)[] | unknown
    type: string
    isEditing: boolean
    isParentList: boolean
    widget: Map<string, unknown>
    template: Map<string, unknown>
    copyableValue: string | null
} & ConnectedProps<typeof connector>

export class Field extends React.Component<Props, {displayPopup: boolean}> {
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
        const {isEditing, template, widgetsState} = nextProps

        if (isEditing) {
            const tp = template.get('templatePath')
            const currentlyEditedWidgetPath = widgetsState.getIn(
                ['_internal', 'currentlyEditedWidgetPath'],
                ''
            )
            this.setState({
                displayPopup: isEditing && tp === currentlyEditedWidgetPath,
            })
        }
    }

    _startWidgetEdition = (e: SyntheticEvent) => {
        const {dispatch, isEditing, template} = this.props

        e.stopPropagation()
        if (isEditing) {
            dispatch(
                startWidgetEdition(template.get('templatePath', '') as string)
            )
        }
    }

    _deleteField = (e: SyntheticEvent) => {
        const {dispatch, isEditing, template} = this.props

        e.stopPropagation()
        if (isEditing) {
            const ap = template.get('absolutePath') as string[]
            const tp = template.get('templatePath') as string
            dispatch(removeEditedWidget(tp, ap))
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
        return this.props.dispatch(stopWidgetEdition())
    }

    /**
     * Render tooltip of edition
     * @returns {JSX}
     * @private
     */
    _renderPopover = () => {
        const {isEditing, template, widget} = this.props

        if (!isEditing) {
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
                    <FieldEdit template={template} widget={widget} />
                </PopoverBody>
            </Popover>
        )
    }

    render() {
        const {isEditing, template, value, type, copyableValue} = this.props

        const title = template.get('title') as string
        // keep the unscoped class here to have drag and drop greying feature
        const className = classnames(
            `${css.widgetField} widget-field draggable`,
            {
                [css.widgetFieldEditing]: isEditing,
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
                    {value}
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

const connector = connect((state: RootState) => ({
    widgetsState: state.widgets,
}))

export default connector(Field)
