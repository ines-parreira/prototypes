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

    componentDidMount() {
        // Automatically set the first option
        // if the field has only one option
        if (this.props.node.value === '') {
            this._selectFirstOption()
        }
    }

    componentDidUpdate() {
        // Automatically set the first option
        // if the field has only one option
        if (this.props.node.value === '') {
            this._selectFirstOption()
        }
    }

    _selectFirstOption = () => {
        const {updateFieldFilter, index} = this.props
        const field = this._getFieldConfig()
        const options = field.getIn(['filter', 'enum'])

        if (options && options.size === 1) {
            updateFieldFilter(index, options.first())
        }
    }

    _toggleDropdown = () => {
        this.setState({dropdownOpen: !this.state.dropdownOpen})
    }

    _getFieldConfig = () => {
        const {config, objectPath} = this.props
        const fields = config.get('fields', fromJS([]))
        return fields.find(field => objectPath === `${config.get('singular')}.${fieldPath(field)}`)
    }

    render() {
        const {node, config, updateFieldFilter, updateFieldFilterOperator, index, empty} = this.props

        if (empty) {
            return <span />
        }

        const field = this._getFieldConfig()

        if (!field) {
            return (
                <div>
                    <div className="btn btn-outline-danger btn-frozen mr-2">
                        {node.value ? node.value.toString() : node.value}
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
