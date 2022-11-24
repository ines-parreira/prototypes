import React, {Component} from 'react'
import {fromJS, List, Map} from 'immutable'
import classnames from 'classnames'
import _debounce from 'lodash/debounce'
import {connect, ConnectedProps} from 'react-redux'

import {FORM_CONTENT_TYPE} from 'config'
import {getIconFromActionType} from 'models/macroAction/helpers'
import {MacroActionName} from 'models/macroAction/types'
import CheckBox from 'pages/common/forms/CheckBox'
import InputField from 'pages/common/forms/input/InputField'
import Caption from 'pages/common/forms/Caption/Caption'
import Label from 'pages/common/forms/Label/Label'
import NumberInput from 'pages/common/forms/input/NumberInput'
import SelectField from 'pages/common/forms/SelectField/SelectField'
import AddInternalNoteAction from 'pages/tickets/common/macros/components/actions/AddInternalNoteAction'
import SnoozeTicketAction from 'pages/tickets/common/macros/components/actions/SnoozeTicketAction'
import SetAssigneeAction from 'pages/tickets/common/macros/components/actions/SetAssigneeAction'
import SetStatusAction from 'pages/tickets/common/macros/components/actions/SetStatusAction'
import AddTagsAction from 'pages/tickets/common/macros/components/actions/AddTagsAction'
import ResponseAction from 'pages/tickets/common/macros/components/actions/ResponseAction'
import {updateActionArgsOnApplied} from 'state/ticket/actions'
import {getActionTemplate} from 'utils'

import css from './TicketReplyAction.less'

type Props = {
    action: Map<any, any>
    index: number
    remove?: (actionIndex: number, ticketId: number) => void
    ticketId: number
    disabled?: boolean
} & ConnectedProps<typeof connector>

type State = {
    currentArguments: Map<any, any>
}

export class TicketReplyActionContainer extends Component<Props, State> {
    state: State = {
        currentArguments: this.props.action.get('arguments', fromJS({})),
    }

    componentDidUpdate(prevProps: Props, prevState: State) {
        const {index, ticketId} = this.props
        const {currentArguments} = this.state

        if (prevState.currentArguments !== currentArguments) {
            this.debouncedUpdateActionArgs(index, currentArguments, ticketId)
        }
    }

    getAction = () => {
        const {action} = this.props
        const {currentArguments} = this.state

        return action.get('arguments') === currentArguments
            ? action
            : action.set('arguments', currentArguments)
    }

    debouncedUpdateActionArgs = _debounce(
        this.props.updateActionArgsOnApplied,
        200
    )

    setListDictValue = (
        arg: Map<any, any>,
        value: number | string | boolean,
        category: string
    ) => {
        const action = this.getAction()
        const index = (
            action.getIn(['arguments', category]) as List<any>
        ).indexOf(arg)

        const newValue = (
            action.get('arguments', fromJS({})) as Map<any, any>
        ).setIn([category, index, 'value'], value)

        if (~index) {
            this.setState({currentArguments: newValue})
        }
    }

    setArguments = _debounce(
        (index: number, args = fromJS({})) => {
            this.props.updateActionArgsOnApplied(
                index,
                args,
                this.props.ticketId
            )
        },
        200,
        {leading: true, trailing: false}
    )

    setValue(key: string, value: number | string | boolean) {
        const action = this.getAction()

        const newValue = (
            action.get('arguments', fromJS({})) as Map<any, any>
        ).set(key, value)

        this.setState({currentArguments: newValue})
    }

    renderListDictArgs = (title: string, args: List<any>, category: string) => {
        if (args.isEmpty()) {
            return null
        }

        return (
            <div className="mb-3">
                {!!title && <strong>{title}</strong>}
                {args
                    .map((arg: Map<any, any>, key) => (
                        <InputField
                            label={arg.get('key')}
                            value={arg.get('value')}
                            onChange={(value) =>
                                this.setListDictValue(arg, value, category)
                            }
                            isRequired={arg.get('required')}
                            className={classnames('mt-2', css.inputField)}
                            key={key}
                        />
                    ))
                    .toList()}
            </div>
        )
    }

