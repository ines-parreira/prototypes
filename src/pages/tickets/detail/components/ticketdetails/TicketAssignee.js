import React, {PropTypes} from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'
import {fromJS} from 'immutable'
import {connect} from 'react-redux'
import {ButtonDropdown, DropdownToggle, DropdownMenu, DropdownItem, Input} from 'reactstrap'

import * as currentUserSelectors from '../../../../../state/currentUser/selectors'
import * as usersSelectors from '../../../../../state/users/selectors'

import {AgentLabel} from '../../../../common/utils/labels'

@connect((state) => {
    return {
        agents: usersSelectors.getAgents(state),
        currentUser: currentUserSelectors.getCurrentUser(state),
    }
})
export default class TicketAssignee extends React.Component {
    static propTypes = {
        agents: PropTypes.object.isRequired,
        currentAssignee: PropTypes.string,
        currentUser: ImmutablePropTypes.map.isRequired,
        direction: PropTypes.string.isRequired,
        setAgent: PropTypes.func.isRequired,
    }

    static defaultProps = {
        direction: 'left',
    }

    constructor(props) {
        super(props)
        this.state = {
            dropdownOpen: false,
            enum: props.agents,
            search: '',
        }
    }

    _clearAgent = () => {
        this.props.setAgent(null)
        this.setState({search: ''})
    }

    _selectAgent = (agent) => {
        this.props.setAgent({id: agent.get('id'), name: agent.get('name')})
        this.setState({search: ''})
    }

    _toggle = () => {
        const opens = !this.state.dropdownOpen

        this.setState({
            dropdownOpen: opens,
        })

        if (opens) {
            const search = ''
            this.setState({search})
            this._filterResults(search)
        }
    }

    _search = (search) => {
        this.setState({search})
        this._filterResults(search)
    }

    _filterResults = (search) => {
        this.setState({
            enum: this.props.agents.filter((agent) => {
                return agent.get('name').toLowerCase().includes(search.toLowerCase())
            }),
        })
    }

    _displayMenu = () => {
        const {currentAssignee, currentUser} = this.props
        let availableAgents = this.state.enum

        if (currentAssignee) {
            availableAgents = availableAgents.filter(agent => agent.get('name') !== currentAssignee)
        }

        let options = fromJS([])

        const isCurrentUserAssigned = !!currentAssignee && currentUser.get('name') === currentAssignee

        if (!isCurrentUserAssigned) {
            options = options.push(
                <DropdownItem
                    key="yourself"
                    type="button"
                    onClick={() => this._selectAgent(currentUser)}
                >
                    Assign yourself
                </DropdownItem>,
                <DropdownItem
                    key="dividerYourself"
                    divider
                />,
            )
        }

        if (availableAgents.isEmpty()) {
            options = options.push(
                <DropdownItem
                    key="noAgents"
                    header
                >
                    Could not find any agent
                </DropdownItem>
            )
        } else {
            options = options.concat(
                availableAgents.map((agent, i) => {
                    return (
                        <DropdownItem
                            key={i}
                            type="button"
                            onClick={() => this._selectAgent(agent)}
                        >
                            {agent.get('name')}
                        </DropdownItem>
                    )
                })
            )
        }


        if (currentAssignee) {
            options = options.push(
                <DropdownItem
                    key="dividerClear"
                    divider
                />
            )

            options = options.push(
                <DropdownItem
                    key="clear"
                    type="button"
                    onClick={this._clearAgent}
                >
                    <span className="text-warning">Clear assignee</span>
                </DropdownItem>
            )
        }

        return options
    }

    render() {
        const {currentAssignee, direction} = this.props

        return (
            <div className="d-inline-block">
                <ButtonDropdown
                    className="d-inline-block"
                    isOpen={this.state.dropdownOpen}
                    toggle={this._toggle}
                >
                    <DropdownToggle
                        color="link"
                        type="button"
                        style={{padding: 0}}
                    >
                        {
                            currentAssignee ? (
                                    <AgentLabel name={currentAssignee} />
                                ) : (
                                    <span className="text-muted">
                                        Unassigned
                                    </span>
                                )
                        }
                    </DropdownToggle>
                    <DropdownMenu
                        right={direction === 'right'}
                        style={{width: '230px'}}
                    >
                        <DropdownItem
                            header
                            className="dropdown-item-input"
                        >
                            <div className="mb-2">Assign to:</div>
                            {
                                this.state.dropdownOpen && ( // rebuild input on each opening so "autoFocus" works
                                    <Input
                                        placeholder="Search agents..."
                                        autoFocus
                                        value={this.state.search}
                                        onChange={e => this._search(e.target.value)}
                                    />
                                )
                            }
                        </DropdownItem>
                        <DropdownItem divider />
                        {this._displayMenu()}
                    </DropdownMenu>
                </ButtonDropdown>
            </div>
        )
    }
}
