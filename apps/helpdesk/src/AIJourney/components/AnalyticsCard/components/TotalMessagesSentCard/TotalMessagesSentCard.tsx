import { useHistory } from 'react-router-dom'

import css from './TotalMessagesSentCard.less'

type TotalMessagesSentCardProps = {
    totalSent?: string
    ticketViewId?: unknown
}

export const TotalMessagesSentCard = ({
    totalSent,
    ticketViewId,
}: TotalMessagesSentCardProps) => {
    const history = useHistory()

    const hasSentMessages = !!totalSent && totalSent !== '0'
    const shouldRenderRedirectButton = hasSentMessages && !!ticketViewId

    return (
        <div className={css.totalMessagesSentCard}>
            <div className={css.totalMessages}>
                <i className="material-icons-outlined">sms</i>
                {totalSent} {totalSent === '1' ? 'message' : 'messages'} sent
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
