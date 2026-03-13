import { Skeleton } from '@gorgias/axiom'

import { ChatSettingsSkeleton } from 'pages/integrations/integration/components/gorgias_chat/revamp/ChatSettingsSkeleton'

import css from './ChatSettingsPreferencesSkeleton.less'

export const ChatSettingsPreferencesSkeleton = () => {
    return (
        <ChatSettingsSkeleton>
            <div className={css.content}>
                <Skeleton height="180px" />
                <Skeleton height="200px" />
                <Skeleton height="160px" />
                <Skeleton height="160px" />
                <Skeleton height="200px" />
                <Skeleton height="200px" />
            </div>
        </ChatSettingsSkeleton>
    )
}
