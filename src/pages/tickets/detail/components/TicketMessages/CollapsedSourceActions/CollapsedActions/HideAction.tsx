import React from 'react'

import CollapsedAction from './CollapsedAction'

const HideAction: React.FC<{
    shouldHide: boolean
    isInstagramComment: boolean
    toggleHideComment: () => void
}> = ({shouldHide, isInstagramComment, toggleHideComment}) => {
    const hideText = shouldHide ? 'Hide' : 'Unhide'

    return (
        <CollapsedAction
            icon={<i className="material-icons">visibility_off</i>}
            title={`${hideText} comment`}
            description={`${hideText} the comment in ${
                isInstagramComment ? 'Instagram' : 'Facebook'
            }`}
            onClick={toggleHideComment}
        />
    )
}

export default HideAction
