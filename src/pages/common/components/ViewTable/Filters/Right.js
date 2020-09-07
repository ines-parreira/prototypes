import React from 'react'
import PropTypes from 'prop-types'
import ImmutablePropTypes from 'react-immutable-proptypes'
import {connect} from 'react-redux'

import {IntegrationsDetailLabel} from '../../../utils/labels'
import {getLanguageDisplayName} from '../../../../../utils'

import {getMessagingIntegrations} from '../../../../../state/integrations/selectors.ts'
import * as viewsSelectors from '../../../../../state/views/selectors.ts'
import {getTags} from '../../../../../state/tags/selectors.ts'

import {timedeltaOperators} from '../../../../../config/rules'
import TagDropdownMenu from '../../TagDropdownMenu/TagDropdownMenu'

import FilterDropdown from '../FilterDropdown'
import DatetimePicker from '../../../forms/DatetimePicker'
import TimedeltaPicker from '../../../forms/TimedeltaPicker'
import MultiSelectField from '../../../forms/MultiSelectField'
import FilterMultiSelectField from '../FilterMultiSelectField'

@connect((state) => {
    return {
        integrations: getMessagingIntegrations(state),
        areFiltersValid: viewsSelectors.areFiltersValid(state),
        tags: getTags(state),
    }
})
export default class Right extends React.Component {
    static propTypes = {
        operator: PropTypes.object,
        areFiltersValid: PropTypes.bool.isRequired,
        config: ImmutablePropTypes.map.isRequired,
        field: ImmutablePropTypes.map,
        view: PropTypes.object,
        node: PropTypes.object,
        index: PropTypes.number.isRequired,
        agents: PropTypes.object.isRequired,
        teams: PropTypes.object.isRequired,
        integrations: PropTypes.object.isRequired,
        currentUser: PropTypes.object.isRequired,
        updateFieldFilter: PropTypes.func.isRequired,
        objectPath: PropTypes.string.isRequired,
        empty: PropTypes.bool.isRequired,
        tags: PropTypes.object.isRequired,
    }

    static defaultProps = {
        empty: false,
    }

    state = {
        dropdownOpen: false,
        selectedOptions: [],
    }

    componentDidMount() {
        // Automatically set the first option
        // if the operator is not an empty operator AND the field has only one option
        if (!this.props.empty && this.props.node.value === '') {
            this._selectFirstOption()
        }
    }

    componentDidUpdate() {
        // Automatically set the first option
        // if the operator is not an empty operator AND the field has only one option
        if (!this.props.empty && this.props.node.value === '') {
            this._selectFirstOption()
        }
    }

    _selectFirstOption = () => {
        const {updateFieldFilter, field, index} = this.props

        if (!field) {
            return
        }

        const options = field.getIn(['filter', 'enum'])

        if (options && options.size === 1) {
            updateFieldFilter(index, options.first())
        }
    }

    _toggleDropdown = () => {
        this.setState({dropdownOpen: !this.state.dropdownOpen})
    }

    _mapTagSearchResultsToOptions = (results) => {
        return results.map((result) => ({
            value: result.name,
            label: result.name,
        }))
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
        } = this.props

        if (empty) {
            return <span />
        }

        if (!field) {
            return (
                <div>
                    <div className="btn btn-outline-danger btn-frozen mr-2">
                        {node.value ? node.value.toString() : node.value}
                    </div>
                </div>
            )
        }

        let displayedValue = node.value

        if (displayedValue === '{{current_user.id}}') {
            // display current user variable
            displayedValue = 'Me (current user)'
        } else if (field.get('name') === 'integrations') {
            // display integration
            if (node.type === 'ArrayExpression') {
                const selectedOptions = node.elements.map((opt) => opt.value)
                const options = this.props.integrations
                    .map((integration) => ({
                        label: integration.get('name'),
                        displayLabel: (
                            <IntegrationsDetailLabel
                                integration={integration}
                            />
                        ),
                        value: integration.get('id'),
                    }))
                    .toJS()

                return (
                    <MultiSelectField
                        values={selectedOptions}
                        options={options}
                        singular="integration"
                        plural="integrations"
                        onChange={(value) => updateFieldFilter(index, value)}
                    />
                )
            }

            const integration = this.props.integrations.find(
                (integration) =>
                    integration.get('id').toString() ===
                    displayedValue.toString()
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
                    team.get('id').toString() === displayedValue.toString()
            )
            if (assignee) {
                displayedValue = <span>{assignee.get('name')}</span>
            }
        } else if (field.get('name') === 'assignee') {
            // display assignee user
            const assignee = this.props.agents.find(
                (agent) =>
                    agent.get('id').toString() === displayedValue.toString()
            )
            if (assignee) {
                displayedValue = <span>{assignee.get('name')}</span>
            }
        } else if (field.get('name') === 'customer') {
            // display customer
            displayedValue = `Customer #${displayedValue}`
        } else if (field.get('name') === 'language') {
            // show the display name
            displayedValue = getLanguageDisplayName(displayedValue)
        } else if ((field.get('path') || '').endsWith('_datetime')) {
            if (timedeltaOperators.includes(operator.name)) {
                return (
                    <TimedeltaPicker
                        value={displayedValue}
                        onChange={(value) => updateFieldFilter(index, value)}
                    />
                )
            }

            return (
                <DatetimePicker
                    datetime={displayedValue}
                    onChange={(value) => updateFieldFilter(index, value)}
                />
            )
        } else if (field.get('name') === 'tags') {
            if (node.type === 'ArrayExpression') {
                const selectedOptions = node.elements.map((opt) => ({
                    label: opt.value,
                    value: opt.value,
                }))

                return (
                    <FilterMultiSelectField
                        field={field}
                        selectedOptions={selectedOptions}
                        singular="tag"
                        plural="tags"
                        onChange={(options) =>
                            updateFieldFilter(
                                index,
                                options.map((option) => option.value)
                            )
                        }
                        mapSearchResults={this._mapTagSearchResultsToOptions}
                        dropdownMenu={TagDropdownMenu}
                    />
                )
            }
        } else if (field.get('name') === 'channel') {
            if (node.type === 'ArrayExpression') {
                const selectedOptions = node.elements.map((opt) => opt.value)
                const options = field
                    .getIn(['filter', 'enum'])
                    .map((val) => ({
                        label: val,
                        value: val,
                    }))
                    .toJS()

                return (
                    <MultiSelectField
                        values={selectedOptions}
                        options={options}
                        singular="channel"
                        plural="channels"
                        onChange={(value) => updateFieldFilter(index, value)}
                    />
                )
            }
        }

        return (
            <div>
                <div onClick={this._toggleDropdown}>
                    {node.value === '' ? (
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
