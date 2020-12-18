import React, {ComponentProps} from 'react'
import {connect, ConnectedProps} from 'react-redux'
import {List, Map} from 'immutable'
import drop from 'lodash/drop'
import _get from 'lodash/get'
import _isArray from 'lodash/isArray'
import _isUndefined from 'lodash/isUndefined'
import {EditorState} from 'draft-js'

import DatetimePicker from '../../../common/forms/DatetimePicker.js'
import InputField from '../../forms/InputField.js'

import {humanizeString} from '../../../../utils'
import {convertToHTML, getPlainText} from '../../../../utils/editor'
import MultiSelectField from '../../forms/MultiSelectField.js'
import {
    caseInsensitiveOperators,
    collectionOperators,
    deprecatedOperators,
    timedeltaOperators,
} from '../../../../config/rules'
import {removeSuffix} from '../../../../utils/string'
import TimedeltaPicker from '../../forms/TimedeltaPicker.js'
import RichFieldWithVariables from '../../forms/RichFieldWithVariables.js'
import {makeHasIntegrationOfTypes} from '../../../../state/integrations/selectors'
import {RuleOperation} from '../../../../state/rules/types'
import {RuleItemActions} from '../../../settings/rules/detail/components/RuleItem/RuleItem'
import {IntegrationType} from '../../../../models/integration/types'
import {RootState} from '../../../../state/types'

import TagsSelect from './widget/TagsSelect.js'
import IntegrationSelect from './widget/IntegrationSelect.js'
import AssigneeTeamSelect from './widget/AssigneeTeamSelect'
import AssigneeUserSelect from './widget/AssigneeUserSelect'
import MacroSelect from './widget/MacroSelect'
import StatusSelect from './widget/StatusSelect.js'
import Select from './widget/ReactSelect'

type Property = {
    key: {
        name: string
    }
    value: {
        value: any
    }
}

type OwnProps = {
    rule: Map<any, any>
    value: any
    parent: List<any>
    schemas?: Map<any, any>
    actions: RuleItemActions
    leftsiblings?: List<any>
    config: Record<string, unknown>
    properties: Array<Property>
    className?: string
    compact?: boolean
}

type Props = OwnProps & ConnectedProps<typeof connector>

type State = {
    textFieldPropIndex: number
    textFieldParent: Array<string>
}

export class Widget extends React.Component<Props, State> {
    static defaultProps = {
        config: {},
        properties: [],
    }

    constructor(props: Props) {
        super(props)
        const {config, parent, properties} = props

        // Concerns rich fields of Actions:
        // We get the property of the text field if the current field is a rich field and has a text version.
        // E.g: current field is: `sendEmail.body_html`. We get `sendEmail.body_text` property
        // to automatically update its value when the html version changes.
        if (config.widget === 'rich-field' && config.textField && properties) {
            this.state = this._getTextField(config, parent, properties)
        }
    }

    _getTextField = (
        config: Record<string, unknown>,
        parent: List<any>,
        properties: Array<Property>
    ) => {
        const textFieldParent = parent.slice(0, -3)
        const textFieldPropIndex = properties.findIndex((property) => {
            return property.key.name === config.textField
        })
        return ({
            textFieldPropIndex: textFieldPropIndex,
            textFieldParent: textFieldParent.concat([
                textFieldPropIndex,
                'value',
                'value',
            ]),
        } as unknown) as State
    }

    componentWillReceiveProps(nextProps: Props) {
        const {config, parent, properties} = nextProps
        // update text field state when props changes
        if (config.widget === 'rich-field' && config.textField) {
            this.setState(this._getTextField(config, parent, properties))
        }
    }

    _handleChange = (value: any) => {
        const {actions, parent} = this.props

        let newValue = value

        // transform the array of string to an array of AST Literal object
        if (_isArray(newValue)) {
            newValue = newValue.map((val: string | number) => ({
                type: 'Literal',
                raw: `'${val}'`,
                value: val,
            }))
        }

        return actions.modifyCodeAST(parent, newValue, RuleOperation.Update)
    }

    _input = (value: any, type = 'text', caseInsensitive = false) => {
        const {config = {}, className, compact} = this.props

        return (
            <InputField
                className={className}
                type={type}
                label={config.name}
                value={value}
                onChange={this._handleChange}
                placeholder={config.placeholder || ''}
                required={config.required || false}
                inline={compact || false}
                caseInsensitive={caseInsensitive}
            />
        )
    }

