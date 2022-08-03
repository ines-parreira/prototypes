import React, {Component} from 'react'
import {fromJS, List, Map} from 'immutable'
import classnames from 'classnames'
import _debounce from 'lodash/debounce'

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
import {updateActionArgsOnApplied} from 'state/ticket/actions'
import {getActionTemplate} from 'utils'

import css from './TicketReplyAction.less'

type Props = {
    action: Map<any, any>
    index: number
    remove: (actionIndex: number, ticketId: number) => void
    ticketId: number
    update: typeof updateActionArgsOnApplied
}

export default class TicketReplyAction extends Component<Props> {
    setListDictValue(
        arg: Map<any, any>,
        value: number | string | boolean,
        category: string
    ) {
        const index = (
            this.props.action.getIn(['arguments', category]) as List<any>
        ).indexOf(arg)

        const newValue = (
            this.props.action.get('arguments', fromJS({})) as Map<any, any>
        ).setIn([category, index, 'value'], value)

        if (~index) {
            this.props.update(this.props.index, newValue, this.props.ticketId)
        }
    }

    setArguments = _debounce(
        (index: number, args = fromJS({})) => {
            this.props.action.setIn(['arguments'], args)
            this.props.update(index, args, this.props.ticketId)
        },
        200,
        {leading: true, trailing: false}
    )

    setValue(key: string, value: number | string | boolean) {
        const newValue = (
            this.props.action.get('arguments', fromJS({})) as Map<any, any>
        ).set(key, value)

        this.props.update(this.props.index, newValue, this.props.ticketId)
    }

    renderListDictArgs = (title: string, args: List<any>, category: string) => {
        if (args.isEmpty()) {
            return null
        }

        return (
            <div className="mb-3">
                {!!title && (
                    <div className="mb-2">
                        <strong>{title}</strong>
                    </div>
                )}
                {args
                    .map((arg: Map<any, any>, key) => (
                        <div key={key} className={css.argInput}>
                            <InputField
                                label={arg.get('key')}
                                value={arg.get('value')}
                                onChange={(value) =>
                                    this.setListDictValue(arg, value, category)
                                }
                                isRequired={arg.get('required')}
                            />
                        </div>
                    ))
                    .toList()}
            </div>
        )
    }

    renderArgs = (actionArgs: Map<any, any>, isInline: boolean) => {
        const action = this.props.action
        const template = getActionTemplate(action.get('name'))!
        const sortedArgs = actionArgs.sortBy(
            (v, k: string) => template.arguments![k]?.display_order ?? 0
        )

        return (
            <>
                {sortedArgs
                    .map((value: number | string | boolean, key: string) => {
                        const args = template.arguments![key]
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
                                        value={value as number}
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
                                            className={css.input}
                                            {...args.input}
                                            value={value as string | number}
                                            onChange={(value) =>
                                                this.setValue(key, value)
                                            }
                                            required={!!args.required}
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
                                        right={true}
                                        up={true}
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
                                        right={true}
                                        up={true}
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
                                            this.setValue(
                                                key,
                                                value.get('status')
                                            )
                                        }}
                                        fullWidth={false}
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
                                            dropdownUpDirection={true}
                                            dropdownContainer={document.body}
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
                                                {'mt-3': isInline},
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
                    })
                    .toList()}
            </>
        )
    }

    render() {
        const {action, remove, ticketId} = this.props

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
        } else {
            const args = action.get('arguments') as Map<any, any>
            if (args && !args.isEmpty())
                argsComponent = this.renderArgs(args, isInline)
        }

        const notes = getActionTemplate(action.get('name'))!.notes

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
                    <i
                        className={classnames(
                            css.closeIcon,
                            'material-icons ml-4'
                        )}
                        onClick={() => remove(this.props.index, ticketId)}
                    >
                        close
                    </i>
                </div>
            </div>
        )
    }
}
