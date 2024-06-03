import React, {Component, ReactNode} from 'react'
import {connect, ConnectedProps} from 'react-redux'
import {Expression, Identifier, Literal} from 'estree'
import {List, Map, Seq} from 'immutable'
import moment from 'moment-timezone'
import {Input} from 'reactstrap'
import {withLDConsumer} from 'launchdarkly-react-client-sdk'
import {LDFlagSet} from 'launchdarkly-js-client-sdk'

import {humanizeChannel} from 'state/ticket/utils'
import {formatDatetime, getLanguageDisplayName} from 'utils'
import {DateAndTimeFormatting, TimeFormatType} from 'constants/datetime'
import {
    getDateAndTimeFormatter,
    getTimeFormatPreferenceSetting,
} from 'state/currentUser/selectors'
import {IntegrationsDetailLabel} from 'pages/common/utils/labels'
import {stringToDatetime} from 'utils/date'

import {getMessagingAndAppIntegrations} from 'state/integrations/selectors'
import * as viewsSelectors from 'state/views/selectors'
import {getTags} from 'state/tags/selectors'
import {updateFieldFilter} from 'state/views/actions'
import {RootState} from 'state/types'
import {Option} from 'pages/common/forms/MultiSelectOptionsField/types'
import {FieldSearchResult} from 'state/views/types'

import {timedeltaOperators} from 'config/rules'

import TagDropdownMenu from 'pages/common/components/TagDropdownMenu/TagDropdownMenu'

import FilterDropdown from 'pages/common/components/ViewTable/FilterDropdown'
import DatePicker from 'pages/common/forms/DatePicker'
import TimedeltaPicker from 'pages/common/forms/TimedeltaPicker'
import MultiSelectField from 'pages/common/forms/MultiSelectField'
import FilterMultiSelectField from 'pages/common/components/ViewTable/FilterMultiSelectField'
import {FeatureFlagKey} from 'config/featureFlags'

import css from 'pages/common/components/ViewTable/Filters/Right.less'

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
}

export class RightContainer extends Component<Props, State> {
    static defaultProps: Pick<Props, 'empty'> = {
        empty: false,
    }

    state = {
        dropdownOpen: false,
        selectedOptions: [],
    }

    componentDidMount() {
        const {empty, node} = this.props
        // Automatically set the first option
        // if the operator is not an empty operator AND the field has only one option
        if (!empty && 'value' in node && node.value === '') {
            this._selectFirstOption()
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

            const v2StylesEnabled =
                this.props.flags?.[FeatureFlagKey.NewTicketSnoozeAndTicketDate]

            const v2Props = {
                actionButtonsOnTheBottom: !!v2StylesEnabled,
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
                        applyButtonClasses:
                            v2StylesEnabled === true
                                ? 'btn-primary'
                                : undefined,
                        timePicker24Hour:
                            this.props.timeSettings ===
                            TimeFormatType.TwentyFourHour,
                    }}
                    onSubmit={(date) => {
                        updateFieldFilter(index, date.toISOString())
                    }}
                    {...v2Props}
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
