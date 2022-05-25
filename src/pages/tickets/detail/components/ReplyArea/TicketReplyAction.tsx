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

    setArguments = _debounce((index: number, args = fromJS({})) => {
        this.props.action.setIn(['arguments'], args)
        this.props.update(index, args, this.props.ticketId)
    }, 200)

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

    renderArgs = (args: Map<any, any>) => {
        const template = getActionTemplate(this.props.action.get('name'))
        const sortedArgs = args.sortBy(
            (v, k: string) => template!.arguments![k].display_order
        )

        return (
            <>
                {sortedArgs
                    .map((value: number | string | boolean, key: string) => {
                        const label = template!.arguments![key].label
                        const inputConfig = template!.arguments![key].input

                        if (inputConfig?.type === 'checkbox') {
                            return (
                                <CheckBox
                                    className={css.input}
                                    key={key}
                                    isChecked={!!value}
                                    onChange={(value) =>
                                        this.setValue(key, value)
                                    }
                                    required={
                                        template!.arguments![key].required ||
                                        false
                                    }
                                >
                                    {label || key}
                                </CheckBox>
                            )
                        } else if (inputConfig?.type === 'number') {
                            return (
                                <NumberInput
                                    className={css.input}
                                    key={key}
                                    {...inputConfig}
                                    value={value as number}
                                    onChange={(value) =>
                                        this.setValue(key, value!)
                                    }
                                    isRequired={
                                        template!.arguments![key].required ||
                                        false
                                    }
                                    hasControls
                                />
                            )
                        } else if (inputConfig?.type === 'select') {
                            return (
                                <div
                                    key={key}
                                    className={css.selectFieldWrapper}
                                >
                                    <Label className={css.label}>{label}</Label>
                                    <SelectField
                                        className={css.input}
                                        {...inputConfig}
                                        value={value as string | number}
                                        onChange={(value) =>
                                            this.setValue(key, value)
                                        }
                                        required={
                                            template!.arguments![key]
                                                .required || false
                                        }
                                    />
                                </div>
                            )
                        }

                        return (
                            <InputField
                                key={key}
                                {...inputConfig}
                                className={css.inputField}
                                value={value as string}
                                onChange={(value: number | string | boolean) =>
                                    this.setValue(key, value)
                                }
                                isRequired={
                                    template!.arguments![key].required || false
                                }
                                label={label || key}
                            />
                        )
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

        const icon = getIconFromActionType(type)

        let argsComponent = null

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

            if (args && !args.isEmpty()) {
                argsComponent = (
                    <div className={classnames(css.argsWrapper)}>
                        {this.renderArgs(args)}
                    </div>
                )
            }
        }

        const notes = getActionTemplate(action.get('name'))!.notes

        return (
            <div className={css.component}>
                <div className={css.title}>
                    {!!type && (
                        <img
                            alt={`${action.get('title') as string} icon`}
                            className={css.actionLogo}
                            role="presentation"
                            src={icon}
                        />
                    )}
                    <span>{action.get('title')}</span>
                </div>
                <i
                    className={classnames(css.closeIcon, 'material-icons')}
                    onClick={() => remove(this.props.index, ticketId)}
                >
                    close
                </i>
                {argsComponent}
                {!!notes &&
                    notes.map((note, idx) => (
                        <Caption key={idx} className={css.note}>
                            <i className="material-icons mr-1">info</i>
                            {note}
                        </Caption>
                    ))}
            </div>
        )
    }
}
