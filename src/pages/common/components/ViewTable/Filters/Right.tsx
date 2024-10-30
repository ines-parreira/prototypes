import {ArrayExpression, Expression, Identifier, Literal} from 'estree'
import {List, Map, Seq} from 'immutable'
import {LDFlagSet} from 'launchdarkly-js-client-sdk'
import {withLDConsumer} from 'launchdarkly-react-client-sdk'
import _debounce from 'lodash/debounce'
import moment from 'moment-timezone'
import React, {Component, ReactNode} from 'react'
import {connect, ConnectedProps} from 'react-redux'
import {Input} from 'reactstrap'

import {timedeltaOperators} from 'config/rules'
import {DateAndTimeFormatting, TimeFormatType} from 'constants/datetime'
import CustomFieldByIdInput from 'custom-fields/components/CustomFieldByIdInput/CustomFieldByIdInput'
import {isMultiValue} from 'custom-fields/components/MultiLevelSelect/helpers/isMultiValue'
import {CustomFieldValue} from 'custom-fields/types'
import TagDropdownMenu from 'pages/common/components/TagDropdownMenu/TagDropdownMenu'
import FilterDropdown from 'pages/common/components/ViewTable/FilterDropdown'
import FilterMultiSelectField from 'pages/common/components/ViewTable/FilterMultiSelectField'
import DatePicker from 'pages/common/forms/DatePicker'
import MultiSelectField from 'pages/common/forms/MultiSelectField'
import {Option} from 'pages/common/forms/MultiSelectOptionsField/types'
import TimedeltaPicker from 'pages/common/forms/TimedeltaPicker'
import {IntegrationsDetailLabel} from 'pages/common/utils/labels'
import {
    getDateAndTimeFormatter,
    getTimeFormatPreferenceSetting,
} from 'state/currentUser/selectors'
import {getMessagingAndAppIntegrations} from 'state/integrations/selectors'
import {getTags} from 'state/tags/selectors'
import {humanizeChannel} from 'state/ticket/utils'
import {RootState} from 'state/types'
import {updateFieldFilter} from 'state/views/actions'
import * as viewsSelectors from 'state/views/selectors'
import {FieldSearchResult} from 'state/views/types'
import {formatDatetime, getLanguageDisplayName} from 'utils'
import {stringToDatetime} from 'utils/date'

import css from './Right.less'
import {getCustomFieldIdFromObjectPath, getMultiSelectLabel} from './utils'

