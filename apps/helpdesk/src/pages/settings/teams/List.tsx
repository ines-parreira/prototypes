import { useState } from 'react'

import { useAsyncFn, useEffectOnce } from '@repo/hooks'
import { AxiosError } from 'axios'
import classnames from 'classnames'
import { Emoji } from 'emoji-mart'
import { Link } from 'react-router-dom'

import { Button } from '@gorgias/axiom'
import { CursorPaginationMeta } from '@gorgias/helpdesk-queries'

import { logEvent, SegmentEvent } from 'common/segment'
import useAppDispatch from 'hooks/useAppDispatch'
import { CursorDirection, OrderDirection } from 'models/api/types'
import { fetchTeams } from 'models/team/resources'
import {
    FetchTeamsOptions,
    Team,
    TeamSortableProperties,
} from 'models/team/types'
import Avatar from 'pages/common/components/Avatar/Avatar'
import Loader from 'pages/common/components/Loader/Loader'
import Navigation from 'pages/common/components/Navigation/Navigation'
import PageHeader from 'pages/common/components/PageHeader'
import settingsCss from 'pages/settings/settings.less'
import TeamCreationModal from 'pages/settings/teams/TeamCreationModal'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'
import { FETCH_TEAMS_SUCCESS } from 'state/teams/constants'

import css from './List.less'

const maxMembersPreview = 10

type Props = {
    team: Team
}

const TeamItem = ({ team }: Props) => {
    const teamId = team.id
    const emoji = team.decoration?.emoji
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
    const [meta, setMeta] = useState<CursorPaginationMeta | null>(null)
    const [teams, setTeams] = useState<Team[]>([])
    const [isModalOpen, setIsModalOpen] = useState(false)

    useEffectOnce(() => {
        void fetchPage()
    })

    const [{ loading: isFetching }, fetchPage] = useAsyncFn(
        async (direction?: CursorDirection) => {
            const params: FetchTeamsOptions = {
                orderBy: `${TeamSortableProperties.Name}:${OrderDirection.Asc}`,
            }

            if (direction === CursorDirection.PrevCursor && meta?.prev_cursor) {
                params.cursor = meta?.prev_cursor
            } else if (
                direction === CursorDirection.NextCursor &&
                meta?.next_cursor
            ) {
                params.cursor = meta?.next_cursor
            }

            try {
                const res = await fetchTeams(params)
                setMeta(res.data.meta)
                setTeams(res.data.data)
                dispatch({
                    type: FETCH_TEAMS_SUCCESS,
                    payload: res.data.data,
                })
            } catch (error) {
                const responseError = error as AxiosError<{
                    error?: { msg: string }
                }>
                await dispatch(
                    notify({
                        message:
                            responseError.response?.data.error?.msg ||
                            'Failed to fetch teams.',
                        status: NotificationStatus.Error,
                    }),
                )
            }
        },
        [meta],
    )

    const handleClick = () => {
        setIsModalOpen(true)
        logEvent(SegmentEvent.TeamWizardEntry)
    }

    return (
        <div className={classnames(css.component, 'full-width')}>
            <PageHeader title="Teams">
                <Button onClick={handleClick}>Create Team</Button>
            </PageHeader>

            {isFetching ? (
                <Loader />
            ) : (
                <div className={settingsCss.pageContainer}>
                    <p>
                        Create teams of users to define what views they see by
                        default on your account.
                        {teams.length === 0 && (
                            <span className="d-block">
                                {`Your account doesn't have any teams yet.`}
                            </span>
                        )}
                    </p>
                    {teams.map((team) => (
                        <TeamItem key={team.id} team={team} />
                    ))}

                    <Navigation
                        className={css.navigation}
                        hasNextItems={!!meta?.next_cursor}
                        hasPrevItems={!!meta?.prev_cursor}
                        fetchNextItems={() =>
                            fetchPage(CursorDirection.NextCursor)
                        }
                        fetchPrevItems={() =>
                            fetchPage(CursorDirection.PrevCursor)
                        }
                    />
                </div>
            )}

            <TeamCreationModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onTeamCreated={fetchPage}
            />
        </div>
    )
}

export default TeamList
