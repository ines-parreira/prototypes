import React from 'react'

import {List} from 'immutable'
import drop from 'lodash/drop'
import _get from 'lodash/get'
import _isArray from 'lodash/isArray'
import _isUndefined from 'lodash/isUndefined'

import Select from './widget/ReactSelect'
import StatusSelect from './widget/StatusSelect'
import PrioritySelect from './widget/PrioritySelect'
import MacroSelect from './widget/MacroSelect'
import RequestSelect from './widget/RequestSelect'
import AssigneeSelect from './widget/AssigneeSelect'
import IntegrationSelect from './widget/IntegrationSelect'
import DatetimePicker from '../../../common/forms/DatetimePicker'

import InputField from '../../forms/InputField'

import {convertToHTML, humanizeString} from '../../../../utils'
import TagsSelect from './widget/TagsSelect'
import RichField from '../../forms/RichField'
import MultiSelectField from '../../forms/MultiSelectField'
import {collectionOperators, deprecatedOperators, timedeltaOperators} from '../../../../config/rules'
import {removeSuffix} from '../../../../utils/string'
import TimedeltaPicker from '../../forms/TimedeltaPicker'

export default class Widget extends React.Component {
    static propTypes = {
        rule: React.PropTypes.object,
        value: React.PropTypes.any,
        parent: React.PropTypes.object,
        schemas: React.PropTypes.object,
        actions: React.PropTypes.object,
        type: React.PropTypes.string,
        leftsiblings: React.PropTypes.object,
        compact: React.PropTypes.bool,

        config: React.PropTypes.object,
        properties: React.PropTypes.array,
    }

    static defaultProps = {
        config: {}
    }

    constructor(props) {
        super(props)
        const {config, parent, properties} = props

        // Concerns rich fields of Actions:
        // We get the property of the text field if the current field is a rich field and has a text version.
        // E.g: current field is: `sendEmail.body_html`. We get `sendEmail.body_text` property
        // to automatically update its value when the html version changes.
        if (config.widget === 'rich-field' && config.textField) {
            this.state = this._getTextField(config, parent, properties)
        }
    }

    _getTextField = (config, parent, properties) => {
        const textFieldParent = parent.slice(0, -3)
        const textFieldPropIndex = properties.findIndex(property => {
            return property.key.name === config.textField
        })
        return {
            textFieldPropIndex: textFieldPropIndex,
            textFieldParent: textFieldParent.concat([textFieldPropIndex, 'value', 'value']),
        }
    }

    componentWillReceiveProps(nextProps) {
        const {config, parent, properties} = nextProps
        // update text field state when props changes
        if (config.widget === 'rich-field' && config.textField) {
            this.setState(this._getTextField(config, parent, properties))
        }
    }

    _handleChange = (value) => {
        const {actions, parent} = this.props

        // transform the array of string to an array of AST Literal object
        if (_isArray(value)) {
            value = value.map((val) => ({
                type: 'Literal',
                raw: `'${val}'`,
                value: val
            }))
        }

        return actions.modifyCodeAST(parent, value, 'UPDATE')
    }

    _input = (value) => {
        const {config = {}} = this.props

        return (
            <InputField
                type="text"
                label={config.name}
                value={value}
                onChange={this._handleChange}
                placeholder={config.placeholder || ''}
                required={config.required || false}
                inline={this.props.compact || false}
            />
        )
    }

    _textarea = (value) => {
        const {config = {}} = this.props

        return (
            <InputField
                type="textarea"
                rows="8"
                label={config.name}
                value={value}
                onChange={this._handleChange}
                placeholder={config.placeholder || ''}
                required={config.required || false}
            />
        )
    }

    _onRichFieldChange = (editorState) => {
        const contentState = editorState.getCurrentContent()
        const {actions, parent} = this.props
        const {textFieldParent} = this.state

        // fill the text field with the text version
        if (textFieldParent) {
            actions.modifyCodeAST(textFieldParent, contentState.getPlainText(), 'UPDATE')
        }

        return actions.modifyCodeAST(parent, convertToHTML(contentState), 'UPDATE')
    }

    _richField = (html) => {
        const {config = {}, properties} = this.props
        const {textFieldPropIndex} = this.state
        const value = {
            text: properties[textFieldPropIndex].value.value,
            html: html,
        }

        return (
            <RichField
                allowExternalChanges
                type="text"
                rows="8"
                label={config.name}
                value={value}
                onChange={this._onRichFieldChange}
                placeholder={config.placeholder || ''}
                required={config.required || false}
            />
        )
    }

    _datetimeSelect = (datetime) => {
        return (
            <div className="widget d-inline-block">
                <DatetimePicker
                    datetime={datetime}
                    onChange={this._handleChange}
                />
            </div>
        )
    }

    _timedeltaSelect = (value) => {
        return (
            <div className="widget d-inline-block">
                <TimedeltaPicker
                    value={value}
                    onChange={this._handleChange}
                />
            </div>
        )
    }