    renderArgs = (actionArgs: Map<any, any>, isInline: boolean) => {
        const action = this.getAction()
        const template = getActionTemplate(action.get('name'))
        if (!template || !template.arguments) return

        const sortedArgs = Object.entries(template.arguments).sort(
            ([, value_a], [, value_b]) =>
                (value_a.display_order ?? 0) - (value_b.display_order ?? 0)
        )

        return (
            <>
                {sortedArgs.map(([key, args]) => {
                    const value = actionArgs.get(key) as
                        | number
                        | string
                        | boolean
                    switch (args.input?.type) {
                        case 'checkbox':
                            return (
                                <CheckBox
                                    className={css.input}
                                    key={key}
                                    isChecked={!!value}
                                    onChange={(value) =>
                                        this.setValue(key, value)
                                    }
                                    required={!!args.required}
                                >
                                    {args.label || key}
                                </CheckBox>
                            )
                        case 'number':
                            return (
                                <NumberInput
                                    className={css.input}
                                    key={key}
                                    {...args.input}
                                    value={Number(value)}
                                    onChange={(value) =>
                                        this.setValue(key, value!)
                                    }
                                    isRequired={!!args.required}
                                    hasControls
                                />
                            )
                        case 'select':
                            return (
                                <div
                                    key={key}
                                    className={css.selectFieldWrapper}
                                >
                                    <Label className={css.label}>
                                        {args.label}
                                    </Label>
                                    <SelectField
                                        className={classnames(
                                            css.input,
                                            'ml-2'
                                        )}
                                        {...args.input}
                                        value={value as string | number}
                                        onChange={(value) =>
                                            this.setValue(key, value)
                                        }
                                        required={!!args.required}
                                        container={document.body}
                                    />
                                </div>
                            )
                        case 'timedelta':
                            return (
                                <SnoozeTicketAction
                                    key={key}
                                    index={0}
                                    action={action}
                                    updateActionArgs={(_, value) => {
                                        this.setValue(
                                            key,
                                            value.get('snooze_timedelta')
                                        )
                                    }}
                                />
                            )
                        case 'assignee_team-select':
                            return (
                                <SetAssigneeAction
                                    key={key}
                                    index={0}
                                    action={action}
                                    updateActionArgs={(_, value) => {
                                        this.setValue(
                                            key,
                                            value.get('assignee_team')
                                        )
                                    }}
                                    handleTeams={true}
                                    dropdownContainer={document.body}
                                />
                            )
                        case 'assignee_user-select':
                            return (
                                <SetAssigneeAction
                                    key={key}
                                    index={0}
                                    action={action}
                                    updateActionArgs={(_, value) => {
                                        this.setValue(
                                            key,
                                            value.get('assignee_user')
                                        )
                                    }}
                                    handleUsers={true}
                                    dropdownContainer={document.body}
                                />
                            )
                        case 'status-select':
                            return (
                                <SetStatusAction
                                    key={key}
                                    index={0}
                                    action={action}
                                    updateActionArgs={(_, value) => {
                                        this.setValue(key, value.get('status'))
                                    }}
                                    fullWidth={false}
                                    dropdownContainer={document.body}
                                    disabled={this.props.disabled}
                                />
                            )
                        case 'tags-select':
                            return (
                                <div className={css.tagsSelect}>
                                    <AddTagsAction
                                        key={key}
                                        index={0}
                                        args={action.get('arguments')}
                                        updateActionArgs={(_, value) => {
                                            this.setValue(
                                                key,
                                                value.get('tags')
                                            )
                                        }}
                                        right={true}
                                        dropdownContainer={document.body}
                                        disabled={this.props.disabled}
                                    />
                                </div>
                            )
                        default:
                            return (
                                <>
                                    {isInline && args.label && (
                                        <Label
                                            isRequired={!!args.required}
                                            className="mr-2"
                                        >
                                            {args.label}
                                        </Label>
                                    )}
                                    <InputField
                                        key={key}
                                        {...args.input}
                                        className={classnames(
                                            {'mt-3': !isInline},
                                            css.inputField
                                        )}
                                        value={value as string}
                                        onChange={(
                                            value: number | string | boolean
                                        ) => this.setValue(key, value)}
                                        isRequired={!!args.required}
                                        label={
                                            isInline
                                                ? null
                                                : args.label === undefined
                                                ? key
                                                : args.label
                                        }
                                    />
                                </>
                            )
                    }
                })}
            </>
        )
    }

