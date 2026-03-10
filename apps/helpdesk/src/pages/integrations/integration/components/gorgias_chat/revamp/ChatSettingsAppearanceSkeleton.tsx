import { Skeleton } from '@gorgias/axiom'

import { ChatSettingsSkeleton } from 'pages/integrations/integration/components/gorgias_chat/revamp/ChatSettingsSkeleton'

import css from './ChatSettingsAppearanceSkeleton.less'

export const ChatSettingsAppearanceSkeleton = () => {
    return (
        <ChatSettingsSkeleton>
            <div className={css.content}>
                <Skeleton height="48px" />
                <Skeleton height="220px" width="680px" />
                <Skeleton height="120px" width="680px" />
            </div>
        </ChatSettingsSkeleton>
    )
}
