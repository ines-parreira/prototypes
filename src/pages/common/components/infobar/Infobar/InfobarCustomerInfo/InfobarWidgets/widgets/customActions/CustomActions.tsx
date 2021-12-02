import React, {memo} from 'react'
import classnames from 'classnames'
import {List, Map} from 'immutable'

import Links from './Links'
// todo @manuel : remove comments when the last PR about custom action buttons is merged
// import ActionButtons from './ActionButtons'
import css from './CustomActions.less'

type Props = {
    template: Map<string, unknown>
    source: Map<string, unknown>
    isEditing: boolean
}

function CustomActions(props: Props) {
    const {template, source, isEditing} = props
    const templatePath = template.get('templatePath', '') as string
    const templateAbsolutePath = template.get('absolutePath', '') as string
    const immutableLinks = template.getIn(
        ['meta', 'custom', 'links'],
        List<Map<string, unknown>>()
    ) as List<Map<string, unknown>>
    const immutableButtons = template.getIn(
        ['meta', 'custom', 'buttons'],
        List<Map<string, unknown>>()
    ) as List<Map<string, unknown>>
    if (!isEditing && !immutableLinks.size && !immutableButtons.size)
        return null
    return (
        <div className={classnames(css.container)}>
            {/* <ActionButtons
                templatePath={templatePath}
                templateAbsolutePath={templateAbsolutePath}
                source={source}
                immutableButtons={immutableButtons}
                isEditing={isEditing}
            /> */}
            <Links
                templatePath={templatePath}
                templateAbsolutePath={templateAbsolutePath}
                source={source}
                immutableLinks={immutableLinks}
                isEditing={isEditing}
            />
        </div>
    )
}

export default memo(CustomActions)
