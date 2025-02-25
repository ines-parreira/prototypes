import React, { memo } from 'react'

import { Source } from 'models/widget/types'

import { Button as ButtonType } from '../types'
import ButtonsGroup from './Display'
import Editor from './Editor'

type Props = {
    templatePath: string
    absolutePath: (string | number)[]
    buttons: ButtonType[]
    source: Source
    isEditing: boolean
}

export function ActionButtons({
    templatePath,
    absolutePath,
    buttons,
    source,
    isEditing,
}: Props) {
    if (isEditing)
        return (
            <Editor
                templatePath={templatePath}
                absolutePath={absolutePath}
                source={source}
                buttons={buttons}
            />
        )

    if (buttons.length)
        return <ButtonsGroup buttons={buttons} source={source} />

    return null
}

export default memo(ActionButtons)
