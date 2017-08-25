import React, {PropTypes} from 'react'

// Useful if we ever add avatars to agents? For now this isn't used
const Avatar = ({mention, theme = {}}) => {
    if (mention.has('avatar')) {
        return (
            <img
                src={mention.get('avatar')}
                className={theme.mentionSuggestionsEntryAvatar}
                role="presentation"
            />
        )
    }

    return null
}

Avatar.propTypes = {
    mention: PropTypes.object,
    theme: PropTypes.object
}

export default Avatar
