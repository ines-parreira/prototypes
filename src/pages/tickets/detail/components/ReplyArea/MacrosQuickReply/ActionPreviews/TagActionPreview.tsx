import React from 'react'
import {List, Map} from 'immutable'

import useAppSelector from 'hooks/useAppSelector'
import {MacroAction} from 'models/macroAction/types'
import {TagLabel} from 'pages/common/utils/labels'
import {getTags} from 'state/tags/selectors'

import {BaseActionPreview} from './BaseActionPreview'

type Props = {
    action: MacroAction
}

export const TagActionPreview = ({action}: Props) => {
    const tags = action.arguments.tags?.split(',') || []
    const tagStore = useAppSelector<List<any>>(getTags)

    if (!tags.length) {
        return null
    }

    const tagLabels = tags.map((tag) => {
        const tagObject: Map<any, any> = tagStore.find(
            (tagObject: Map<any, any>) => tagObject.get('name') === tag
        )

        return (
            <TagLabel key={tag} decoration={tagObject.get('decoration')}>
                {tag}
            </TagLabel>
        )
    })

    return (
        <BaseActionPreview actionName="Add tags">{tagLabels}</BaseActionPreview>
    )
}

export default TagActionPreview
