import { Skeleton } from '@gorgias/axiom'

import { ChatSettingsSkeleton } from 'pages/integrations/integration/components/gorgias_chat/revamp/ChatSettingsSkeleton'

import css from './ChatSettingsLanguagesSkeleton.less'

export const ChatSettingsLanguagesSkeleton = () => {
    return (
        <ChatSettingsSkeleton>
            <div className={css.content}>
                <Skeleton height="300px" />
            </div>
        </ChatSettingsSkeleton>
    )
}
