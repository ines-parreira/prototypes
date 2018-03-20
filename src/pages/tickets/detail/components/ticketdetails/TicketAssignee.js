import React, {PropTypes} from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'
import classnames from 'classnames'
import {fromJS} from 'immutable'
import {connect} from 'react-redux'
import {Dropdown, DropdownToggle, DropdownMenu, DropdownItem, Input} from 'reactstrap'
import _isUndefined from 'lodash/isUndefined'

import * as currentUserSelectors from '../../../../../state/currentUser/selectors'
import * as usersSelectors from '../../../../../state/users/selectors'

import shortcutManager from '../../../../../services/shortcutManager'
import {AgentLabel} from '../../../../common/utils/labels'

import headerCss from '../TicketHeader.less'

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
        email: PropTypes.string,
        profilePictureUrl: PropTypes.string,
        className: PropTypes.string,
        transparent: PropTypes.bool,
    }

    static defaultProps = {
        direction: 'left',
        email: '',
        transparent: false,
    }

    constructor(props) {
        super(props)
        this.state = {
            dropdownOpen: false,
            enum: props.agents,
            search: '',
        }
    }

    componentDidMount() {
        this._bindKeys()
    }

    componentWillUnmount() {
        shortcutManager.unbind('TicketDetailContainer')
    }

    _bindKeys = () => {
        shortcutManager.bind('TicketDetailContainer', {
            OPEN_ASSIGNEE: {
                action: (e) => {
                    // shortcut key gets typed in the search field otherwisee
                    e.preventDefault()
                    this._toggle()
                }
            },
            CLOSE_ASSIGNEE: {
                key: 'esc',
                action: () => this._toggle(null, false)
            }
        })
    }

    _clearAgent = () => {
        this.props.setAgent(null)
        this.setState({search: ''})
    }

    _selectAgent = (agent) => {
        this.props.setAgent({
            id: agent.get('id'),
            name: agent.get('name'),
            email: agent.get('email'),
        })
        this.setState({search: ''})
    }

    _toggle = (e, visible) => {
        const opens = !_isUndefined(visible) ? visible : !this.state.dropdownOpen

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
                            <AgentLabel
                                name={agent.get('name')}
                                email={agent.get('email')}
                                profilePictureUrl={agent.getIn(['meta', 'profile_picture_url'])}
                            />
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
                    <i className="icon material-icons">
                        clear
                    </i>
                    Clear assignee
                </DropdownItem>
            )
        }

        return options
    }

    render() {
        const {currentAssignee, direction, email, profilePictureUrl, className, transparent} = this.props

        return (
            <Dropdown
                className={className}
                isOpen={this.state.dropdownOpen}
                toggle={this._toggle}
            >
                <DropdownToggle
                    color="secondary"
                    type="button"
                    className={classnames(headerCss.headerButton, {
                        'btn-transparent': transparent
                    })}
                    caret
                >
                    {
                        currentAssignee ? (
                                <AgentLabel
                                    name={currentAssignee}
                                    email={email}
                                    profilePictureUrl={profilePictureUrl}
                                    maxWidth="100"
                                />
                            ) : (
                                <span>
                                    Unassigned
                                </span>
                            )
                    }
                </DropdownToggle>
                <DropdownMenu
                    right={direction === 'right'}
                    style={{width: '190px'}}
                >
                    <DropdownItem header>
                        ASSIGN TO:
                    </DropdownItem>

                    <DropdownItem
                        header
                        className="dropdown-item-input"
                    >
                        {
                            // rebuild input on each opening so "autoFocus" works
                            this.state.dropdownOpen && (
                                <div className="input-icon input-icon-right">
                                    <i className="icon material-icons md-2">
                                        search
                                    </i>

                                    <Input
                                        placeholder="Search agents..."
                                        autoFocus
                                        value={this.state.search}
                                        onChange={e => this._search(e.target.value)}
                                    />
                                </div>
                            )
                        }
                    </DropdownItem>
                    <DropdownItem divider />
                    {this._displayMenu()}
                </DropdownMenu>
            </Dropdown>
        )
    }
}
