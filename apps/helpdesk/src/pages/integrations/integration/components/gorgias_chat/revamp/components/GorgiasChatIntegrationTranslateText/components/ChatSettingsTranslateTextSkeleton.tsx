import { Skeleton } from '@gorgias/axiom'

import { ChatSettingsSkeleton } from 'pages/integrations/integration/components/gorgias_chat/revamp/ChatSettingsSkeleton'

import css from './ChatSettingsTranslateTextSkeleton.less'

export const ChatSettingsTranslateTextSkeleton = () => {
    return (
        <ChatSettingsSkeleton>
            <div className={css.content}>
                <Skeleton height="120px" />
                <Skeleton height="120px" />
                <Skeleton height="120px" />
            </div>
        </ChatSettingsSkeleton>
    )
}
