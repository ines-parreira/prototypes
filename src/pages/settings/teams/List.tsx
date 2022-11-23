import React, {useState} from 'react'
import {Emoji} from 'emoji-mart'
import {Container} from 'reactstrap'
import {Link} from 'react-router-dom'
import classnames from 'classnames'
import {useAsyncFn, useEffectOnce} from 'react-use'

import useAppDispatch from 'hooks/useAppDispatch'
import {ApiListResponsePagination, PaginationMeta} from 'models/api/types'
import Avatar from 'pages/common/components/Avatar/Avatar'
import Button from 'pages/common/components/button/Button'
import Loader from 'pages/common/components/Loader/Loader'
import PageHeader from 'pages/common/components/PageHeader'
import Pagination from 'pages/common/components/Pagination'
import TeamCreationModal from 'pages/settings/teams/TeamCreationModal'
import {fetchTeamsPagination} from 'state/teams/actions'
import {Team} from 'state/teams/types'

import {logEvent, SegmentEvent} from 'store/middlewares/segmentTracker'
import settingsCss from '../settings.less'

import css from './List.less'

const maxMembersPreview = 10

type TeamItemProps = {
    team: Team
}

const TeamItem = ({team}: TeamItemProps) => {
    const teamId = team.id
    const emoji = team.decoration.emoji
    const memberCount = team.members.length

    return (
        <Link
            className={classnames(css.card, 'p-3 card d-flex flex-row mb-3')}
            to={`/app/settings/teams/${teamId}/members`}
        >
            <div className="d-flex justify-content-center mr-3">
                {emoji ? (
                    <Emoji emoji={emoji} size={32} sheetSize={32} />
                ) : (
                    <i className="material-icons">people</i>
                )}
            </div>
            <div className="flex-grow mr-1">
                <h5 className={css.title}>{team.name}</h5>
                <p>{team.description}</p>
                <div className="d-flex flex-row align-items-center">
                    {memberCount > 0 && (
                        <ul className="list-unstyled d-flex flex-row mb-0 mr-2">
                            {team.members
                                .slice(0, maxMembersPreview)
                                .map((member) => {
                                    const memberProfilePictureUrl =
                                        member.meta?.profile_picture_url

                                    return (
                                        <li key={member.id} className="mr-1">
                                            <Avatar
                                                name={member.name}
                                                url={memberProfilePictureUrl}
                                                size={30}
                                            />
                                        </li>
                                    )
                                })}
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
                    <i className="material-icons md-1">navigate_next</i>
                </div>
            </div>
        </Link>
    )
}

const TeamList = () => {
    const dispatch = useAppDispatch()
    const [pagination, setPagination] = useState<PaginationMeta | null>(null)
    const [teams, setTeams] = useState<Team[]>([])
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [newTeams, setNewTeams] = useState<Team[]>([])

    useEffectOnce(() => {
        void fetchPage(1)
    })

    const [{loading: isFetching}, fetchPage] = useAsyncFn(async (page = 1) => {
        const resp = (await dispatch(
            fetchTeamsPagination(page)
        )) as ApiListResponsePagination<Team[]>

        setNewTeams([])
        if (resp?.meta) {
            setPagination(resp.meta)
            setTeams(resp.data)
        }
    })

    const handleClick = () => {
        setIsModalOpen(true)
        logEvent(SegmentEvent.TeamWizardEntry)
    }

    if (isFetching) {
        return <Loader />
    }

    return (
        <div className={classnames(css.component, 'full-width')}>
            <PageHeader title="Teams">
                <Button onClick={handleClick}>Create Team</Button>
            </PageHeader>

            <Container fluid className={settingsCss.pageContainer}>
                <p>
                    Create teams of users to define what views they see by
                    default on your account.
                    {teams.length === 0 && (
                        <span className="d-block">
                            Your account doesn't have any teams yet.
                        </span>
                    )}
                </p>
                {newTeams.map((team) => (
                    <TeamItem key={team.id} team={team} />
                ))}

                {teams.map((team) => (
                    <TeamItem key={team.id} team={team} />
                ))}

                <Pagination
                    pageCount={pagination?.nb_pages || 1}
                    currentPage={pagination?.page || 1}
                    onChange={fetchPage}
                    className={classnames(
                        css.pagination,
                        'pagination-transparent'
                    )}
                />
            </Container>

            <TeamCreationModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onTeamCreated={(team) => setNewTeams([team, ...newTeams])}
            />
        </div>
    )
}

export default TeamList
