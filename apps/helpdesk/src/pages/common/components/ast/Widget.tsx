import type { ComponentProps } from 'react'
import { useCallback, useEffect, useState } from 'react'

import {
    DateAndTimeFormatting,
    formatDatetime,
    removeSuffix,
} from '@repo/utils'
import type { DateTimeResultFormatType } from '@repo/utils'
import type { EditorState } from 'draft-js'
import type { Map } from 'immutable'
import { fromJS, List } from 'immutable'
import drop from 'lodash/drop'
import _get from 'lodash/get'
import _isArray from 'lodash/isArray'
import _isUndefined from 'lodash/isUndefined'
import { Input } from 'reactstrap'
import type { InputType } from 'reactstrap/lib/Input'

import type { UploadType } from 'common/types'
import { BASIC_OPERATORS } from 'config'
import {
    caseInsensitiveOperators,
    collectionOperators,
    deprecatedOperators,
} from 'config/rules'
import useAppSelector from 'hooks/useAppSelector'
import { IntegrationType } from 'models/integration/types'
import DatePicker from 'pages/common/forms/DatePicker'
import DEPRECATED_InputField from 'pages/common/forms/DEPRECATED_InputField'
import MultiSelectField from 'pages/common/forms/MultiSelectField'
import RichFieldWithVariables from 'pages/common/forms/RichFieldWithVariables'
import TimedeltaPicker from 'pages/common/forms/TimedeltaPicker'
import type { RuleItemActions } from 'pages/settings/rules/types'
import { getDateAndTimeFormatter } from 'state/currentUser/selectors'
import {
    getShopifyIntegrationsSortedByName,
    makeHasIntegrationOfTypes,
} from 'state/integrations/selectors'
import { isTimedeltaOperator, RuleOperation } from 'state/rules/types'
import { humanizeChannel } from 'state/ticket/utils'
import { getLanguageDisplayName, humanizeString } from 'utils'
import { stringToDatetime } from 'utils/date'
import { convertToHTML, getPlainText } from 'utils/editor'

import {
    getCustomFieldOperators,
    getFieldSchemaDefinitionKey,
} from '../ViewTable/Filters/utils'
import {
    applyMetafieldWidgetConfig,
    getMetafieldOperatorOptions,
} from './expression/metafields/utils'
import {
    getCustomFieldIdFromPath,
    getIntegrationIdFromPath,
    getMetafieldKeyFromPath,
} from './utils'
import AssigneeTeamSelect from './widget/AssigneeTeamSelect'
import AssigneeUserSelect from './widget/AssigneeUserSelect'
import { CustomDropdownInput } from './widget/CustomDropdownInput'
import CustomFieldIdInput from './widget/CustomFieldIdInput'
import CustomFieldSelect from './widget/CustomFieldSelect'
import IntegrationSelect from './widget/IntegrationSelect'
import { IntentsSentimentsSelect } from './widget/IntentsSentimentsSelect'
import MacroSelect from './widget/MacroSelect'
import PrioritySelect from './widget/PrioritySelect'
import Select from './widget/ReactSelect'
import SelfServiceFlowSelect from './widget/SelfServiceFlowSelect'
import SelfServiceStoreIntegrationSelect from './widget/SelfServiceStoreIntegrationSelect'
import StatusSelect from './widget/StatusSelect'
import TagsSelect from './widget/TagsSelect'
import { useGetCustomFieldById } from './widget/useGetCustomFieldById'
import { useGetMetafieldByKey } from './widget/useGetMetafieldByKey'

import css from './Widget.less'

type Property = {
    key: {
        name: string
    }
    value: {
        value: any
    }
}

type Props = {
    rule: Map<any, any>
    value: any
    parent: List<any>
    schemas?: Map<any, any>
    actions: RuleItemActions
    leftsiblings?: List<any>
    config?: Record<string, unknown>
    properties?: Array<Property>
    className?: string
    compact?: boolean
}

export type WidgetOption = {
    label: string
    value: string
}

type TextFieldState = {
    textFieldPropIndex: number
    textFieldParent: Array<string>
}

const getTextField = (
    config: Record<string, unknown>,
    parent: List<any>,
    properties: Array<Property>,
): TextFieldState => {
    const textFieldParent = parent.slice(0, -3).toJS()
    const textFieldPropIndex = properties.findIndex((property) => {
        return property.key.name === config.textField
    })
    return {
        textFieldPropIndex: textFieldPropIndex,
        textFieldParent: textFieldParent.concat([
            textFieldPropIndex,
            'value',
            'value',
        ]),
    }
}

