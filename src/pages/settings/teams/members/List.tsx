import React, { Component } from 'react'

import classnames from 'classnames'
import { Set } from 'immutable'
import { connect, ConnectedProps } from 'react-redux'
import { NavLink, RouteComponentProps } from 'react-router-dom'
import { Breadcrumb, BreadcrumbItem, Col, Container } from 'reactstrap'

import { CursorDirection, OrderDirection } from 'models/api/types'
import {
    addTeamMember,
    deleteTeamMember,
    deleteTeamMembers,
    fetchTeam,
    fetchTeamMembers,
} from 'models/team/resources'
import {
    FetchTeamMembersOptions,
    Member,
    Team,
    TeamSortableProperties,
} from 'models/team/types'
import Button from 'pages/common/components/button/Button'
import Loader from 'pages/common/components/Loader/Loader'
import Navigation from 'pages/common/components/Navigation/Navigation'
import PageHeader from 'pages/common/components/PageHeader'
import Search from 'pages/common/components/Search'
import SecondaryNavbar from 'pages/common/components/SecondaryNavbar/SecondaryNavbar'
import CheckBox from 'pages/common/forms/CheckBox'
import withRouter from 'pages/common/utils/withRouter'
import settingsCss from 'pages/settings/settings.less'
import css from 'pages/settings/teams/List.less'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'
import {
    deleteTeamSuccess,
    fetchTeamMembersSuccess,
    fetchTeamSuccess,
    updateTeamSuccess,
} from 'state/teams/actions'
import { RootState } from 'state/types'

import AddMember from './AddMember'
import Row from './Row'

type Props = ConnectedProps<typeof connector> &
    RouteComponentProps<{ id: string }>

type State = {
    cursor?: string
    isDeleting: boolean
    isFetching: boolean
    members: Member[]
    meta?: {
        prev_cursor: string | null
        next_cursor: string | null
    }
    search: string
    selection: Set<number>
    team?: Team
}

export class MembersListContainer extends Component<Props, State> {
    state: State = {
        isDeleting: false,
        isFetching: false,
        members: [],
        search: '',
        selection: Set(),
    }

    async componentDidMount() {
        this.setState({ isFetching: true })
        await this.fetchTeam()
        await this.fetchPage()
    }

    fetchTeam = async (): Promise<void> => {
        try {
            const res = await fetchTeam(parseInt(this.props.match.params.id))
            this.setState({ team: res })
            this.props.fetchTeamSuccess(res)
        } catch {
            void this.props.notify({
                message:
                    'Failed to fetch team. Please refresh the page and try again.',
                status: NotificationStatus.Error,
            })
        }
    }

    fetchTeamMembers = async (
        params?: Partial<FetchTeamMembersOptions>,
    ): Promise<void> => {
        const { search } = this.state
        const id = parseInt(this.props.match.params.id)

        const res = await fetchTeamMembers({
            id,
            orderBy: `${TeamSortableProperties.Name}:${OrderDirection.Asc}`,
            search,
            ...params,
        })

        const members = res.data.data
        const memberIds = Set(members.map((member) => member.id))

        this.setState((state) => ({
            cursor: params?.cursor || undefined,
            meta: res.data.meta,
            members,
            // prune selection on refetch
            selection: state.selection.intersect(memberIds),
        }))
        this.props.fetchTeamMembersSuccess({
            id,
            members,
        })
    }

    fetchPage = (direction?: CursorDirection) => {
        const { meta, search } = this.state
        const params: FetchTeamMembersOptions = {
            id: parseInt(this.props.match.params.id),
            cursor: null,
            orderBy: `${TeamSortableProperties.Name}:${OrderDirection.Asc}`,
            search,
        }

        if (direction === CursorDirection.PrevCursor && meta?.prev_cursor) {
            params.cursor = meta?.prev_cursor
        } else if (
            direction === CursorDirection.NextCursor &&
            meta?.next_cursor
        ) {
            params.cursor = meta?.next_cursor
        }

        this.setState({ isFetching: true })
        return this.fetchTeamMembers(params).finally(() => {
            this.setState({ isFetching: false })
        })
    }

    onSearch = (search: string) => {
        this.setState({ search }, () => void this.fetchTeamMembers())
    }

    addTeamMember = async (userId: number) => {
        const teamId = this.state.team?.id

        if (teamId) {
            try {
                await addTeamMember(teamId, userId)
                await this.fetchTeamMembers()
                await this.fetchTeam()

                void this.props.notify({
                    status: NotificationStatus.Success,
                    message: 'Team member added',
                })
            } catch {
                void this.props.notify({
                    status: NotificationStatus.Error,
                    message:
                        'Failed to add team member. Please refresh the page and try again.',
                })
            }
        }
    }

    deleteTeamMember = async (memberId: number) => {
        const { cursor, members, meta, team } = this.state

        if (team?.id) {
            try {
                await deleteTeamMember(team.id, memberId)
                const newCursor =
                    !meta?.next_cursor && meta?.prev_cursor
                        ? members.length === 1
                            ? meta?.prev_cursor
                            : cursor
                        : undefined

                await this.fetchTeamMembers({ cursor: newCursor })
                await this.fetchTeam()

                void this.props.notify({
                    status: NotificationStatus.Success,
                    message: 'Team member removed',
                })
            } catch (error: any) {
                const status = error?.response?.status
                const fallbackErrorMessage =
                    'Failed to remove team member. Please refresh the page and try again.'

                if (status === 422) {
                    void this.props.notify({
                        status: NotificationStatus.Error,
                        message:
                            error?.response?.data?.error?.msg ||
                            fallbackErrorMessage,
                    })
                } else {
                    void this.props.notify({
                        status: NotificationStatus.Error,
                        message: fallbackErrorMessage,
                    })
                }
            }
        }
    }