    _textarea = (value: any) => {
        const {config = {}, className} = this.props

        return (
            <InputField
                className={className}
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

    _onRichFieldChange = (editorState: EditorState) => {
        const contentState = editorState.getCurrentContent()
        const {actions, parent} = this.props
        const {textFieldParent} = this.state

        // fill the text field with the text version
        if (textFieldParent) {
            actions.modifyCodeAST(
                textFieldParent as any,
                getPlainText(contentState),
                RuleOperation.Update
            )
        }

        return actions.modifyCodeAST(
            parent,
            convertToHTML(contentState),
            RuleOperation.Update
        )
    }

    _richField = (html: any) => {
        const {config = {}, properties, hasIntegrationOfTypes} = this.props
        const {textFieldPropIndex} = this.state
        const value = {
            text: properties[textFieldPropIndex].value.value,
            html: html,
        }

        const variableTypes = ['current_user', 'ticket.customer']

        if (hasIntegrationOfTypes(IntegrationType.ShopifyIntegrationType)) {
            variableTypes.push('shopify')
        }

        if (hasIntegrationOfTypes(IntegrationType.RechargeIntegrationType)) {
            variableTypes.push('recharge')
        }

        return (
            <RichFieldWithVariables
                allowExternalChanges
                type="text"
                rows="8"
                label={config.name as string}
                value={value}
                onChange={this._onRichFieldChange as any}
                placeholder={(config.placeholder as string) || ''}
                required={(config.required as boolean) || false}
                variableTypes={variableTypes}
            />
        )
    }

    _datetimeSelect = (datetime: any) => {
        return (
            <div className="widget d-inline-block">
                <DatetimePicker
                    datetime={datetime}
                    onChange={this._handleChange}
                />
            </div>
        )
    }

    _timedeltaSelect = (value: any) => {
        return (
            <div className="widget d-inline-block">
                <TimedeltaPicker
                    value={value}
                    onChange={this._handleChange as any}
                />
            </div>
        )
    }

    _resolveLeft(left: List<any>, schemas: Map<any, any>): List<any> {
        // we need to figure out if the path contains '$ref' objects, then resolve them and update the path
        const path = []
        for (const item of left.toJS()) {
            path.push(item)
            const schema = schemas.getIn(path) as Map<any, any>

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
                    return this._resolveLeft(
                        newLeft.concat(newRight) as List<any>,
                        schemas
                    )
                }
            }
        }
        return left
    }

