import { useHistory } from 'react-router-dom'

import css from 'AIJourney/components/AnalyticsCard/components/TotalConversationsCard/TotalConversationsCard.less'

type TotalMessagesSentCardProps = {
    totalConversations?: string
    ticketViewId?: unknown
}

export const TotalConversationsCard = ({
    totalConversations,
    ticketViewId,
}: TotalMessagesSentCardProps) => {
    const history = useHistory()

    const hasSentMessages = !!totalConversations && totalConversations !== '0'
    const shouldRenderRedirectButton = hasSentMessages && !!ticketViewId

    return (
        <div className={css.totalMessagesSentCard}>
            <div className={css.totalMessages}>
                <i className="material-icons-outlined">sms</i>
                {totalConversations}{' '}
                {totalConversations === '1'
                    ? 'total recipient'
                    : 'total recipients'}
            </div>
            {shouldRenderRedirectButton && (
                <button
                    className={css.redirectIcon}
                    onClick={() => {
                        history.push(`/app/views/${ticketViewId}`, {
                            skipRedirect: true,
                        })
                    }}
                >
                    <i className="material-icons-outlined">arrow_forward</i>
                </button>
            )}
        </div>
    )
}
