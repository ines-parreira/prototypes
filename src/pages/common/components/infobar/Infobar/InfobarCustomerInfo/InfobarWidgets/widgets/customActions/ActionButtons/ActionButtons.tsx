import React, {memo, useEffect, useState} from 'react'
import {List, Map} from 'immutable'

import {Button as ButtonType} from '../types'

import Editor from './Editor'
import ButtonsGroup from './ButtonsGroup'

type Props = {
    templatePath: string
    templateAbsolutePath: string
    immutableButtons: List<Map<string, unknown>>
    source: Map<string, unknown>
    isEditing: boolean
}

function ActionButtons({
    templatePath,
    templateAbsolutePath,
    immutableButtons,
    source,
    isEditing,
}: Props) {
    const [buttons, setButtons] = useState<ButtonType[]>([])
    useEffect(() => {
        setButtons(immutableButtons.toJS())
    }, [immutableButtons])

    if (isEditing)
        return (
            <Editor
                templatePath={templatePath}
                templateAbsolutePath={templateAbsolutePath}
                source={source}
                buttons={buttons}
            />
        )

    if (buttons.length)
        return <ButtonsGroup buttons={buttons} source={source} />

    return null
}

export default memo(ActionButtons)
