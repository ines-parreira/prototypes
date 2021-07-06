import React from 'react'

import {HelpCenterEditorToolbarButton} from './HelpCenterEditorToolbarButton'
import {HelpCenterEditorToolbarSeparator} from './HelpCenterEditorToolbarSeparator'

export const historyOptions = ['undo', 'redo'] as const

type Props = {
    onChange: (option: string) => void
    currentState: {
        undoDisabled: boolean
        redoDisabled: boolean
    }
}

export const HelpCenterEditorToolbarHistory = ({
    onChange,
    currentState,
}: Props) => {
    const isDisabled = (option: string): boolean => {
        const key = `${option}Disabled` as 'undoDisabled' | 'redoDisabled'
        return Boolean(currentState[key])
    }

    return (
        <>
            {historyOptions.map((option) => (
                <HelpCenterEditorToolbarButton
                    key={option}
                    disabled={isDisabled(option)}
                    icon={option}
                    onClick={() => onChange(option)}
                />
            ))}
            <HelpCenterEditorToolbarSeparator />
        </>
    )
}
