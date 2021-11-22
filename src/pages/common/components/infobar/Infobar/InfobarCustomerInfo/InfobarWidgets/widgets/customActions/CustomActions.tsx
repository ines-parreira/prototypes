import React, {memo} from 'react'
import classnames from 'classnames'
import {List, Map} from 'immutable'

import Links from './Links'
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
    return (
        <div className={classnames(css.container)}>
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
