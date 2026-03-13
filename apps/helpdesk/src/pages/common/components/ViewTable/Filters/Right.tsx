import type { ReactNode } from 'react'
import { Component } from 'react'

import {
    DateAndTimeFormatting,
    formatDatetime,
    TimeFormatType,
} from '@repo/utils'
import type { ArrayExpression, Expression, Identifier, Literal } from 'estree'
import type { List, Map, Seq } from 'immutable'
import { fromJS } from 'immutable'
import _debounce from 'lodash/debounce'
import _upperFirst from 'lodash/upperFirst'
import moment from 'moment-timezone'
import type { ConnectedProps } from 'react-redux'
import { connect } from 'react-redux'
import { Input } from 'reactstrap'

import type { StoreMapping } from '@gorgias/helpdesk-types'

import CustomFieldByIdInput from 'custom-fields/components/CustomFieldByIdInput/CustomFieldByIdInput'
import { isMultiValue } from 'custom-fields/components/MultiLevelSelect/helpers/isMultiValue'
import type { CustomFieldValue } from 'custom-fields/types'
import { ViewField } from 'models/view/types'
import TagDropdownMenu from 'pages/common/components/TagDropdownMenu/TagDropdownMenu'
import FilterDropdown from 'pages/common/components/ViewTable/FilterDropdown'
import FilterMultiSelectField from 'pages/common/components/ViewTable/FilterMultiSelectField'
import { getQaScoreDimensionFromObjectPath } from 'pages/common/components/ViewTable/Filters/utils/qaScoreDimensions'
import DatePicker from 'pages/common/forms/DatePicker'
import MultiSelectField from 'pages/common/forms/MultiSelectField'
import type { Option } from 'pages/common/forms/MultiSelectOptionsField/types'
import TimedeltaPicker from 'pages/common/forms/TimedeltaPicker'
import { IntegrationsDetailLabel } from 'pages/common/utils/labels'
import {
    getDateAndTimeFormatter,
    getTimeFormatPreferenceSetting,
} from 'state/currentUser/selectors'
import {
    getMessagingAndAppIntegrations,
    getStoreIntegrations,
} from 'state/integrations/selectors'
import { isTimedeltaOperator } from 'state/rules/types'
import { getTags } from 'state/tags/selectors'
import { humanizeChannel, humanizeCSATScore } from 'state/ticket/utils'
import type { RootState } from 'state/types'
import type { updateFieldFilter } from 'state/views/actions'
import * as viewsSelectors from 'state/views/selectors'
import type { FieldSearchResult } from 'state/views/types'
import { fieldPath, getLanguageDisplayName } from 'utils'
import { stringToDatetime } from 'utils/date'

import { getCustomFieldIdFromObjectPath, getMultiSelectLabel } from './utils'
import {
    QaScoreDimensions,
    RESOLUTION_COMPLETENESS_OPTIONS,
} from './utils/qaScoreDimensions'

import css from './Right.less'

type OwnProps = {
    operator: Identifier
    config: Map<any, any>
    field: Map<any, any> | undefined
    node: Expression
    index: number
    agents: List<Map<any, any>>
    teams: List<Map<any, any>> | Seq.Indexed<Map<any, any>>
    updateFieldFilter: typeof updateFieldFilter
    objectPath: string
    empty: boolean
    storeMappings: StoreMapping[]
}

type Props = OwnProps & ConnectedProps<typeof connector>

type State = {
    dropdownOpen: boolean
    renderedCustomFieldValue?: CustomFieldValue | CustomFieldValue[] | undefined
}
export class RightContainer extends Component<Props, State> {
    static defaultProps: Pick<Props, 'empty'> = {
        empty: false,
    }

    state = {
        dropdownOpen: false,
        selectedOptions: [],
        renderedCustomFieldValue: undefined,
    }

    componentDidMount() {
        const { empty, node } = this.props

        if (!empty) {
            if ('value' in node) {
                if (node.value === '') {
                    // Automatically set the first option
                    // if the operator is not an empty operator AND the field has only one option
                    this._selectFirstOption()
                } else if (this._isCustomFieldExpression()) {
                    this.setState({
                        renderedCustomFieldValue:
                            node.value as CustomFieldValue,
                    })
                }
            } else if (
                this._isCustomFieldExpression() &&
                (node as ArrayExpression)?.type === 'ArrayExpression'
            ) {
                this.setState({
                    renderedCustomFieldValue: (
                        node as ArrayExpression
                    ).elements.map(
                        (opt) => (opt as Literal).value as CustomFieldValue,
                    ),
                })
            }
        }
    }

