import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { useHelpdeskV2MS1Flag } from '@repo/tickets/feature-flags'
import classnames from 'classnames'

import useAppSelector from 'hooks/useAppSelector'
import { AgentLabel } from 'pages/common/utils/labels'
import TicketHeader from 'pages/tickets/detail/components/TicketHeader'
import useCollisionDetection from 'pages/tickets/detail/components/TicketHeaderWrapper/hooks/useCollisionDetection'
import type { OnToggleUnreadFn } from 'tickets/dtp'

import TicketFields from '../TicketFields/TicketFields'

import css from './TicketHeaderWrapper.less'

const CollisionDetection = ({ ticketId }: { ticketId: number }) => {
    const { agentsViewing, agentsViewingNotTyping, agentsTyping, hasBoth } =
        useCollisionDetection(ticketId)

    return (
        <div
            className={classnames(css.viewersBanner, {
                [css.hidden]:
                    agentsViewing.length <= 0 && agentsTyping.length <= 0,
                [css.bothCollisions]: hasBoth,
            })}
        >
            {
                // we want to hide text during animation if there is no agents viewing
                agentsTyping.length > 0 && (
                    <div className={css.collisionCategory}>
                        <i className={classnames(css.icon, 'material-icons')}>
                            mode_edit
                        </i>

                        <div className={css.collisionLabel}>Typing:</div>

                        {agentsTyping.map((agent, index) => (
                            <AgentLabel
                                key={index}
                                name={agent.name}
                                profilePictureUrl={
                                    agent.meta?.profile_picture_url
                                }
                                className={css.collisionAgent}
                                shouldDisplayAvatar
                            />
                        ))}
                    </div>
                )
            }
            {
                // we want to hide text during animation if there is no agents viewing
                agentsViewingNotTyping.length > 0 && (
                    <div className={css.collisionCategory}>
                        <i className={classnames(css.icon, 'material-icons')}>
                            remove_red_eye
                        </i>

                        <div className={css.collisionLabel}>Viewing:</div>

                        {agentsViewingNotTyping.map((agent, index) => (
                            <AgentLabel
                                key={index}
                                name={agent.name}
                                profilePictureUrl={
                                    agent.meta?.profile_picture_url
                                }
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
    onGoToNextTicket?: () => void
    onToggleUnread?: OnToggleUnreadFn
}

const TicketHeaderWrapper = ({
    hideTicket,
    setStatus,
    onGoToNextTicket,
    onToggleUnread,
}: Props) => {
    const ticket = useAppSelector((state) => state.ticket)
    const hasMessagesTranslation = useFlag(FeatureFlagKey.MessagesTranslations)
    const hasUIVisionMS1 = useHelpdeskV2MS1Flag()

    const isExistingTicket = !!ticket.get('id')

    return (
        <>
            <div className={classnames(css.headerContainer)}>
                {!hasUIVisionMS1 && (
                    <>
                        <TicketHeader
                            ticket={ticket}
                            hideTicket={hideTicket}
                            setStatus={setStatus}
                            className="flex-grow"
                            onGoToNextTicket={onGoToNextTicket}
                            onToggleUnread={onToggleUnread}
                        />
                        <TicketFields />
                    </>
                )}
                <CollisionDetection ticketId={ticket.get('id')} />
            </div>
            {isExistingTicket && !hasMessagesTranslation && (
                <div style={{ height: 8 }} />
            )}
        </>
    )
}

export default TicketHeaderWrapper
