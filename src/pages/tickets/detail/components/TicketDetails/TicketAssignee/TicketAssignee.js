// @flow
import React from 'react'
import classnames from 'classnames'
import {fromJS} from 'immutable'
import {connect} from 'react-redux'
import {Dropdown, DropdownToggle, DropdownMenu, DropdownItem, Input} from 'reactstrap'
import _isUndefined from 'lodash/isUndefined'

import * as currentUserSelectors from '../../../../../../state/currentUser/selectors'
import * as agentSelectors from '../../../../../../state/agents/selectors'

import shortcutManager from '../../../../../../services/shortcutManager/index'
import {AgentLabel} from '../../../../../common/utils/labels'

import {setAgent} from '../../../../../../state/ticket/actions'

import css from './TicketAssignee.less'

type Props = {
    agents: Object,
    currentAssignee: ?Map<*, *>,
    currentUser: Map<*,*>,
    direction: string,
    setAgent: typeof setAgent,
    profilePictureUrl?: string,
    className?: string,
    transparent?: boolean,
}

type State = {
    dropdownOpen: boolean,
    enum: Object,
    search: string
}

// TODO(agent-null-names): remove fallbacks in this component when https://github.com/gorgias/gorgias/issues/4413 is fixed
@connect((state) => {
    return {
        agents: agentSelectors.getAgents(state),
        currentUser: currentUserSelectors.getCurrentUser(state),
    }
})
export default class TicketAssignee extends React.Component<Props, State> {
    static defaultProps = {
        direction: 'left',
        transparent: false,
    }

    constructor(props: Props) {
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

    _selectAgent = (agent: Object) => {
        this.props.setAgent({
            id: agent.get('id'),
            name: agent.get('name'),
            email: agent.get('email'),
            meta: agent.get('meta')
        })
        this.setState({search: ''})
    }

    _toggle = (e?: any, visible?: boolean) => {
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

    _search = (search: string) => {
        this.setState({search})
        this._filterResults(search)
    }

    _filterResults = (search: string) => {
        this.setState({
            enum: this.props.agents.filter((agent) => {
                const agentLabel = agent.get('name') || agent.get('email')
                return agentLabel.toLowerCase().includes(search.toLowerCase())
            }),
        })
    }

    _displayMenu = () => {
        const {currentAssignee, currentUser} = this.props
        let availableAgents = this.state.enum
        const isCurrentUserAssigned = currentAssignee && currentUser && currentUser.get('id') === currentAssignee.get('id')
        let options = fromJS([])

        if (currentAssignee) {
            availableAgents = availableAgents.filter((agent) => agent.get('id') !== currentAssignee.get('id'))
        }


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
                <div
                    key="availableAgents"
                    className={css.agents}
                >
                    {availableAgents.map((agent) => {
                        return (
                            <DropdownItem
                                key={agent.get('id')}
                                type="button"
                                onClick={() => this._selectAgent(agent)}
                            >
                                <AgentLabel
                                    name={agent.get('name') || agent.get('email')}
                                    profilePictureUrl={agent.getIn(['meta', 'profile_picture_url'])}
                                    avatar
                                />
                            </DropdownItem>
                        )
                    })}
                </div>
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
        const {currentAssignee, direction, profilePictureUrl, className, transparent} = this.props

        return (
            <Dropdown
                className={className}
                isOpen={this.state.dropdownOpen}
                toggle={this._toggle}
            >
                <DropdownToggle
                    color="secondary"
                    type="button"
                    className={classnames(css.toggle, {
                        'btn-transparent': transparent,
                    })}
                    caret
                >
                    {
                        currentAssignee ? (
                            <AgentLabel
                                name={currentAssignee.get('name') || currentAssignee.get('email')}
                                profilePictureUrl={profilePictureUrl}
                                className={css.label}
                                maxWidth="100"
                                avatar
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
                                        onChange={(e) => this._search(e.target.value)}
                                    />
                                </div>
                            )
                        }
                    </DropdownItem>
                    <DropdownItem divider/>
                    {this._displayMenu()}
                </DropdownMenu>
            </Dropdown>
        )
    }
}