// For custom fields, we need to resolve to the custom_fields schema
// and then use the field type to determine the appropriate operators
const customFieldPath = ['definitions', 'Ticket', 'properties', 'custom_fields']

const Widget = ({
    rule,
    value,
    parent,
    schemas,
    actions,
    leftsiblings,
    config = {},
    properties = [],
    className,
    compact,
}: Props) => {
    const hasIntegrationOfTypes = useAppSelector(makeHasIntegrationOfTypes)
    const datetimeFormat = useAppSelector((state) =>
        getDateAndTimeFormatter(state)(
            DateAndTimeFormatting.CompactDateWithTime,
        ),
    )
    const isCustomerCustomField = leftsiblings?.includes('customer') || false
    const objectType = isCustomerCustomField ? 'Customer' : 'Ticket'

    const customField = useGetCustomFieldById(
        getCustomFieldIdFromPath(leftsiblings),
        objectType,
    )

    const schemaDefinitionKey = customField
        ? getFieldSchemaDefinitionKey(customField)
        : undefined

    const shopifyIntegrations =
        useAppSelector(getShopifyIntegrationsSortedByName) ?? []
    const shopifyIntegrationId = shopifyIntegrations[0]?.id

    const integrationIdFromPath = getIntegrationIdFromPath(leftsiblings)
    const metafieldIntegrationId = integrationIdFromPath ?? shopifyIntegrationId

    const metafieldKey = getMetafieldKeyFromPath(leftsiblings)
    const metafield = useGetMetafieldByKey(metafieldKey, metafieldIntegrationId)

    // State for rich field text field handling
    const [textFieldState, setTextFieldState] = useState<TextFieldState | null>(
        () => {
            if (
                config.widget === 'rich-field' &&
                config.textField &&
                properties
            ) {
                return getTextField(config, parent, properties)
            }
            return null
        },
    )

    // Update text field state when props change (equivalent to UNSAFE_componentWillReceiveProps)
    useEffect(() => {
        if (config.widget === 'rich-field' && config.textField) {
            setTextFieldState(getTextField(config, parent, properties))
        }
    }, [config, parent, properties])

    const handleChange = useCallback(
        (value: any) => {
            let newValue = value

            // transform the array of string to an array of AST Literal object
            if (_isArray(newValue)) {
                newValue = newValue.map((val: string | number) => ({
                    type: 'Literal',
                    raw: `'${val}'`,
                    value: val,
                }))
            }

            if (
                typeof newValue === 'number' &&
                !isNaN(newValue) &&
                newValue < 0
            ) {
                const absValue = Math.abs(newValue)
                newValue = absValue
            }

            return actions.modifyCodeAST(
                parent,
                newValue,
                RuleOperation.Update,
                undefined,
                schemaDefinitionKey,
            )
        },
        [actions, parent, schemaDefinitionKey],
    )

    const input = useCallback(
        (value: any, type: InputType = 'text', caseInsensitive = false) => {
            return (
                <DEPRECATED_InputField
                    className={className}
                    type={type}
                    label={config.name as string}
                    value={value}
                    onChange={handleChange}
                    placeholder={(config.placeholder as string) || ''}
                    required={(config.required as boolean) || false}
                    inline={compact || false}
                    min="0"
                    caseInsensitive={caseInsensitive}
                />
            )
        },
        [className, config, compact, handleChange],
    )

    const textarea = useCallback(
        (value: any) => {
            return (
                <DEPRECATED_InputField
                    className={className}
                    type="textarea"
                    rows="8"
                    label={config.name as string}
                    value={value}
                    onChange={handleChange}
                    placeholder={(config.placeholder as string) || ''}
                    required={(config.required as boolean) || false}
                />
            )
        },
        [className, config, handleChange],
    )

    const onRichFieldChange = useCallback(
        (editorState: EditorState) => {
            const contentState = editorState.getCurrentContent()

            // fill the text field with the text version
            let ast
            if (textFieldState?.textFieldParent) {
                ast = actions.modifyCodeAST(
                    List(textFieldState.textFieldParent),
                    getPlainText(contentState),
                    RuleOperation.Update,
                )
            }

            return actions.modifyCodeAST(
                parent,
                convertToHTML(contentState),
                RuleOperation.Update,
                ast,
            )
        },
        [actions, parent, textFieldState],
    )

    const richField = useCallback(
        (html: any) => {
            const value = {
                text: properties[textFieldState?.textFieldPropIndex || 0]?.value
                    .value,
                html: html,
            }

            const variableTypes = ['current_user', 'ticket.customer']

            if (hasIntegrationOfTypes(IntegrationType.Shopify)) {
                variableTypes.push('shopify')
            }

            if (hasIntegrationOfTypes(IntegrationType.Recharge)) {
                variableTypes.push('recharge')
            }

            if (hasIntegrationOfTypes(IntegrationType.Magento2)) {
                variableTypes.push('magento2')
            }

            if (hasIntegrationOfTypes(IntegrationType.BigCommerce)) {
                variableTypes.push('bigcommerce')
            }

            return (
                <RichFieldWithVariables
                    allowExternalChanges
                    label={config.name as string}
                    value={value}
                    onChange={onRichFieldChange as any}
                    placeholder={(config.placeholder as string) || ''}
                    isRequired={(config.required as boolean) || false}
                    variableTypes={variableTypes}
                    uploadType={config.uploadType as UploadType | undefined}
                />
            )
        },
        [
            config,
            properties,
            textFieldState,
            hasIntegrationOfTypes,
            onRichFieldChange,
        ],
    )

    const datetimeSelect = useCallback(
        (datetime: string, datetimeFormat: DateTimeResultFormatType) => {
            const date = datetime ? stringToDatetime(datetime) : null
            return (
                <div className="widget d-inline-block">
                    {date ? (
                        <DatePicker
                            initialSettings={{
                                endDate: date,
                                startDate: date,
                            }}
                            onSubmit={(date) => {
                                handleChange(date.toISOString())
                            }}
                        >
                            <div>
                                <Input
                                    value={
                                        date
                                            ? formatDatetime(
                                                  date,
                                                  datetimeFormat,
                                              ).toString()
                                            : ''
                                    }
                                    placeholder="Choose a date..."
                                />
                            </div>
                        </DatePicker>
                    ) : null}
                </div>
            )
        },
        [handleChange, datetimeFormat],
    )

    const timedeltaSelect = useCallback(
        (value: any) => {
            return (
                <div className="widget d-inline-block">
                    <TimedeltaPicker
                        className={css.timedeltaPicker}
                        value={value}
                        min={1}
                        onChange={handleChange as any}
                    />
                </div>
            )
        },
        [handleChange],
    )

    const snoozePicker = useCallback(
        (value: any) => {
            const units = [
                { label: 'minute(s)', value: 'm' },
                { label: 'hour(s)', value: 'h' },
                { label: 'day(s)', value: 'd' },
            ]

            return (
                <div className="widget d-inline-block">
                    <TimedeltaPicker
                        className={css.timedeltaPicker}
                        value={value}
                        min={1}
                        units={units}
                        onChange={handleChange as any}
                    />
                </div>
            )
        },
        [handleChange],
    )

    const resolveLeft = useCallback(
        (left: List<any>, schemas: Map<any, any>): List<any> => {
            // Check if this is a custom field path
            if (left.includes('custom_fields')) {
                const customFieldId = getCustomFieldIdFromPath(left)
                if (customFieldId) {
                    // Check if we're dealing with operators for custom fields
                    if (left.last() === 'operators') {
                        // Return the custom field operators schema path
                        return List([...customFieldPath, 'meta', 'operators'])
                    }

                    // Check if we're dealing with value input for custom fields
                    if (left.last() === 'value') {
                        // Return the custom field value schema path
                        return List([...customFieldPath, 'meta', 'value'])
                    }

                    return List(customFieldPath)
                }
            }

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
                        return resolveLeft(
                            newLeft.concat(newRight) as List<any>,
                            schemas,
                        )
                    }
                }
            }
            return left
        },
        [],
    )

    // todo should depend on triggers (should be described in schemas)
    const rootObjects = ['ticket', 'message']

    if (!(schemas && schemas.size && leftsiblings && leftsiblings.size)) {
        return null
    }

    const left = resolveLeft(leftsiblings, schemas)
    // widget data used for rendering
    const widget: {
        type: string
        value: any
        description: string
        options: (string | WidgetOption)[]
        multiple?: boolean
        deprecatedOptions?: string[]
        hiddenOptions?: string[]
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
        const props = (schemas.getIn(left) as Map<any, any>).toJS() as Record<
            string,
            unknown
        >
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
                            removeSuffix(key, '_datetime'),
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

        // TODO(@VictorXunS): Remove this when self_service_flow variables are in schemas
        if (left.includes('self_service_flow')) {
            operators = fromJS(BASIC_OPERATORS)
        }

        if (leftsiblings?.includes('metafields')) {
            widget.options = getMetafieldOperatorOptions(metafield?.type)
        } else if (leftsiblings.includes('custom_fields')) {
            // Get custom field operators from schemas based on field type
            const customFieldOperators = getCustomFieldOperators(
                schemas,
                customField,
            )

            // Convert operators object to array format expected by widget
            widget.options = Object.entries(customFieldOperators).map(
                ([key, value]) => ({
                    value: key,
                    label: (value as any)?.label || key,
                }),
            )
        } else if (operators) {
            // exclude deprecated operators which are not already used
            operators = operators.filter((ope: any, operatorName: string) => {
                if (deprecatedOperators.includes(operatorName)) {
                    return deprecatedOperators.includes(widget.value)
                }
                return true
            }) as Map<any, any>
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
            (
                parent.slice(0, -3).concat(['callee', 'name']) as List<any>
            ).insert(0, 'code_ast'),
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
        if (leftsiblings.join('.').includes('Ticket.properties.tags.name')) {
            widget.type = 'tags-select'
            widget.multiple = collectionOperators.includes(calleeName)
        }

        if (
            caseInsensitiveOperators.includes(calleeName) &&
            widget.type !== 'tags-select'
        ) {
            caseInsensitive = true
        }

        if (left.includes('order_management_flow')) {
            widget.type = 'self-service-order-management-flow-select'
        }
        if (left.includes('store_integration_id')) {
            widget.type = 'self-service-store-integration-select'
        }

        if (right) {
            const options: string[] = (
                right.getIn(['meta', 'enum'], List([])) as List<string>
            ).toJS()

            widget.options = options

            // Handle special cases for ticket channel and language.
            switch (left.last()) {
                case 'channel':
                    widget.options = options.map((option: string) => ({
                        value: option,
                        label: humanizeChannel(option),
                    }))
                    break
                case 'language':
                    widget.options = options.map((option: string) => ({
                        value: option,
                        label: getLanguageDisplayName(option) || option,
                    }))
                    break
                default:
                    break
            }

            widget.hiddenOptions = (
                right.getIn(
                    ['meta', 'rules', 'hidden_options'],
                    List([]),
                ) as List<string>
            ).toJS()

            widget.deprecatedOptions = (
                right.getIn(
                    ['meta', 'rules', 'deprecated_options'],
                    List([]),
                ) as List<string>
            ).toJS()

            widget.description = right.get('description')
        }

        if (left.includes('custom_fields')) {
            widget.type = 'custom_field-input'
        }
    }

    const operatorName = rule.getIn(
        (parent.slice(0, -3).concat(['callee', 'name']) as List<any>).insert(
            0,
            'code_ast',
        ),
    )

    if (left.includes('metafields') && left.last() !== 'operators') {
        const updated = applyMetafieldWidgetConfig(
            widget,
            metafield?.type,
            operatorName as string | undefined,
        )
        widget.type = updated.type
        if (updated.options) {
            widget.options = updated.options
        }
    }

    const isOperatorRelative = isTimedeltaOperator(operatorName)

    if (widget.type === 'datetime-select' && isOperatorRelative) {
        widget.type = 'timedelta-select'
    }

    switch (widget.type) {
        case 'intents-select':
            return (
                <IntentsSentimentsSelect
                    options={widget.options as string[]}
                    hiddenOptions={widget.hiddenOptions}
                    deprecatedOptions={widget.deprecatedOptions}
                    singular="intent"
                    plural="intents"
                    className={className}
                    values={widget.value}
                    onChange={handleChange}
                />
            )
        case 'sentiments-select':
            return (
                <IntentsSentimentsSelect
                    options={widget.options as string[]}
                    hiddenOptions={widget.hiddenOptions}
                    deprecatedOptions={widget.deprecatedOptions}
                    className={className}
                    values={widget.value}
                    onChange={handleChange}
                    singular="sentiment"
                    plural="sentiments"
                />
            )
        case 'multi-select':
            return (
                <MultiSelectField
                    className={`${className || ''} Text`}
                    values={widget.value}
                    singular="word"
                    plural="words"
                    showSymbolOnSpaces
                    allowCustomValues
                    onChange={handleChange as any}
                    caseInsensitive={caseInsensitive}
                />
            )
        case 'select':
            return (
                <Select
                    {...(widget as unknown as ComponentProps<typeof Select>)}
                    className={className}
                    onChange={handleChange}
                />
            )
        case 'status-select':
            return (
                <StatusSelect
                    {...widget}
                    className={className}
                    onChange={handleChange}
                />
            )
        case 'priority-select':
            return (
                <PrioritySelect
                    {...widget}
                    className={className}
                    onChange={handleChange}
                />
            )
        case 'tags-select':
            return (
                <TagsSelect
                    {...widget}
                    className={className}
                    onChange={handleChange}
                    caseInsensitive={caseInsensitive}
                    multiple={
                        _isUndefined(widget.multiple) ? true : widget.multiple
                    }
                />
            )
        case 'macro-select':
            return (
                <MacroSelect
                    {...widget}
                    className={className}
                    onChange={handleChange}
                />
            )
        case 'assignee_user-select':
            return (
                <AssigneeUserSelect
                    {...widget}
                    className={className}
                    onChange={handleChange}
                    allowUnassign={!operatorName}
                />
            )
        case 'assignee_team-select':
            return (
                <AssigneeTeamSelect
                    {...widget}
                    className={className}
                    onChange={handleChange}
                    allowUnassign={!operatorName}
                />
            )
        case 'integration-select':
            return <IntegrationSelect {...widget} onChange={handleChange} />
        case 'self-service-order-management-flow-select':
            return (
                <SelfServiceFlowSelect
                    {...widget}
                    className={className}
                    onChange={handleChange}
                    flowType={'order-management'}
                />
            )
        case 'self-service-store-integration-select':
            return (
                <SelfServiceStoreIntegrationSelect
                    {...widget}
                    className={className}
                    onChange={handleChange}
                />
            )
        case 'custom_field-select':
        case 'customer_field-select':
            return (
                <CustomFieldSelect
                    {...widget}
                    className={className}
                    value={widget.value}
                    onChange={handleChange}
                    objectType={
                        widget.type === 'custom_field-select'
                            ? 'Ticket'
                            : 'Customer'
                    }
                />
            )
        case 'custom_field-input':
        case 'customer_field-input': {
            const isConditionalCustomField =
                leftsiblings.includes('custom_fields')
            // Try to get custom field ID from properties first (for action-based custom fields)
            // If not available in properties, try to extract from the path (for condition-based custom fields)
            const customFieldId = isConditionalCustomField
                ? getCustomFieldIdFromPath(leftsiblings)
                : (properties[0]?.value.value as number | null)

            if (!customFieldId) {
                return null
            }
            const allowMultiValues =
                isConditionalCustomField && schemaDefinitionKey === 'dropdown'

            const customFieldProps =
                allowMultiValues || schemaDefinitionKey === 'boolean'
                    ? {
                          autoWidth: false,
                          CustomInput: CustomDropdownInput,
                      }
                    : {}

            return (
                <CustomFieldIdInput
                    {...widget}
                    customFieldId={customFieldId}
                    className={className}
                    value={widget.value}
                    onChange={handleChange}
                    allowMultiValues={allowMultiValues}
                    {...customFieldProps}
                />
            )
        }
        case 'csat-select':
            return (
                <Select
                    {...widget}
                    value={'★'.repeat(widget.value)}
                    options={['★', '★★', '★★★', '★★★★', '★★★★★']}
                    className={className}
                    onChange={(value: string) => handleChange(value.length)}
                />
            )

        case 'snooze-picker':
            return snoozePicker(value)
        case 'textarea':
            return textarea(value)
        case 'rich-field':
            return richField(value)
        case 'datetime-select':
            return datetimeSelect(value, datetimeFormat)
        case 'timedelta-select':
            return timedeltaSelect(value)
        case 'number-input':
            return input(value, 'number')
        case 'input':
        default:
            return input(value, 'text', caseInsensitive)
    }
}

export default Widget