    _resolveLeft(left, schemas) {
        // we need to figure out if the path contains '$ref' objects, then resolve them and update the path
        const path = []
        for (const item of left.toJS()) {
            path.push(item)
            const schema = schemas.getIn(path)

            if (schema) {
                let ref = ''
                if (schema.get('type') === 'array') {
                    ref = schema.getIn(['items', '$ref'])
                } else if (schema.has('$ref')) {
                    ref = schema.get('$ref')
                }

                if (ref) {
                    const def = ref.split('/')[2]
                    // get the remaining path
                    const newLeft = List(['definitions', def, 'properties'])
                    const newRight = List(drop(left.toJS(), path.length))
                    return this._resolveLeft(newLeft.concat(newRight), schemas)
                }
            }
        }
        return left
    }

    render() {
        const {leftsiblings, schemas, value, rule, parent} = this.props

        // todo should depend on triggers (should be described in schemas)
        const rootObjects = ['ticket', 'message']

        if (!(schemas && schemas.size && leftsiblings && leftsiblings.size)) {
            return null
        }

        const left = this._resolveLeft(leftsiblings, schemas)
        // widget data used for rendering
        const widget = {
            type: 'select',
            value,
            description: '',
            options: [],
        }

        if (left.size === 1 && left.get(0) === 'definitions') {
            // we are at the root here, only allow some values
            widget.options = rootObjects
        } else if (left.last() === 'properties') {
            // are special because they are defining the props
            // that available on the top level objects: ticket, event, etc..
            const props = schemas.getIn(left).toJS()
            for (const key of Object.keys(props)) {
                const prop = props[key]

                // only show props that have a meta value or a refs
                if (prop.hasOwnProperty('meta')) {
                    // hide prop if it is hidden in rules and not used
                    if (_get(prop, ['meta', 'rules', 'hide']) === true && key !== widget.value) {
                        continue
                    }

                    widget.options.push({
                        value: key,
                        label: _get(prop, ['meta', 'rules', 'label']) || humanizeString(removeSuffix(key, '_datetime')).toLowerCase(),
                    })
                    widget.description = prop.description
                } else if (prop.hasOwnProperty('$ref')) {
                    widget.options.push({
                        value: key,
                        label: humanizeString(key).toLowerCase(),
                    })
                    widget.description = ''
                }
            }

        } else if (left.last() === 'operators') {
            // operators are using simple select widget, all we need is the options
            let operators = schemas.getIn(left)

            if (operators) {
                // exclude deprecated operators which are not already used
                operators = operators.filter((ope, operatorName) => {
                    if (deprecatedOperators.includes(operatorName)) {
                        return deprecatedOperators.includes(widget.value)
                    }
                    return true
                })
                widget.options = operators.toJS()
            }
        } else if (left.first() === 'actions') {
            widget.type = `${left.last()}-select`
        } else {
            // all other properties
            const right = schemas.getIn(left)
            const calleeName = rule.getIn(parent.slice(0, -3).concat(['callee', 'name']).insert(0, 'code_ast'))
            widget.type = right ? right.getIn(['meta', 'rules', 'widget']) : 'input'

            // display a multi select field in case current attribute is an array AND
            // it's has no specific input AND callee is a collection operator
            if (_isArray(widget.value) && (!widget.type || widget.type === 'input') &&
                collectionOperators.includes(calleeName)) {
                widget.type = 'multi-select'
            }

            // current properties is a tag field so we used the specific
            if (leftsiblings.join('.').includes('Ticket.properties.tags.name')) {
                widget.type = 'tags-select'
                widget.multiple = collectionOperators.includes(calleeName)
            }

            if (right) {
                const options = right.getIn(['meta', 'enum'])
                widget.options = options ? options.toJS() : []
                widget.description = right.get('description')
            }
        }

        const operatorName = rule.getIn(parent.slice(0, -3).concat(['callee', 'name']).insert(0, 'code_ast'))
        const isOperatorRelative = timedeltaOperators.includes(operatorName)

        if (widget.type === 'datetime-select' && isOperatorRelative) {
            widget.type = 'timedelta-select'
        }

        const widgetType = this.props.type || widget.type

        switch (widgetType) {
            case 'multi-select':
                return <MultiSelectField
                    style={{
                        display: 'inline-block',
                        verticalAlign: 'top',
                        paddingBottom: '2px'
                    }}
                    values={widget.value}
                    singular="word"
                    plural="words"
                    allowCustomValues
                    onChange={this._handleChange}
                />
            case 'select':
                return <Select {...widget} onChange={this._handleChange}/>
            case 'status-select':
                return <StatusSelect {...widget} onChange={this._handleChange}/>
            case 'tags-select':
                return (
                    <TagsSelect
                        {...widget}
                        onChange={this._handleChange}
                        multiple={_isUndefined(widget.multiple) ? true : widget.multiple}
                    />
                )
            case 'priority-select':
                return <PrioritySelect {...widget} onChange={this._handleChange}/>
            case 'macro-select':
                return <MacroSelect {...widget} onChange={this._handleChange}/>
            case 'request-select':
                return <RequestSelect {...widget} onChange={this._handleChange}/>
            case 'assignee_user-select':
                return <AssigneeSelect {...widget} onChange={this._handleChange}/>
            case 'integration-select':
                return <IntegrationSelect {...widget} onChange={this._handleChange}/>
            case 'textarea':
                return this._textarea(value)
            case 'rich-field':
                return this._richField(value)
            case 'datetime-select':
                return this._datetimeSelect(value)
            case 'timedelta-select':
                return this._timedeltaSelect(value)
            case 'input':
            default:
                return this._input(value)
        }
    }
}
