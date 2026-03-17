import { Skeleton } from '@gorgias/axiom'

import { ChatSettingsSkeleton } from 'pages/integrations/integration/components/gorgias_chat/revamp/ChatSettingsSkeleton'

import css from './ChatSettingsAppearanceSkeleton.less'

export const ChatSettingsAppearanceSkeleton = () => {
    return (
        <ChatSettingsSkeleton>
            <div className={css.content}>
                <Skeleton height="280px" />
                <Skeleton height="160px" />
                <Skeleton height="200px" />
            </div>
        </ChatSettingsSkeleton>
    )
}
