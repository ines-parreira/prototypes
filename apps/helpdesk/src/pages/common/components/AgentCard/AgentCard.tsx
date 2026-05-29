import Avatar from 'pages/common/components/Avatar/Avatar'

import { UserAvatar } from '@repo/users'
import css from './AgentCard.less'

type Props = {
    name: string
    url?: string | null
    badgeColor?: string
    description?: string
    userId?: number
    useLegacyAvatar?: boolean
}

export default function AgentCard({
    name,
    url,
    badgeColor,
    description,
    userId,
    useLegacyAvatar = false,
}: Props) {
    const shouldUseLegacyAvatar = useLegacyAvatar || !userId

    return (
        <div className={css.container}>
            {shouldUseLegacyAvatar ? (
                <Avatar
                    shape="round"
                    name={name}
                    url={url}
                    size={36}
                    badgeColor={badgeColor}
                />
            ) : (
                <UserAvatar
                    user={{
                        id: userId,
                        name: name,
                        meta: { profile_picture_url: url },
                    }}
                />
            )}
            <div className={css.info}>
                <div className={css.name}>{name}</div>
                <div className={css.description}>{description}</div>
            </div>
        </div>
    )
}
