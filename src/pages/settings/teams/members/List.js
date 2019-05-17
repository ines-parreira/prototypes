//@flow
import React, {Component} from 'react'
import {connect} from 'react-redux'
import {
    Breadcrumb,
    BreadcrumbItem,
    Container,
    Row,
    Col,
    Button
} from 'reactstrap'
import {Link} from 'react-router'
import {fromJS, Set, type Map, type List} from 'immutable'
import classnames from 'classnames'

import PageHeader from '../../../common/components/PageHeader'
import SecondaryNavbar from '../../../common/components/SecondaryNavbar/SecondaryNavbar'
import * as actions from '../../../../state/teams/actions'
import Pagination from '../../../common/components/Pagination'
import Loader from '../../../common/components/Loader'
import Search from '../../../common/components/Search'

import {type teamType} from '../../../../state/teams/types'

import css from '../List.less'

import AddMember from './AddMember'

import UserRow from './Row'

type Props = {
    accountOwnerId: number,
    addTeamMember: (teamId: number, userId: number) => Promise<*>,
    deleteTeamMember: (teamId: number, userId: number) => Promise<*>,
    deleteTeamMemberList: (teamId: number, userIds: Set<number>) => Promise<*>,
    fetchTeam: (teamId: number) => Promise<*>,
    fetchTeamMembers: (teamId: number, page: ?number, search: ?string) => Promise<*>,
    params: {
        id: string
    }
}

type State = {
    team: teamType,
    members: List<Map<*, *>>,
    pagination: Map<*, *>,
    selection: Set<number>,
    isFetching: boolean,
    isDeleting: boolean,
    search: string
}

@connect((state) => {
    return {
        accountOwnerId: state.currentAccount.get('user_id'),
    }
}, {
    addTeamMember: actions.addTeamMember,
    deleteTeamMember: actions.deleteTeamMember,
    deleteTeamMemberList: actions.deleteTeamMemberList,
    fetchTeam: actions.fetchTeam,
    fetchTeamMembers: actions.fetchTeamMembersPagination,
})
export default class MembersList extends Component<Props, State> {
    state = {
        team: fromJS({}),
        members: fromJS([]),
        pagination: fromJS({}),
        selection: Set(),
        isFetching: false,
        isDeleting: false,
        search: ''
    }

    componentDidMount() {
        this.setState({isFetching: true})
        this._fetchTeam().then(() => this._fetchPage(1))
    }

    _fetchTeam = () => {
        return this.props.fetchTeam(parseInt(this.props.params.id)).then((team) => {
            this.setState({team})
        })
    }

    _fetchTeamMembers = (page: number = 1) => {
        const {team, search} = this.state
        return this.props.fetchTeamMembers(team.get('id'), page, search)
            .then((resp) => {
                const members = resp.get('data')
                const memberIds = Set(members.map((member) => {
                    return member.get('id')
                }))
                this.setState((state) => ({
                    pagination: resp.get('meta'),
                    members,
                    // prune selection on refetch
                    selection: state.selection.intersect(memberIds)
                }))
            })
    }

    _fetchPage = (page: number = 1) => {
        this.setState({isFetching: true})
        return this._fetchTeamMembers(page)
            // $FlowFixMe
            .finally(() => {
                this.setState({isFetching: false})
            })
    }

    _onSearch = (search: string) => {
        this.setState({search})
        return this._fetchTeamMembers(1)
    }

    _addTeamMember = (userId: number) => {
        const currentPage = this.state.pagination.get('page') || 1
        const teamId = this.state.team.get('id')
        return this.props.addTeamMember(teamId, userId)
            .then(() => {
                this._fetchTeam()
                return this._fetchTeamMembers(currentPage)
            })
    }

    _deleteTeamMember = (memberId: number) => {
        const currentPage = this.state.pagination.get('page') || 1
        const teamId = this.state.team.get('id')
        return this.props.deleteTeamMember(teamId, memberId)
            .then(() => {
                this._fetchTeam()
                // if last agent on page was deleted,
                // reload the previous page.
                const page = (this.state.members.size === 1 && currentPage > 1) ? currentPage - 1 : currentPage
                return this._fetchTeamMembers(page)
            })
    }

