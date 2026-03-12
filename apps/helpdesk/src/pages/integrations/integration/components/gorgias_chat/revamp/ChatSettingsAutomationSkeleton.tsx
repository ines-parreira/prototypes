import { Skeleton } from '@gorgias/axiom'

import { ChatSettingsSkeleton } from 'pages/integrations/integration/components/gorgias_chat/revamp/ChatSettingsSkeleton'

import css from './ChatSettingsAutomationSkeleton.less'

export const ChatSettingsAutomationSkeleton = () => {
    return (
        <ChatSettingsSkeleton>
            <div className={css.content}>
                <Skeleton height="140px" width="100%" />
            </div>
        </ChatSettingsSkeleton>
    )
}