    componentDidUpdate() {
        const { empty, node } = this.props
        // Automatically set the first option
        // if the operator is not an empty operator AND the field has only one option
        if (!empty && 'value' in node && node.value === '') {
            this._selectFirstOption()
        }

        if (
            this._isCustomFieldExpression() &&
            (!node ||
                (typeof (node as Literal).value !== 'boolean' &&
                    !(node as Literal).value &&
                    !(node as ArrayExpression).elements) ||
                (node as ArrayExpression).elements?.length === 0) &&
            this.state.renderedCustomFieldValue !== undefined
        ) {
            this.setState({ renderedCustomFieldValue: undefined })
        }
    }

    _isCustomFieldExpression = () => {
        if (!this.props.field) {
            return false
        }

        return fieldPath(this.props.field).includes('custom_fields')
    }

    _selectFirstOption = () => {
        const { updateFieldFilter, field, index } = this.props

        if (!field) {
            return
        }

        const options: List<string> = field.getIn(['filter', 'enum'])

        if (options && options.size === 1) {
            updateFieldFilter(index, options.first())
        }
    }

    _toggleDropdown = () => {
        this.setState({ dropdownOpen: !this.state.dropdownOpen })
    }

    _mapTagSearchResultsToOptions = (
        results: FieldSearchResult[],
    ): Option[] => {
        return results.map((result: FieldSearchResult) => ({
            value: result.name,
            label: result.name,
        }))
    }

    _debouncedUpdateFieldFilter = _debounce(this.props.updateFieldFilter, 300)

    _handleCustomFieldChange = (
        value: CustomFieldValue | CustomFieldValue[] | undefined,
    ) => {
        this._debouncedUpdateFieldFilter(this.props.index, value)
        this.setState({ renderedCustomFieldValue: value })
    }

    _getCustomMultiSelectLabel = (
        value: CustomFieldValue | CustomFieldValue[] | undefined,
    ) => {
        if (isMultiValue(value)) {
            return getMultiSelectLabel(value)
        }
        return ''
    }