    _deleteTeamMemberSelection = () => {
        this.setState({isDeleting: true})
        const selection = this.state.selection
        const currentPage = this.state.pagination.get('page') || 1
        const teamId = this.state.team.get('id')
        return this.props.deleteTeamMemberList(teamId, selection)
            .then(() => {
                this._fetchTeam()
                // if last agents on page were deleted,
                // reload the previous page.
                const page = ((selection.size >= this.state.members.size) && (currentPage > 1))
                    ? currentPage - 1
                    : currentPage
                return this._fetchTeamMembers(page)
            })
            // $FlowFixMe
            .finally(() => {
                this.setState({isDeleting: false})
            })
    }

    _toggleTeamMemberSelection = (memberId: number) => {
        this.setState({
            selection: this.state.selection.includes(memberId)
                ? this.state.selection.delete(memberId)
                : this.state.selection.add(memberId)
        })
    }

    render() {
        if (this.state.isFetching) {
            return <Loader/>
        }

        const {accountOwnerId} = this.props
        const {pagination, members, team, isDeleting} = this.state
        const pageCount = pagination.get('nb_pages') || 1
        const currentPage = pagination.get('page') || 1

        const teamId = team.get('id')
        const allMemberIds = Set(members.map((member) => {
            return member.get('id')
        }))
        const isAllSelected = !allMemberIds.subtract(this.state.selection).size


        return (
            <div className={classnames(css.component, 'full-width')}>
                <PageHeader title={(
                    <Breadcrumb>
                        <BreadcrumbItem>
                            <Link to="/app/settings/teams">Teams</Link>
                        </BreadcrumbItem>
                        <BreadcrumbItem active>
                            Members of {team.get('name')}
                        </BreadcrumbItem>
                    </Breadcrumb>

                )}>
                    <div className="d-flex">
                        <Search
                            bindKey
                            forcedQuery={this.state.search}
                            onChange={this._onSearch}
                            placeholder="Search team members..."
                            searchDebounceTime={300}
                            className="mr-2"
                        />
                        <AddMember
                            team={team}
                            addTeamMember={this._addTeamMember}
                        />

                    </div>
                </PageHeader>

                <SecondaryNavbar>
                    <Link to={`/app/settings/teams/${teamId}/members`}>Team members</Link>
                    <Link to={`/app/settings/teams/${teamId}`}>Settings</Link>
                </SecondaryNavbar>
                {
                    members.size > 0 ? (
                        <Container
                            fluid
                            className="page-container"
                        >
                            <Row>
                                <Col sm={4}>
                                    <div className="d-flex align-items-center mb-2">
                                        <input
                                            type="checkbox"
                                            className="mr-4"
                                            onChange={() => {
                                                this.setState({
                                                    selection: (isAllSelected ? Set() : allMemberIds)
                                                })
                                            }}
                                            checked={isAllSelected}
                                        />
                                        <Button
                                            color="secondary"
                                            size="sm"
                                            onClick={this._deleteTeamMemberSelection}
                                            className={classnames({'btn-loading': isDeleting})}
                                            disabled={!this.state.selection.size || isDeleting}
                                        >
                                            <i className="material-icons md-2">
                                                delete
                                            </i>
                                        </Button>
                                    </div>
                                </Col>
                            </Row>

                            <div className={css.list}>
                                {
                                    members.map((member) => {
                                        const memberId = member.get('id')
                                        return (
                                            <UserRow
                                                key={memberId}
                                                member={member}
                                                isAccountOwner={memberId === accountOwnerId}
                                                deleteTeamMember={() => this._deleteTeamMember(memberId)}
                                                select={this._toggleTeamMemberSelection}
                                                isSelected={this.state.selection.includes(memberId)}
                                            />
                                        )
                                    })
                                }
                            </div>
                            <Pagination
                                pageCount={pageCount}
                                currentPage={currentPage}
                                onChange={this._fetchPage}
                                className={classnames(css.pagination, 'pagination-transparent')}
                            />
                        </Container>
                    ) : (
                        <Container
                            fluid
                            className="page-container"
                            style={{minHeight: '500px'}}
                        >
                            {
                                !this.state.search.length
                                    ? (
                                        <p className="text-center">Start adding users to this team</p>
                                    ) : (
                                        <p className="text-center">No user matching "{this.state.search}" in this team.</p>
                                    )
                            }
                        </Container>
                    )
                }
            </div>
        )
    }
}
