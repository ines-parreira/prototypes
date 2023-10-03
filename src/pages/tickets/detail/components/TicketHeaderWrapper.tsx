import classnames from 'classnames'
import {fromJS, Map} from 'immutable'
import React, {useMemo} from 'react'

import TicketHeader from 'pages/tickets/detail/components/TicketHeader'
import useAppSelector from 'hooks/useAppSelector'
import {AgentLabel} from 'pages/common/utils/labels'
import {
    getOtherAgentsOnTicket,
    getOtherAgentsTypingOnTicket,
} from 'state/agents/selectors'

import css from './TicketHeaderWrapper.less'
import TicketFields from './TicketFields/TicketFields'

const CollisionDetection = () => {
    const agentsViewing =
        useAppSelector((state) =>
            getOtherAgentsOnTicket(state.ticket.get('id'))(state)
        ) || fromJS([])
    const agentsTyping =
        useAppSelector((state) =>
            getOtherAgentsTypingOnTicket(state.ticket.get('id'))(state)
        ) || fromJS([])

    const agentsViewingNotTyping = useMemo(
        () => agentsViewing.filter((userId) => !agentsTyping.contains(userId)),
        [agentsViewing, agentsTyping]
    )
    const hasBoth = useMemo(
        () => agentsTyping.size > 0 && agentsViewingNotTyping.size > 0,
        [agentsTyping, agentsViewingNotTyping]
    )

    return (
        <div
            className={classnames(css.viewersBanner, {
                [css.hidden]: agentsViewing.size <= 0 && agentsTyping.size <= 0,
                [css.bothCollisions]: hasBoth,
            })}
        >
            {
                // we want to hide text during animation if there is no agents viewing
                agentsTyping.size > 0 && (
                    <div className={css.collisionCategory}>
                        <i className={classnames(css.icon, 'material-icons')}>
                            mode_edit
                        </i>

                        <div className={css.collisionLabel}>Typing:</div>

                        {agentsTyping.map((agent, index) => (
                            <AgentLabel
                                key={index}
                                name={(agent as Map<any, any>).get('name')}
                                profilePictureUrl={(
                                    agent as Map<any, any>
                                ).getIn(['meta', 'profile_picture_url'])}
                                className={css.collisionAgent}
                                shouldDisplayAvatar
                            />
                        ))}
                    </div>
                )
            }
            {
                // we want to hide text during animation if there is no agents viewing
                agentsViewingNotTyping.size > 0 && (
                    <div className={css.collisionCategory}>
                        <i className={classnames(css.icon, 'material-icons')}>
                            remove_red_eye
                        </i>

                        <div className={css.collisionLabel}>Viewing:</div>

                        {agentsViewingNotTyping.map((agent, index) => (
                            <AgentLabel
                                key={index}
                                name={(agent as Map<any, any>).get('name')}
                                profilePictureUrl={(
                                    agent as Map<any, any>
                                ).getIn(['meta', 'profile_picture_url'])}
                                className={css.collisionAgent}
                                shouldDisplayAvatar
                            />
                        ))}
                    </div>
                )
            }
        </div>
    )
}

type Props = {
    hideTicket: () => Promise<void>
    setStatus: (status: string) => any
}

const TicketHeaderWrapper = ({hideTicket, setStatus}: Props) => {
    const ticket = useAppSelector((state) => state.ticket)

    const isExistingTicket = !!ticket.get('id')

    return (
        <>
            <div className={classnames(css.headerContainer)}>
                <TicketHeader
                    ticket={ticket}
                    hideTicket={hideTicket}
                    setStatus={setStatus}
                    className="flex-grow"
                />
                <TicketFields />
                <CollisionDetection />
            </div>
            {isExistingTicket && <div style={{height: 16}} />}
        </>
    )
}

export default TicketHeaderWrapper