    render() {
        const {
            leftsiblings,
            schemas,
            value,
            rule,
            parent,
            className,
            config,
        } = this.props

        // todo should depend on triggers (should be described in schemas)
        const rootObjects = ['ticket', 'message']

        if (!(schemas && schemas.size && leftsiblings && leftsiblings.size)) {
            return null
        }

        const left = this._resolveLeft(leftsiblings, schemas)
        // widget data used for rendering
        const widget: {
            type: string
            value: any
            description: string
            options: (string | {value: string; label: string})[]
            multiple?: boolean
        } = {
            type: 'select',
            value,
            description: '',
            options: [],
        }

        let caseInsensitive = false

        if (left.size === 1 && left.get(0) === 'definitions') {
            // we are at the root here, only allow some values
            widget.options = rootObjects
        } else if (left.last() === 'properties') {
            // properties are special because they are defining the props
            // that available on the top level objects: ticket, event, etc..
            const props = (schemas.getIn(left) as Map<
                any,
                any
            >).toJS() as Record<string, unknown>
            for (const key of Object.keys(props)) {
                const prop = props[key] as Record<string, any>

                // only show props that have a meta value or a refs
                //eslint-disable-next-line no-prototype-builtins
                if (prop.hasOwnProperty('meta')) {
                    // hide prop if it is hidden in rules and not used
                    if (
                        _get(prop, ['meta', 'rules', 'hide']) === true &&
                        key !== widget.value
                    ) {
                        continue
                    }

                    widget.options.push({
                        value: key,
                        label:
                            _get(prop, ['meta', 'rules', 'label']) ||
                            humanizeString(
                                removeSuffix(key, '_datetime')
                            ).toLowerCase(),
                    })
                    widget.description = prop.description
                    //eslint-disable-next-line no-prototype-builtins
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
            let operators = schemas.getIn(left) as Map<any, any>

            if (operators) {
                // exclude deprecated operators which are not already used
                operators = operators.filter(
                    (ope: any, operatorName: string) => {
                        if (deprecatedOperators.includes(operatorName)) {
                            return deprecatedOperators.includes(widget.value)
                        }
                        return true
                    }
                ) as Map<any, any>
                widget.options = operators.toJS()
            }
        } else if (left.first() === 'actions') {
            if (config.widget) {
                widget.type = config.widget as string
            } else {
                widget.type = `${left.last() as string}-select`
            }
        } else {
            // all other properties
            const right = schemas.getIn(left) as Map<any, any>
            const calleeName = rule.getIn(
                (parent.slice(0, -3).concat(['callee', 'name']) as List<
                    any
                >).insert(0, 'code_ast')
            )
            widget.type = right
                ? (right.getIn(['meta', 'rules', 'widget']) as string)
                : 'input'

            // display a multi select field in case current attribute is an array AND
            // it's has no specific input AND callee is a collection operator
            if (
                _isArray(widget.value) &&
                (!widget.type || widget.type === 'input') &&
                collectionOperators.includes(calleeName)
            ) {
                widget.type = 'multi-select'
            }

            // current properties is a tag field so we used the specific
            if (
                leftsiblings.join('.').includes('Ticket.properties.tags.name')
            ) {
                widget.type = 'tags-select'
                widget.multiple = collectionOperators.includes(calleeName)
            }

            if (
                caseInsensitiveOperators.includes(calleeName) &&
                widget.type !== 'tags-select'
            ) {
                caseInsensitive = true
            }

            if (right) {
                const options = right.getIn(['meta', 'enum']) as List<any>
                widget.options = options ? (options.toJS() as string[]) : []
                widget.description = right.get('description')
            }
        }

        const operatorName = rule.getIn(
            (parent.slice(0, -3).concat(['callee', 'name']) as List<
                any
            >).insert(0, 'code_ast')
        )
        const isOperatorRelative = timedeltaOperators.includes(operatorName)

        if (widget.type === 'datetime-select' && isOperatorRelative) {
            widget.type = 'timedelta-select'
        }

        switch (widget.type) {
            case 'intents-select':
                return (
                    <MultiSelectField
                        className={className}
                        style={{
                            display: 'inline-block',
                            paddingBottom: '2px',
                        }}
                        options={widget.options.map((option) => ({
                            value: option.toString(),
                            label: option.toString(),
                        }))}
                        singular="intent"
                        plural="intents"
                        values={widget.value}
                        onChange={this._handleChange as any}
                    />
                )
            case 'sentiments-select':
                return (
                    <MultiSelectField
                        className={className}
                        style={{
                            display: 'inline-block',
                            paddingBottom: '2px',
                        }}
                        options={widget.options.map((option) => ({
                            value: option.toString(),
                            label: option.toString(),
                        }))}
                        singular="sentiment"
                        plural="sentiments"
                        values={widget.value}
                        onChange={this._handleChange as any}
                    />
                )
            case 'multi-select':
                return (
                    <MultiSelectField
                        className={`${className || ''} Text`}
                        style={{
                            display: 'inline-block',
                            paddingBottom: '2px',
                        }}
                        values={widget.value}
                        singular="word"
                        plural="words"
                        allowCustomValues
                        onChange={this._handleChange as any}
                        caseInsensitive={caseInsensitive}
                    />
                )
            case 'select':
                return (
                    <Select
                        {...((widget as unknown) as ComponentProps<
                            typeof Select
                        >)}
                        className={className}
                        onChange={this._handleChange}
                    />
                )
            case 'status-select':
                return (
                    <StatusSelect
                        {...((widget as unknown) as ComponentProps<
                            typeof StatusSelect
                        >)}
                        className={className}
                        onChange={this._handleChange as any}
                    />
                )
            case 'tags-select':
                return (
                    <TagsSelect
                        {...((widget as unknown) as ComponentProps<
                            typeof TagsSelect
                        >)}
                        className={className}
                        onChange={this._handleChange}
                        caseInsensitive={caseInsensitive}
                        multiple={
                            _isUndefined(widget.multiple)
                                ? true
                                : widget.multiple
                        }
                    />
                )
            case 'macro-select':
                return (
                    <MacroSelect
                        {...widget}
                        className={className}
                        onChange={this._handleChange}
                    />
                )
            case 'assignee_user-select':
                return (
                    <AssigneeUserSelect
                        {...widget}
                        className={className}
                        onChange={this._handleChange}
                        allowUnassign={!operatorName}
                    />
                )
            case 'assignee_team-select':
                return (
                    <AssigneeTeamSelect
                        {...widget}
                        className={className}
                        onChange={this._handleChange}
                        allowUnassign={!operatorName}
                    />
                )
            case 'integration-select':
                return (
                    <IntegrationSelect
                        {...widget}
                        className={className}
                        onChange={this._handleChange}
                    />
                )
            case 'textarea':
                return this._textarea(value)
            case 'rich-field':
                return this._richField(value)
            case 'datetime-select':
                return this._datetimeSelect(value)
            case 'timedelta-select':
                return this._timedeltaSelect(value)
            case 'number-input':
                return this._input(value, 'number')
            case 'input':
            default:
                return this._input(value, 'text', caseInsensitive)
        }
    }
}

const connector = connect((state: RootState) => ({
    hasIntegrationOfTypes: makeHasIntegrationOfTypes(state),
}))

export default connector(Widget)