    render() {
        const {
            operator,
            node,
            config,
            field,
            updateFieldFilter,
            index,
            empty,
            objectPath,
        } = this.props

        if (empty) {
            return null
        }

        if (!field && 'value' in node) {
            return (
                <div>
                    <div className="btn btn-outline-danger btn-frozen mr-2">
                        {node.value ? node.value.toString() : node.value}
                    </div>
                </div>
            )
        }

        // not bound to happen, just a TS safety check
        if (!field) {
            return null
        }

        let displayedValue: Literal['value'] | ReactNode = (node as Literal)
            .value
        const fieldName = field.get('name')
        let modifiedField: Map<any, any> | null = null
        if (displayedValue === '{{current_user.id}}') {
            // display current user variable
            displayedValue = 'Me (current user)'
        } else if (fieldName === ViewField.Integrations) {
            // display integration
            if (node.type === 'ArrayExpression') {
                const selectedOptions = node.elements.map((opt) => {
                    return (opt as Literal).value
                })
                const options = this.props.integrations
                    .map((integration) => ({
                        label: integration!.get('name') as string,
                        displayLabel: (
                            <IntegrationsDetailLabel
                                integration={integration!}
                            />
                        ),
                        value: integration!.get('id') as number,
                    }))
                    .toJS()

                return (
                    <MultiSelectField
                        values={selectedOptions}
                        options={options}
                        singular="integration"
                        plural="integrations"
                        onChange={(value: Option[]) =>
                            updateFieldFilter(index, value)
                        }
                    />
                )
            }

            const integration = this.props.integrations.find(
                (integration) =>
                    (integration!.get('id') as number).toString() ===
                    displayedValue!.toString(),
            )
            if (integration) {
                displayedValue = (
                    <IntegrationsDetailLabel integration={integration} />
                )
            }
        } else if (fieldName === ViewField.Store) {
            // display store
            if (node.type === 'ArrayExpression') {
                const selectedOptions = node.elements.map((opt) => {
                    return (opt as Literal).value
                })
                const storeOptions = this.props.storeIntegrationMapping.map(
                    ({ integration, id }) => {
                        return {
                            label: integration.name,
                            displayLabel: (
                                <IntegrationsDetailLabel
                                    integration={fromJS(integration)}
                                />
                            ),
                            value: id,
                        }
                    },
                )

                return (
                    <MultiSelectField
                        values={selectedOptions}
                        options={storeOptions}
                        singular="store"
                        plural="stores"
                        onChange={(value: Option[]) =>
                            updateFieldFilter(index, value)
                        }
                    />
                )
            }

            modifiedField = field.setIn(
                ['filter', 'enum'],
                fromJS(this.props.storeIntegrationMapping),
            )
            const storeIntegration = this.props.storeIntegrationMapping.find(
                (mapping) => mapping.id === displayedValue,
            )
            if (storeIntegration) {
                displayedValue = (
                    <IntegrationsDetailLabel
                        integration={fromJS(storeIntegration.integration)}
                    />
                )
            }
        } else if (fieldName === ViewField.AssigneeTeam) {
            // display assignee team
            const assignee = this.props.teams.find(
                (team) =>
                    (team!.get('id') as number).toString() ===
                    displayedValue!.toString(),
            )

            if (assignee) {
                displayedValue = <span>{assignee.get('name')}</span>
            }
        } else if (fieldName === ViewField.Assignee) {
            // display assignee user
            const assignee = this.props.agents.find(
                (agent) =>
                    (agent!.get('id') as number).toString() ===
                    displayedValue!.toString(),
            )
            if (assignee) {
                displayedValue = <span>{assignee.get('name')}</span>
            }
        } else if (fieldName === ViewField.Customer) {
            // display customer
            displayedValue = `Customer #${displayedValue as string}`
        } else if (fieldName === ViewField.Language) {
            // show the display name
            displayedValue = getLanguageDisplayName(
                displayedValue as Maybe<string>,
            )
        } else if (
            ((field.get('path') as string) || '').endsWith('_datetime')
        ) {
            if (isTimedeltaOperator(operator.name)) {
                return (
                    <TimedeltaPicker
                        className={css.timedeltaPicker}
                        value={displayedValue as string}
                        onChange={(value: string) =>
                            updateFieldFilter(index, value)
                        }
                    />
                )
            }

            const datetime =
                (displayedValue &&
                    stringToDatetime(displayedValue as string)) ||
                moment()

            return (
                <DatePicker
                    initialSettings={{
                        endDate: datetime,
                        startDate: datetime,
                        timePicker24Hour:
                            this.props.timeSettings ===
                            TimeFormatType.TwentyFourHour,
                    }}
                    onSubmit={(date) => {
                        updateFieldFilter(index, date.toISOString())
                    }}
                    additionalPickerClassName="add-calendar-spacing"
                >
                    <div>
                        <Input
                            value={formatDatetime(
                                datetime,
                                this.props.datetimeFormat,
                            ).toString()}
                            placeholder="Choose a date..."
                        />
                    </div>
                </DatePicker>
            )
        } else if (fieldName === ViewField.Tags) {
            if (node.type === 'ArrayExpression') {
                const selectedOptions: Option[] = node.elements.map((opt) => ({
                    label: (opt as Literal).value as string,
                    value: (opt as Literal).value,
                }))

                return (
                    <FilterMultiSelectField
                        field={field}
                        selectedOptions={selectedOptions}
                        singular="tag"
                        plural="tags"
                        onChange={(options: Option[]) =>
                            updateFieldFilter(
                                index,
                                options.map(
                                    (option: Option) => option.value as unknown,
                                ),
                            )
                        }
                        mapSearchResults={this._mapTagSearchResultsToOptions}
                        dropdownMenu={TagDropdownMenu}
                    />
                )
            }
        } else if (fieldName === ViewField.Channel) {
            if (typeof displayedValue === 'string') {
                displayedValue = humanizeChannel(displayedValue)
            }

            if (node.type === 'ArrayExpression') {
                const selectedOptions = node.elements.map(
                    (opt) => (opt as Literal).value,
                )
                const options = (
                    (field.getIn(['filter', 'enum']) as List<any>).map(
                        (val: string) => ({
                            label: humanizeChannel(val),
                            value: val,
                        }),
                    ) as unknown as List<Map<any, any>>
                ).toJS()

                return (
                    <MultiSelectField
                        values={selectedOptions}
                        options={options}
                        singular="channel"
                        plural="channels"
                        onChange={(value: Option[]) =>
                            updateFieldFilter(index, value)
                        }
                    />
                )
            }
        } else if (
            [ViewField.CSATScore, ViewField.QAScore].includes(fieldName)
        ) {
            if (node.type === 'ArrayExpression') {
                const selectedOptions = node.elements.map(
                    (opt) => (opt as Literal).value,
                )

                const isResolutionCompleteness =
                    getQaScoreDimensionFromObjectPath(objectPath) ===
                    QaScoreDimensions.RESOLUTION_COMPLETENESS

                const options = isResolutionCompleteness
                    ? RESOLUTION_COMPLETENESS_OPTIONS
                    : (
                          field
                              .getIn(['filter', 'enum'])
                              .map((val: number) => ({
                                  label: humanizeCSATScore(val),
                                  value: val,
                              })) as unknown as List<Map<any, any>>
                      ).toJS()
                return (
                    <MultiSelectField
                        values={selectedOptions}
                        options={options}
                        singular={isResolutionCompleteness ? 'value' : 'score'}
                        plural={isResolutionCompleteness ? 'values' : 'scores'}
                        onChange={(value: Option[]) =>
                            updateFieldFilter(index, value)
                        }
                    />
                )
            }
        } else if (this._isCustomFieldExpression()) {
            const customFieldId = getCustomFieldIdFromObjectPath(
                this.props.objectPath,
            )

            if (customFieldId) {
                const isArrayExpression = node.type === 'ArrayExpression'

                return (
                    <CustomFieldByIdInput
                        onChange={this._handleCustomFieldChange}
                        customFieldId={Number(customFieldId)}
                        className={css.customFieldValueInput}
                        placeholder={
                            isArrayExpression
                                ? 'Select value(s)...'
                                : 'Set value...'
                        }
                        {...(isArrayExpression
                            ? {
                                  value: this.state.renderedCustomFieldValue,
                                  dropdownAdditionalProps: {
                                      customDisplayValue:
                                          this._getCustomMultiSelectLabel,
                                      allowMultiValues: true,
                                  },
                              }
                            : {
                                  value:
                                      this.state.renderedCustomFieldValue ?? '',
                              })}
                    />
                )
            }
        } else if (fieldName === ViewField.Feedback) {
            if (node.type === 'ArrayExpression') {
                const selectedOptions = node.elements.map(
                    (opt) => (opt as Literal).value,
                )
                const options = (
                    field.getIn(['filter', 'enum']) as List<{
                        value: string
                        label: string
                    }>
                ).toJS()

                return (
                    <MultiSelectField
                        values={selectedOptions}
                        options={options}
                        singular="feedback value"
                        plural="feedback values"
                        onChange={(value: Option[]) =>
                            updateFieldFilter(index, value)
                        }
                    />
                )
            }
        } else if (fieldName === ViewField.Priority) {
            if (node.type === 'ArrayExpression') {
                const selectedOptions = node.elements.map(
                    (opt) => (opt as Literal)?.value,
                )
                const options = (
                    field.getIn(['filter', 'enum'], fromJS([])) as List<string>
                )
                    .map((val) => ({
                        value: val,
                        label: _upperFirst(val),
                    }))
                    .toJS()

                return (
                    <MultiSelectField
                        values={selectedOptions}
                        options={options}
                        singular="priority"
                        plural="priorities"
                        onChange={(value: Option[]) =>
                            updateFieldFilter(index, value)
                        }
                    />
                )
            }
        }

        const safeDisplayValue =
            displayedValue instanceof RegExp
                ? displayedValue.toString()
                : displayedValue

        return (
            <div>
                <div onClick={this._toggleDropdown}>
                    {(node as Literal).value === '' ? (
                        <div className="btn btn-secondary btn-sm dropdown-toggle clickable">
                            Select a value
                        </div>
                    ) : (
                        <div className="btn btn-light btn-sm dropdown-toggle clickable">
                            {safeDisplayValue}
                        </div>
                    )}
                </div>
                {this.state.dropdownOpen && (
                    <FilterDropdown
                        viewConfig={config}
                        field={modifiedField || field}
                        updateFieldFilter={(value) =>
                            updateFieldFilter(index, value)
                        }
                        toggleDropdown={this._toggleDropdown}
                        menu={
                            fieldName === ViewField.Tags
                                ? TagDropdownMenu
                                : undefined
                        }
                    />
                )}
            </div>
        )
    }
}

const connector = connect((state: RootState, ownProps: OwnProps) => {
    const storeIntegrations = getStoreIntegrations(state)
    const storeIntegrationMapping = storeIntegrations.reduce(
        (acc, integration) => {
            const storeId = ownProps.storeMappings.find(
                (map) => map.store_id === integration.id,
            )?.store_id

            if (storeId) {
                acc.push({
                    integration,
                    id: storeId,
                })
            }

            return acc
        },
        [] as Array<{ integration: any; id: number }>,
    )

    return {
        integrations: getMessagingAndAppIntegrations(state),
        storeIntegrationMapping: storeIntegrationMapping,
        areFiltersValid: viewsSelectors.areFiltersValid(state),
        tags: getTags(state),
        datetimeFormat: getDateAndTimeFormatter(state)(
            DateAndTimeFormatting.CompactDateWithTime,
        ),
        timeSettings: getTimeFormatPreferenceSetting(state),
    }
})

export default connector(RightContainer)
