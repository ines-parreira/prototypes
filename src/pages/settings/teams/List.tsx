import React, {Component} from 'react'
import {Emoji} from 'emoji-mart'
import {Container} from 'reactstrap'
import {Link} from 'react-router-dom'
import classnames from 'classnames'
import {connect, ConnectedProps} from 'react-redux'
import {fromJS, Map, List} from 'immutable'

import Button from 'pages/common/components/button/Button'
import PageHeader from '../../common/components/PageHeader'
import {fetchTeamsPagination} from '../../../state/teams/actions'
import Avatar from '../../common/components/Avatar/Avatar'
import Loader from '../../common/components/Loader/Loader'
import Pagination from '../../common/components/Pagination'
import settingsCss from '../settings.less'

import css from './List.less'

type Props = ConnectedProps<typeof connector>

type State = {
    isFetching: boolean
    pagination: Map<any, any>
    teams: List<any>
}

export class TeamListContainer extends Component<Props, State> {
    state: State = {
        isFetching: false,
        pagination: fromJS({}),
        teams: fromJS([]),
    }

    componentDidMount() {
        void this._fetchPage(1)
    }

    _fetchPage = (page = 1) => {
        this.setState({isFetching: true})
        return this.props.fetchTeams(page).then((resp) => {
            this.setState({
                isFetching: false,
                pagination: (resp as Map<any, any>).get('meta'),
                teams: (resp as Map<any, any>).get('data'),
            })
        })
    }

    render() {
        if (this.state.isFetching) {
            return <Loader />
        }

        const {pagination, teams} = this.state
        const maxMembersPreview = 10

        return (
            <div className={classnames(css.component, 'full-width')}>
                <PageHeader title="Teams">
                    <Link to="/app/settings/teams/create/">
                        <Button>Create Team</Button>
                    </Link>
                </PageHeader>

                <Container fluid className={settingsCss.pageContainer}>
                    <p>
                        Create teams of users to define what views they see by
                        default on your account.
                        {teams.size === 0 && (
                            <span className="d-block">
                                Your account doesn't have any teams yet.
                            </span>
                        )}
                    </p>
                    {teams.map((team: Map<any, any>) => {
                        const teamId = team.get('id') as number
                        const emoji =
                            (team.getIn(['decoration', 'emoji']) as Map<
                                any,
                                any
                            >) || null
                        const memberCount = (team.get('members') as List<any>)
                            .size

                        return (
                            <Link
                                className={classnames(
                                    css.card,
                                    'p-3 card d-flex flex-row mb-3'
                                )}
                                key={teamId}
                                to={`/app/settings/teams/${teamId}/members`}
                            >
                                <div className="d-flex justify-content-center mr-3">
                                    {emoji ? (
                                        <Emoji
                                            emoji={emoji.toJS()}
                                            size={32}
                                            sheetSize={32}
                                        />
                                    ) : (
                                        <i className="material-icons">people</i>
                                    )}
                                </div>
                                <div className="flex-grow mr-1">
                                    <h5 className={css.title}>
                                        {team.get('name')}
                                    </h5>
                                    <p>{team.get('description')}</p>
                                    <div className="d-flex flex-row align-items-center">
                                        {memberCount > 0 && (
                                            <ul className="list-unstyled d-flex flex-row mb-0 mr-2">
                                                {(
                                                    team.get(
                                                        'members'
                                                    ) as List<any>
                                                )
                                                    .slice(0, maxMembersPreview)
                                                    .map(
                                                        (
                                                            member: Map<
                                                                any,
                                                                any
                                                            >
                                                        ) => {
                                                            const memberProfilePictureUrl =
                                                                member.getIn([
                                                                    'meta',
                                                                    'profile_picture_url',
                                                                ])
                                                            return (
                                                                <li
                                                                    key={member.get(
                                                                        'id'
                                                                    )}
                                                                    className="mr-1"
                                                                >
                                                                    <Avatar
                                                                        name={member.get(
                                                                            'name'
                                                                        )}
                                                                        url={
                                                                            memberProfilePictureUrl
                                                                        }
                                                                        size={
                                                                            30
                                                                        }
                                                                    />
                                                                </li>
                                                            )
                                                        }
                                                    )}
                                            </ul>
                                        )}
                                        <p className="mb-0 text-muted">
                                            {memberCount || 'No'} member
                                            {memberCount > 1 && 's'}
                                        </p>
                                    </div>
                                </div>
                                <div className="align-self-center">
                                    <div className={css.action}>
                                        <i className="material-icons md-1">
                                            navigate_next
                                        </i>
                                    </div>
                                </div>
                            </Link>
                        )
                    })}

                    <Pagination
                        pageCount={pagination.get('nb_pages') || 1}
                        currentPage={pagination.get('page') || 1}
                        onChange={this._fetchPage}
                        className={classnames(
                            css.pagination,
                            'pagination-transparent'
                        )}
                    />
                </Container>
            </div>
        )
    }
}

const connector = connect(null, {
    fetchTeams: fetchTeamsPagination,
})

export default connector(TeamListContainer)
