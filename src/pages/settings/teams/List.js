//@flow
import React from 'react'
import { Emoji } from 'emoji-mart'
import {Button, Container} from 'reactstrap'
import {Link} from 'react-router'
import classnames from 'classnames'
import {connect} from 'react-redux'

import {fromJS, type Map, type List} from 'immutable'

import PageHeader from '../../common/components/PageHeader'

import * as actions from '../../../state/teams/actions'
import Avatar from '../../common/components/Avatar'
import Loader from '../../common/components/Loader'
import Pagination from '../../common/components/Pagination'

import {type teamType} from '../../../state/teams/types'

import css from './List.less'


type Props = {
    fetchTeams: (T: number) => Promise<*>,
}

type State = {
    isFetching: boolean,
    pagination: Map<*,*>,
    teams: List<teamType>,
}

@connect(null, {
    fetchTeams: actions.fetchTeamsPagination,
})
export default class TeamList extends React.Component<Props, State> {
    state = {
        isFetching: false,
        pagination: fromJS({}),
        teams: fromJS([]),
    }

    componentDidMount() {
        this._fetchPage(1)
    }

    _fetchPage = (page: number = 1) => {
        this.setState({isFetching: true})
        return this.props.fetchTeams(page)
            .then((resp) => {
                this.setState({
                    isFetching: false,
                    pagination: resp.get('meta'),
                    teams: resp.get('data')
                })
            })
    }

    render() {
        if (this.state.isFetching) {
            return <Loader/>
        }

        const {pagination, teams} = this.state
        const maxMembersPreview = 10

        return (
            <div className={'full-width'}>
                <PageHeader title="Teams">
                    <Button
                        tag={Link}
                        color="success"
                        to="/app/settings/teams/create/"
                    >
                        Create Team
                    </Button>
                </PageHeader>

                <Container
                    fluid
                    className="page-container"
                >
                    <p>
                        Create teams of users to define what views they see by default on your account.
                        {teams.size === 0 && <span className="d-block">Your account doesn't have any teams yet.</span>}
                    </p>
                    {
                        teams.map((team) => {
                            const teamId = team.get('id')
                            const emoji = team.getIn(['decoration', 'emoji']) || null
                            const memberCount = team.get('members').size

                            return (
                                <Link
                                    className={classnames(css.card, 'p-3 card d-flex flex-row mb-3')}
                                    key={teamId}
                                    to={`/app/settings/teams/${teamId}/members`}
                                >
                                    <div className={classnames(css.icon, 'd-flex justify-content-center mr-3')}>
                                        {
                                            emoji ? (
                                                <Emoji
                                                    emoji={emoji.toJS()}
                                                    size={32}
                                                    sheetSize={32}
                                                />
                                            ) : (
                                                <i className="material-icons">people</i>
                                            )
                                        }
                                    </div>
                                    <div className="flex-grow mr-1">
                                        <h5 className={css.title}>
                                            {team.get('name')}
                                        </h5>
                                        <p>
                                            {team.get('description')}
                                        </p>
                                        <div className='d-flex flex-row align-items-center'>
                                            {
                                                memberCount > 0 &&
                                                    <ul className='list-unstyled d-flex flex-row mb-0 mr-2'>
                                                        {
                                                            team.get('members').slice(0, maxMembersPreview)
                                                                .map((member) => {
                                                                    const memberProfilePictureUrl = member
                                                                        .getIn(['meta', 'profile_picture_url'])
                                                                    return (
                                                                        <li
                                                                            key={member.get('id')}
                                                                            className='mr-1'
                                                                        >
                                                                            <Avatar
                                                                                name={member.get('name')}
                                                                                url={memberProfilePictureUrl}
                                                                                size={30}
                                                                            />
                                                                        </li>
                                                                    )
                                                                })
                                                        }
                                                    </ul>
                                            }
                                            <p className='mb-0 text-muted'>
                                                {memberCount || 'No'} member{memberCount > 1 && 's'}
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
                        })
                    }

                    <Pagination
                        pageCount={pagination.get('nb_pages') || 1}
                        currentPage={pagination.get('page') || 1}
                        onChange={this._fetchPage}
                        className={classnames(css.pagination, 'pagination-transparent')}
                    />
                </Container>
            </div>
        )
    }
}
