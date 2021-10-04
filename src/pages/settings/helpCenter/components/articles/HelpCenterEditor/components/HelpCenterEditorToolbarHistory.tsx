import React from 'react'

import {HelpCenterEditorToolbarButton} from './HelpCenterEditorToolbarButton'
import {HelpCenterEditorToolbarSeparator} from './HelpCenterEditorToolbarSeparator'

export const historyOptions = [
    {name: 'undo', tooltip: 'Undo'},
    {name: 'redo', tooltip: 'Redo'},
] as const

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
}: Props): JSX.Element => {
    const isDisabled = (option: string): boolean => {
        const key = `${option}Disabled` as 'undoDisabled' | 'redoDisabled'
        return Boolean(currentState[key])
    }

    return (
        <>
            {historyOptions.map(({name, tooltip}) => (
                <HelpCenterEditorToolbarButton
                    key={name}
                    disabled={isDisabled(name)}
                    icon={name}
                    onClick={() => onChange(name)}
                    tooltip={tooltip}
                />
            ))}
            <HelpCenterEditorToolbarSeparator />
        </>
    )
}