    deleteTeamMemberSelection = async () => {
        const { cursor, members, meta, team } = this.state

        if (!team?.id) return

        this.setState({ isDeleting: true })
        const selection = this.state.selection
        const fallbackErrorMessage =
            'Failed to remove team members. Please refresh the page and try again.'

        try {
            await deleteTeamMembers(team.id, selection)

            const allMemberIds = Set(members.map((member) => member.id))
            const isAllSelected = !allMemberIds.subtract(selection).size

            const newCursor =
                !meta?.next_cursor && meta?.prev_cursor
                    ? isAllSelected
                        ? meta?.prev_cursor
                        : cursor
                    : undefined

            await this.fetchTeamMembers({ cursor: newCursor })
            await this.fetchTeam()
        } catch (error: any) {
            const status = error?.response?.status

            if (status === 422) {
                void this.props.notify({
                    status: NotificationStatus.Error,
                    message:
                        error?.response?.data?.error?.msg ??
                        fallbackErrorMessage,
                })
            } else {
                void this.props.notify({
                    status: NotificationStatus.Error,
                    message: fallbackErrorMessage,
                })
            }
        } finally {
            this.setState({ isDeleting: false })
        }
    }

    toggleTeamMemberSelection = (memberId: number) => {
        const { selection } = this.state

        this.setState({
            selection: selection.includes(memberId)
                ? selection.delete(memberId)
                : selection.add(memberId),
        })
    }

    render() {
        const { accountOwnerId } = this.props
        const {
            isDeleting,
            isFetching,
            members,
            meta,
            selection,
            search,
            team,
        } = this.state

        const allMemberIds = Set(members.map((member) => member.id))
        const isAllSelected = !allMemberIds.subtract(selection).size

        return (
            <div className={classnames(css.component, 'full-width')}>
                <PageHeader
                    title={
                        <Breadcrumb>
                            <BreadcrumbItem>
                                <NavLink to="/app/settings/teams" exact>
                                    Teams
                                </NavLink>
                            </BreadcrumbItem>
                            <BreadcrumbItem active>
                                Members of {team?.name}
                            </BreadcrumbItem>
                        </Breadcrumb>
                    }
                >
                    <div className="d-flex">
                        <Search
                            value={search}
                            onChange={this.onSearch}
                            placeholder="Search team members..."
                            searchDebounceTime={300}
                            className="mr-2"
                        />
                        {!!team && (
                            <AddMember
                                team={team}
                                addTeamMember={this.addTeamMember}
                            />
                        )}
                    </div>
                </PageHeader>

                <SecondaryNavbar>
                    <NavLink
                        to={`/app/settings/teams/${team?.id || ''}/members`}
                        exact
                    >
                        Team members
                    </NavLink>
                    <NavLink to={`/app/settings/teams/${team?.id || ''}`} exact>
                        Settings
                    </NavLink>
                </SecondaryNavbar>
                {isFetching ? (
                    <Loader />
                ) : members.length > 0 ? (
                    <div className={css.listContainer}>
                        <div className={css.listHeader}>
                            <Col sm={4} className={settingsCss.py24}>
                                <div className="d-flex align-items-center mb-2 mt-3">
                                    <CheckBox
                                        className="mr-4"
                                        onChange={() => {
                                            this.setState({
                                                selection: isAllSelected
                                                    ? Set()
                                                    : allMemberIds,
                                            })
                                        }}
                                        isChecked={isAllSelected}
                                    />
                                    <Button
                                        intent="secondary"
                                        onClick={this.deleteTeamMemberSelection}
                                        isLoading={isDeleting}
                                        isDisabled={!this.state.selection.size}
                                        leadingIcon="delete"
                                    >
                                        Delete
                                    </Button>
                                </div>
                            </Col>
                        </div>

                        <Container
                            fluid
                            className={classnames(
                                settingsCss.pageContainer,
                                settingsCss.pt0,
                            )}
                        >
                            <div className={css.list}>
                                {members.map((member) => {
                                    const memberId = member.id
                                    return (
                                        <Row
                                            key={memberId}
                                            member={member}
                                            isAccountOwner={
                                                memberId === accountOwnerId
                                            }
                                            deleteTeamMember={() =>
                                                this.deleteTeamMember(memberId)
                                            }
                                            select={
                                                this.toggleTeamMemberSelection
                                            }
                                            isSelected={this.state.selection.includes(
                                                memberId,
                                            )}
                                        />
                                    )
                                })}
                            </div>
                            <Navigation
                                className={css.navigation}
                                hasNextItems={!!meta?.next_cursor}
                                hasPrevItems={!!meta?.prev_cursor}
                                fetchNextItems={() =>
                                    this.fetchPage(CursorDirection.NextCursor)
                                }
                                fetchPrevItems={() =>
                                    this.fetchPage(CursorDirection.PrevCursor)
                                }
                            />
                        </Container>
                    </div>
                ) : (
                    <Container
                        fluid
                        className={classnames(
                            settingsCss.pageContainer,
                            css.listContainer,
                        )}
                    >
                        {!search.length ? (
                            <p className="text-center">
                                Start adding users to this team
                            </p>
                        ) : (
                            <p className="text-center">
                                {`No user matching "${search}" in this team.`}
                            </p>
                        )}
                    </Container>
                )}
            </div>
        )
    }
}

const connector = connect(
    (state: RootState) => ({
        accountOwnerId: state.currentAccount.get('user_id'),
    }),
    {
        fetchTeamMembersSuccess,
        deleteTeamSuccess,
        fetchTeamSuccess,
        notify,
        updateTeamSuccess,
    },
)

export default withRouter(connector(MembersListContainer))