type OwnProps = {
    operator: Identifier
    config: Map<any, any>
    field: Map<any, any>
    node: Expression
    index: number
    agents: List<Map<any, any>>
    teams: List<Map<any, any>> | Seq.Indexed<Map<any, any>>
    updateFieldFilter: typeof updateFieldFilter
    objectPath: string
    empty: boolean
    flags?: LDFlagSet
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
        const {empty, node} = this.props

        if (!empty) {
            if ('value' in node) {
                if (node.value === '') {
                    // Automatically set the first option
                    // if the operator is not an empty operator AND the field has only one option
                    this._selectFirstOption()
                } else if (this._isTicketFieldExpression()) {
                    this.setState({
                        renderedCustomFieldValue:
                            node.value as CustomFieldValue,
                    })
                }
            } else if (
                this._isTicketFieldExpression() &&
                (node as ArrayExpression)?.type === 'ArrayExpression'
            ) {
                this.setState({
                    renderedCustomFieldValue: (
                        node as ArrayExpression
                    ).elements.map(
                        (opt) => (opt as Literal).value as CustomFieldValue
                    ),
                })
            }
        }
    }

    componentDidUpdate() {
        const {empty, node} = this.props
        // Automatically set the first option
        // if the operator is not an empty operator AND the field has only one option
        if (!empty && 'value' in node && node.value === '') {
            this._selectFirstOption()
        }
    }

    componentWillReceiveProps(nextProps: Readonly<Props>) {
        const {node} = nextProps

        if (
            this._isTicketFieldExpression() &&
            (!node ||
                (typeof (node as Literal).value !== 'boolean' &&
                    !(node as Literal).value &&
                    !(node as ArrayExpression).elements) ||
                (node as ArrayExpression).elements?.length === 0)
        ) {
            this.setState({renderedCustomFieldValue: undefined})
        }
    }

    _isTicketFieldExpression = () => {
        return this.props.field.get('name') === 'ticket_field'
    }

    _selectFirstOption = () => {
        const {updateFieldFilter, field, index} = this.props

        if (!field) {
            return
        }

        const options: List<string> = field.getIn(['filter', 'enum'])

        if (options && options.size === 1) {
            updateFieldFilter(index, options.first())
        }
    }

    _toggleDropdown = () => {
        this.setState({dropdownOpen: !this.state.dropdownOpen})
    }

    _mapTagSearchResultsToOptions = (
        results: FieldSearchResult[]
    ): Option[] => {
        return results.map((result: FieldSearchResult) => ({
            value: result.name,
            label: result.name,
        }))
    }

    _debouncedUpdateFieldFilter = _debounce(this.props.updateFieldFilter, 300)

    _handleCustomFieldChange = (
        value: CustomFieldValue | CustomFieldValue[] | undefined
    ) => {
        this._debouncedUpdateFieldFilter(this.props.index, value)
        this.setState({renderedCustomFieldValue: value})
    }

    _getCustomMultiSelectLabel = (
        value: CustomFieldValue | CustomFieldValue[] | undefined
    ) => {
        if (isMultiValue(value)) {
            return getMultiSelectLabel(value)
        }
        return ''
    }

    render() {
        const {operator, node, config, field, updateFieldFilter, index, empty} =
            this.props

        if (empty) {
            return <span />
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

        let displayedValue: Literal['value'] | ReactNode = (node as Literal)
            .value

        if (displayedValue === '{{current_user.id}}') {
            // display current user variable
            displayedValue = 'Me (current user)'
        } else if (field.get('name') === 'integrations') {
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
                    displayedValue!.toString()
            )
            if (integration) {
                displayedValue = (
                    <IntegrationsDetailLabel integration={integration} />
                )
            }
        } else if (field.get('name') === 'assignee_team') {
            // display assignee team
            const assignee = this.props.teams.find(
                (team) =>
                    (team!.get('id') as number).toString() ===
                    displayedValue!.toString()
            )

            if (assignee) {
                displayedValue = <span>{assignee.get('name')}</span>
            }
        } else if (field.get('name') === 'assignee') {
            // display assignee user
            const assignee = this.props.agents.find(
                (agent) =>
                    (agent!.get('id') as number).toString() ===
                    displayedValue!.toString()
            )
            if (assignee) {
                displayedValue = <span>{assignee.get('name')}</span>
            }
        } else if (field.get('name') === 'customer') {
            // display customer
            displayedValue = `Customer #${displayedValue as string}`
        } else if (field.get('name') === 'language') {
            // show the display name
            displayedValue = getLanguageDisplayName(
                displayedValue as Maybe<string>
            )
        } else if (
            ((field.get('path') as string) || '').endsWith('_datetime')
        ) {
            if (timedeltaOperators.includes(operator.name)) {
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
                                this.props.datetimeFormat
                            ).toString()}
                            placeholder="Choose a date..."
                        />
                    </div>
                </DatePicker>
            )
        } else if (field.get('name') === 'tags') {
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
                                    (option: Option) => option.value as unknown
                                )
                            )
                        }
                        mapSearchResults={this._mapTagSearchResultsToOptions}
                        dropdownMenu={TagDropdownMenu}
                    />
                )
            }
        } else if (field.get('name') === 'channel') {
            if (typeof displayedValue === 'string') {
                displayedValue = humanizeChannel(displayedValue)
            }

            if (node.type === 'ArrayExpression') {
                const selectedOptions = node.elements.map(
                    (opt) => (opt as Literal).value
                )
                const options = (
                    (field.getIn(['filter', 'enum']) as List<any>).map(
                        (val: string) => ({
                            label: humanizeChannel(val),
                            value: val,
                        })
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
        } else if (this._isTicketFieldExpression()) {
            const customFieldId = getCustomFieldIdFromObjectPath(
                this.props.objectPath
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
        }

        return (
            <div>
                <div onClick={this._toggleDropdown}>
                    {(node as Literal).value === '' ? (
                        <div className="btn btn-secondary btn-sm dropdown-toggle clickable">
                            Select a value
                        </div>
                    ) : (
                        <div className="btn btn-light btn-sm dropdown-toggle clickable">
                            {displayedValue}
                        </div>
                    )}
                </div>
                {this.state.dropdownOpen && (
                    <FilterDropdown
                        viewConfig={config}
                        field={field}
                        updateFieldFilter={(value) =>
                            updateFieldFilter(index, value)
                        }
                        toggleDropdown={this._toggleDropdown}
                        menu={
                            field.get('name') === 'tags'
                                ? TagDropdownMenu
                                : undefined
                        }
                    />
                )}
            </div>
        )
    }
}

const connector = connect((state: RootState) => {
    return {
        integrations: getMessagingAndAppIntegrations(state),
        areFiltersValid: viewsSelectors.areFiltersValid(state),
        tags: getTags(state),
        datetimeFormat: getDateAndTimeFormatter(state)(
            DateAndTimeFormatting.CompactDateWithTime
        ),
        timeSettings: getTimeFormatPreferenceSetting(state),
    }
})

export default connector(withLDConsumer()(RightContainer))
