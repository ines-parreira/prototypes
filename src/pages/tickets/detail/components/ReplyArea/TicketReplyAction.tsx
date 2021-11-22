import React, {Component} from 'react'
import {fromJS, List, Map} from 'immutable'
import classnames from 'classnames'

import {FORM_CONTENT_TYPE} from '../../../../../config'
import {
    getIconUrl,
    getIconFromUrl,
} from '../../../../../state/integrations/helpers'
import {updateActionArgsOnApplied} from '../../../../../state/ticket/actions'
import {getActionTemplate} from '../../../../../utils'
import InputField from '../../../../common/forms/InputField.js'
import BooleanField from '../../../../common/forms/BooleanField.js'
import SelectField from '../../../../common/forms/SelectField/SelectField'

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
                            <div className="mr-3">{arg.get('key')}</div>
                            <InputField
                                type="text"
                                value={arg.get('value')}
                                onChange={(value) =>
                                    this.setListDictValue(arg, value, category)
                                }
                                required={arg.get('required')}
                                inline
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
            <div>
                {sortedArgs
                    .map((value: number | string | boolean, key: string) => {
                        const label = template!.arguments![key].label
                        const inputConfig = template!.arguments![key].input

                        let Tag:
                            | typeof InputField
                            | typeof BooleanField
                            | typeof SelectField = InputField

                        if (inputConfig && inputConfig.type === 'checkbox') {
                            Tag = BooleanField
                        } else if (
                            inputConfig &&
                            inputConfig.type === 'select'
                        ) {
                            Tag = SelectField
                        }

                        return (
                            <div key={key} className={css.argInput}>
                                <Tag
                                    {...inputConfig}
                                    value={value}
                                    onChange={(
                                        value: number | string | boolean
                                    ) => this.setValue(key, value)}
                                    required={
                                        template!.arguments![key].required ||
                                        false
                                    }
                                    label={label || key}
                                    inline
                                />
                            </div>
                        )
                    })
                    .toList()}
            </div>
        )
    }

    render() {
        const {action, remove, ticketId} = this.props

        let type = action.get('name')
        const template = getActionTemplate(type)

        if (template && template.integrationType) {
            type = template.integrationType
        }

        const icon = getIconFromUrl(getIconUrl(type))

        let argsComponent = null

        if (type === 'http') {
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
                    className={classnames(
                        css.closeIcon,
                        'material-icons text-danger'
                    )}
                    onClick={() => remove(this.props.index, ticketId)}
                >
                    close
                </i>
                {argsComponent}
                {!!notes && (
                    <div className="notes">
                        {notes.map((note, idx) => (
                            <div key={idx} className="text-light-black">
                                <i className="material-icons">info</i>
                                {note}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        )
    }
}
