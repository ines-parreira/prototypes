import React from 'react'
import PropTypes from 'prop-types'
import {fromJS} from 'immutable'
import classnames from 'classnames'

import InputField from '../../../../common/forms/InputField'
import BooleanField from '../../../../common/forms/BooleanField'
import SelectField from '../../../../common/forms/SelectField'

import {getActionTemplate} from './../../../../../utils'

import {FORM_CONTENT_TYPE} from './../../../../../config'
import {getIconUrl, getIconFromUrl} from './../../../../../state/integrations/helpers'


import css from './TicketReplyAction.less'

export default class TicketReplyAction extends React.Component {
    setListDictValue(arg, value, category) {
        const index = this.props.action.getIn(['arguments', category]).indexOf(arg)

        const newValue = this.props.action.get('arguments', fromJS({})).setIn([category, index, 'value'], value)

        if (~index) {
            this.props.update(
                this.props.index,
                newValue,
                this.props.ticketId
            )
        }
    }

    setValue(key, value) {
        const newValue = this.props.action.get('arguments', fromJS({})).set(key, value)

        this.props.update(
            this.props.index,
            newValue,
            this.props.ticketId
        )
    }

    renderListDictArgs = (title, args, category) => {
        if (args.isEmpty()) {
            return null
        }

        return (
            <div className="mb-3">
                {
                    !!title && (
                        <div className="mb-2">
                            <strong>{title}</strong>
                        </div>
                    )
                }
                {
                    args.map((arg, key) => (
                        <div
                            key={key}
                            className={css.argInput}
                        >
                            <div className="mr-3">{arg.get('key')}</div>
                            <InputField
                                type="text"
                                value={arg.get('value')}
                                onChange={(value) => this.setListDictValue(arg, value, category)}
                                required={arg.get('required')}
                                inline
                            />
                        </div>
                    )).toList()
                }
            </div>
        )
    }

    renderArgs = (args) => {
        const template = getActionTemplate(this.props.action.get('name'))
        const sortedArgs = args.sortBy((v, k) => template.arguments[k].display_order)

        return (
            <div>
                {
                    sortedArgs.map((value, key) => {
                        const label = template.arguments[key].label
                        const inputConfig = template.arguments[key].input

                        let Tag = InputField

                        if (inputConfig && inputConfig.type === 'checkbox') {
                            Tag = BooleanField
                        } else if (inputConfig && inputConfig.type === 'select') {
                            Tag = SelectField
                        }

                        return (
                            <div
                                key={key}
                                className={css.argInput}
                            >
                                <Tag
                                    {...inputConfig}
                                    value={value}
                                    onChange={(value) => this.setValue(key, value, null)}
                                    required={template.arguments[key].required || false}
                                    label={label || key}
                                    inline
                                />
                            </div>
                        )
                    }).toList()
                }
            </div>
        )
    }

    render() {
        const {action, remove, ticketId} = this.props

        let type = action.get('name')
        const template = getActionTemplate(type)

        if (template.integrationType) {
            type = template.integrationType
        }

        const icon = getIconFromUrl(getIconUrl(type))

        let argsComponent = null

        if (type === 'http') {
            const headersArgs = action.getIn(['arguments', 'headers'], fromJS([]))
                .filter((curAction) => curAction.get('editable'))

            const paramsArgs = action.getIn(['arguments', 'params'], fromJS([]))
                .filter((curAction) => curAction.get('editable'))

            const formData = action.getIn(['arguments', 'content_type']) === FORM_CONTENT_TYPE
                ? action.getIn(['arguments', 'form'], fromJS([])).filter((curAction) => curAction.get('editable'))
                : fromJS([])

            const shouldDisplayArgs = headersArgs.size + paramsArgs.size + formData.size

            if (shouldDisplayArgs) {
                argsComponent = (
                    <div className={classnames(css.argsWrapper)}>
                        {this.renderListDictArgs('Headers', headersArgs, 'headers')}
                        {this.renderListDictArgs('URL Parameters', paramsArgs, 'params')}
                        {this.renderListDictArgs('Form Data', formData, 'form')}
                    </div>
                )
            }
        } else {
            const args = action.get('arguments')

            if (args && !args.isEmpty()) {
                argsComponent = (
                    <div className={classnames(css.argsWrapper)}>
                        {this.renderArgs(args)}
                    </div>
                )
            }
        }

        const notes = getActionTemplate(action.get('name')).notes

        return (
            <div className={css.component}>
                <div className={css.title}>
                    {
                        !!type && (
                            <img
                                alt={`${action.get('title')} icon`}
                                className={css.actionLogo}
                                role="presentation"
                                src={icon}
                            />
                        )
                    }
                    <span>{action.get('title')}</span>
                </div>
                <i
                    className={classnames(css.closeIcon, 'material-icons text-danger')}
                    onClick={() => remove(this.props.index, ticketId)}
                >
                    close
                </i>
                {argsComponent}
                {
                    !!notes && (
                        <div className="notes">
                            {
                                notes.map((note, idx) => (
                                    <div
                                        key={idx}
                                        className="text-light-black"
                                    >
                                        <i className="material-icons">
                                            info
                                        </i>
                                        {note}
                                    </div>
                                ))
                            }
                        </div>
                    )
                }
            </div>
        )
    }
}

TicketReplyAction.propTypes = {
    action: PropTypes.object.isRequired,
    index: PropTypes.number.isRequired,
    update: PropTypes.func.isRequired,
    remove: PropTypes.func.isRequired,
    ticketId: PropTypes.number
}
