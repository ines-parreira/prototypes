import React from 'react'

import CollapsedAction from './CollapsedAction'

const HideAction: React.FC<{
    shouldHide: boolean
    isFacebookComment: boolean
    toggleHideComment: () => void
}> = ({shouldHide, isFacebookComment, toggleHideComment}) => {
    const hideText = shouldHide ? 'Hide' : 'Unhide'

    return (
        <CollapsedAction
            icon={<i className="material-icons">visibility_off</i>}
            title={`${hideText} comment`}
            description={`${hideText} the comment in ${
                isFacebookComment ? 'Facebook' : 'Instagram'
            }`}
            onClick={toggleHideComment}
        />
    )
}

export default HideAction
