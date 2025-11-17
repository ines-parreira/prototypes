import React, { memo } from 'react'

import classnames from 'classnames'

import type { CardTemplate, Source } from 'models/widget/types'

import ActionButtons from './ActionButtons'
import Links from './Links'

import css from './CustomActions.less'

type Props = {
    template: CardTemplate
    source: Source
    isEditing: boolean
}

function CustomActions(props: Props) {
    const { template, source, isEditing } = props
    const templatePath = template.templatePath || ''
    const absolutePath = template.absolutePath || []
    const links = template.meta?.custom?.links || []
    const buttons = template.meta?.custom?.buttons || []

    if (!isEditing && !links.length && !buttons.length) return null

    return (
        <div className={classnames(css.container)}>
            <ActionButtons
                templatePath={templatePath}
                absolutePath={absolutePath}
                source={source}
                buttons={buttons}
                isEditing={isEditing}
            />
            <Links
                templatePath={templatePath}
                absolutePath={absolutePath}
                source={source}
                links={links}
                isEditing={isEditing}
            />
        </div>
    )
}

export default memo(CustomActions)