    render() {
        const {remove, ticketId} = this.props
        const action = this.getAction()

        let type = action.get('name')
        const template = getActionTemplate(type)

        if (template && template.integrationType) {
            type = template.integrationType
        }

        const icon = template?.icon
            ? template.icon
            : getIconFromActionType(type)

        let argsComponent = null

        const isInline =
            action.get('name') !== MacroActionName.AddInternalNote &&
            action.get('name') !== MacroActionName.Http &&
            action.get('name') !== MacroActionName.ForwardByEmail &&
            action.get('name') !==
                MacroActionName.ShopifyEditShippingAddressLastOrder

        if (type === MacroActionName.Http) {
            const headersArgs = (
                action.getIn(['arguments', 'headers'], fromJS([])) as List<any>
            ).filter(
                (curAction: Map<any, any>) =>
                    curAction.get('editable') as boolean
            ) as List<any>

            const paramsArgs = (
                action.getIn(['arguments', 'params'], fromJS([])) as List<any>
            ).filter(
                (curAction: Map<any, any>) =>
                    curAction.get('editable') as boolean
            ) as List<any>

            const formData =
                action.getIn(['arguments', 'content_type']) ===
                FORM_CONTENT_TYPE
                    ? ((
                          action.getIn(
                              ['arguments', 'form'],
                              fromJS([])
                          ) as List<any>
                      ).filter(
                          (curAction: Map<any, any>) =>
                              curAction.get('editable') as boolean
                      ) as List<any>)
                    : (fromJS([]) as List<any>)

            const shouldDisplayArgs =
                headersArgs.size + paramsArgs.size + formData.size

            if (shouldDisplayArgs) {
                argsComponent = (
                    <div className={classnames(css.argsWrapper)}>
                        {this.renderListDictArgs(
                            'Headers',
                            headersArgs,
                            'headers'
                        )}
                        {this.renderListDictArgs(
                            'URL Parameters',
                            paramsArgs,
                            'params'
                        )}
                        {this.renderListDictArgs('Form Data', formData, 'form')}
                    </div>
                )
            }
        } else if (type === MacroActionName.AddInternalNote) {
            argsComponent = (
                <div className={classnames(css.argsWrapper)}>
                    <AddInternalNoteAction
                        index={this.props.index}
                        action={action}
                        updateActionArgs={this.setArguments}
                        renderVariables={false}
                    />
                </div>
            )
        } else if (type === MacroActionName.ForwardByEmail) {
            argsComponent = (
                <div className={classnames(css.argsWrapper)}>
                    <ResponseAction
                        type={type}
                        index={0}
                        tabIndex={4}
                        action={action}
                        hideToolbar={true}
                        showReplyControls={true}
                        className={css.responseAction}
                        replyControlsClassName={css.replyControls}
                        updateActionArgs={(_, value: Map<any, any>) => {
                            const oldBodyHtml = this.props.action.getIn(
                                ['arguments', 'body_html'],
                                ''
                            )
                            const bodyHtml = value.get('body_html', '')

                            if (oldBodyHtml !== bodyHtml) {
                                this.setArguments(this.props.index, value)
                            } else {
                                this.setState({currentArguments: value})
                            }
                        }}
                    />
                </div>
            )
        } else {
            const args = action.get('arguments') as Map<any, any>
            argsComponent = this.renderArgs(args, isInline)
        }

        const notes = getActionTemplate(action.get('name'))?.notes

        return (
            <div className={css.component}>
                <div
                    className={
                        'd-flex justify-content-between align-items-baseline'
                    }
                >
                    <div className={'flex-grow'}>
                        <div className="d-flex align-items-center flex-wrap">
                            <div className={css.title}>
                                {template?.icon ? (
                                    <i className="material-icons md-3 mr-1 text-secondary">
                                        {template.icon}
                                    </i>
                                ) : (
                                    !!type && (
                                        <img
                                            alt={`${
                                                action.get('title') as string
                                            } icon`}
                                            className={css.actionLogo}
                                            role="presentation"
                                            src={icon}
                                        />
                                    )
                                )}
                                <span>{action.get('title')}</span>
                            </div>
                            <div className={css.spacer}></div>
                            {isInline && argsComponent}
                        </div>
                        {!isInline && argsComponent}
                        {!!notes &&
                            notes.map((note, idx) => (
                                <Caption key={idx} className={css.note}>
                                    <i className="material-icons mr-1">info</i>
                                    {note}
                                </Caption>
                            ))}
                    </div>
                    {!this.props.disabled && (
                        <i
                            className={classnames(
                                css.closeIcon,
                                'material-icons ml-4'
                            )}
                            onClick={() =>
                                remove && remove(this.props.index, ticketId)
                            }
                        >
                            close
                        </i>
                    )}
                </div>
            </div>
        )
    }
}

const connector = connect(null, {
    updateActionArgsOnApplied,
})

export default connector(TicketReplyActionContainer)
