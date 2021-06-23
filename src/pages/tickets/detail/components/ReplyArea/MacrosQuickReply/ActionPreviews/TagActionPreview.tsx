import React from 'react'
import {useSelector} from 'react-redux'
import {List, Map} from 'immutable'

import {Badge} from 'reactstrap'

import {getTags} from '../../../../../../../state/tags/selectors'
import {RootState} from '../../../../../../../state/types'
import {MacroAction} from '../../../../../../../models/macroAction/types'
import {DEFAULT_TAG_COLOR} from '../../../../../../../config'

import {BaseActionPreview} from './BaseActionPreview'

import css from './TagActionPreview.less'

type Props = {
    action: MacroAction
}

export const TagActionPreview = ({action}: Props) => {
    const tags = action.arguments.tags?.split(',') || []
    const tagStore = useSelector<RootState, List<any>>(getTags)

    if (!tags.length) {
        return null
    }

    const tagLabels = tags.map((tag) => {
        const tagObject: Map<any, any> = tagStore.find(
            (tagObject: Map<any, any>) => tagObject.get('name') === tag
        )

        const color = tagObject
            ? tagObject.getIn(['decoration', 'color'], DEFAULT_TAG_COLOR)
            : DEFAULT_TAG_COLOR

        return (
            <Badge key={tag} className={css.tag} style={{color}}>
                {tag}
            </Badge>
        )
    })

    return (
        <BaseActionPreview actionName="Add tags">{tagLabels}</BaseActionPreview>
    )
}

export default TagActionPreview
