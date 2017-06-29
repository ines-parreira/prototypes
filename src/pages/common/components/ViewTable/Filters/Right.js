import React, {PropTypes} from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'
import {fromJS} from 'immutable'
import {connect} from 'react-redux'
import {Badge} from 'reactstrap'

import {UserLabel, IntegrationsDetailLabel} from '../../../utils/labels'
import {fieldPath} from '../../../../../utils'

import * as viewsActions from '../../../../../state/views/actions'

import {getMessagingIntegrations} from '../../../../../state/integrations/selectors'
import * as viewsSelectors from '../../../../../state/views/selectors'

import FilterDropdown from '../FilterDropdown'

@connect((state) => {
    return {
        integrations: getMessagingIntegrations(state),
        config: viewsSelectors.getActiveViewConfig(state),
        areFiltersValid: viewsSelectors.areFiltersValid(state),
    }
}, {
    fetchPage: viewsActions.fetchPage,
})
export default class Right extends React.Component {
    static propTypes = {
        areFiltersValid: PropTypes.bool.isRequired,
        config: ImmutablePropTypes.map.isRequired,
        view: PropTypes.object.isRequired,
        node: PropTypes.object.isRequired,
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

    _toggleDropdown = () => {
        this.setState({dropdownOpen: !this.state.dropdownOpen})
    }

    render() {
        const {node, config, objectPath, updateFieldFilter, updateFieldFilterOperator, index, empty} = this.props

        if (empty) {
            return <span />
        }

        const fields = config.get('fields', fromJS([]))
        const field = fields.find(field => objectPath === `${config.get('singular')}.${fieldPath(field)}`)

        if (!field) {
            return (
                <div>
                    <div className="btn btn-outline-danger btn-frozen mr-2">
                        {node.value}
                    </div>
                    <Badge color="danger">
                        System condition
                    </Badge>
                </div>
            )
        }

        let displayedValue = node.value


        if (displayedValue === '{current_user.id}') { // display current user variable
            displayedValue = 'Me (current user)'
        } else if (field.get('name') === 'integrations') { // display integration
            const integration = this.props.integrations.find(integration => integration.get('id') === displayedValue)
            if (integration) {
                displayedValue = (
                    <IntegrationsDetailLabel integration={integration} />
                )
            }
        } else if (field.get('name') === 'assignee') { // display assignee
            const assignee = this.props.agents.find(agent => agent.get('id') === displayedValue)
            if (assignee) {
                displayedValue = (
                    <UserLabel name={assignee.get('name')} />
                )
            }
        } else if (field.get('name') === 'requester') { // display requester
            displayedValue = `User #${displayedValue}`
        }

        return (
            <div>
                <div
                    onClick={this._toggleDropdown}
                >
                    {
                        node.value === '' ? (
                                <div className="btn btn-secondary dropdown-toggle clickable">
                                    Select a value
                                </div>
                            ) : (
                                <div className="btn btn-outline-info dropdown-toggle clickable">
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
