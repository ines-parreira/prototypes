import React from 'react'

import avatar1 from './avatar-1.png'
import avatar2 from './avatar-2.png'
import avatar3 from './avatar-3.png'

import css from './ChatCardAvatars.less'

const avatars = [avatar1, avatar2, avatar3]

const ChatCardAvatars: React.FC = () => {
    return (
        <div className={css.wrapper}>
            {avatars.map((avatar, index) => (
                <div
                    key={avatar}
                    style={{
                        transform: `translateX(-${index * 10}px)`,
                    }}
                >
                    <img
                        src={avatar}
                        alt={`avatar-${index}`}
                        className={css.avatar}
                    />
                </div>
            ))}
        </div>
    )
}

export default ChatCardAvatars
