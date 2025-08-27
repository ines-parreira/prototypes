import { FeatureFlagKey } from 'config/featureFlags'
import { useFlag } from 'core/flags'

import css from './TicketSubjectLoadingState.less'

type TicketSubjectLoadingStateProps = {
    children: React.ReactNode
    isInitialLoading: boolean
}

export const TicketSubjectLoadingState = ({
    children,
    isInitialLoading,
}: TicketSubjectLoadingStateProps) => {
    const hasMessagesTranslations = useFlag(FeatureFlagKey.MessagesTranslations)

    if (!hasMessagesTranslations) {
        return <>{children}</>
    }

    if (isInitialLoading) {
        return (
            <div
                className={css.skeleton}
                aria-busy="true"
                aria-live="polite"
                role="status"
                aria-label="Loading ticket subject"
            >
                <div className={css.skeletonSubject} />
            </div>
        )
    }

    return <>{children}</>
}
