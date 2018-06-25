import React, {PropTypes} from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'
import {connect} from 'react-redux'

import {UserLabel, IntegrationsDetailLabel} from '../../../utils/labels'
import {getLanguageDisplayName} from '../../../../../utils'

import * as viewsActions from '../../../../../state/views/actions'

import {getMessagingIntegrations} from '../../../../../state/integrations/selectors'
import * as viewsSelectors from '../../../../../state/views/selectors'

import {timedeltaOperators} from '../../../../../config/rules'

import FilterDropdown from '../FilterDropdown'
import DatetimePicker from '../../../forms/DatetimePicker'
import TimedeltaPicker from '../../../forms/TimedeltaPicker'

@connect((state) => {
    return {
        integrations: getMessagingIntegrations(state),
        areFiltersValid: viewsSelectors.areFiltersValid(state),
    }
}, {
    fetchPage: viewsActions.fetchPage,
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
        integrations: PropTypes.object.isRequired,
        fetchPage: PropTypes.func.isRequired,
        currentUser: PropTypes.object.isRequired,
        updateFieldFilter: PropTypes.func.isRequired,
        updateFieldFilterOperator: PropTypes.func.isRequired,
        objectPath: PropTypes.string.isRequired,
        empty: PropTypes.bool.isRequired,
    }

    static defaultProps = {
        empty: false
    }

    state = {
        dropdownOpen: false,
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

    render() {
        const {operator, node, config, field, updateFieldFilter, updateFieldFilterOperator, index, empty} = this.props

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

        if (displayedValue === '{{current_user.id}}') { // display current user variable
            displayedValue = 'Me (current user)'
        } else if (field.get('name') === 'integrations') { // display integration
            const integration = this.props.integrations.find(integration => integration.get('id').toString() === displayedValue.toString())
            if (integration) {
                displayedValue = (
                    <IntegrationsDetailLabel integration={integration} />
                )
            }
        } else if (field.get('name') === 'assignee') { // display assignee
            const assignee = this.props.agents.find(agent => agent.get('id').toString() === displayedValue.toString())
            if (assignee) {
                displayedValue = (
                    <UserLabel user={assignee} />
                )
            }
        } else if (field.get('name') === 'customer') { // display customer
            displayedValue = `Customer #${displayedValue}`
        } else if (field.get('name') === 'language') { // show the display name
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
        }

        return (
            <div>
                <div
                    onClick={this._toggleDropdown}
                >
                    {
                        node.value === '' ? (
                                <div className="btn btn-secondary btn-sm dropdown-toggle clickable">
                                    Select a value
                                </div>
                            ) : (
                                <div className="btn btn-light btn-sm dropdown-toggle clickable">
                                    {displayedValue}
                                </div>
                            )
                    }
                </div>
                {
                    this.state.dropdownOpen && (
                        <FilterDropdown
                            viewConfig={config}
                            field={field}
                            updateFieldFilter={(value) => updateFieldFilter(index, value)}
                            updateFieldFilterOperator={(value) => updateFieldFilterOperator(index, value)}
                            toggleDropdown={this._toggleDropdown}
                        />
                    )
                }
            </div>
        )
    }
}
