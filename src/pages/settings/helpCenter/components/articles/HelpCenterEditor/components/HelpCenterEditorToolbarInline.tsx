import React from 'react'

import {HelpCenterEditorToolbarButton} from './HelpCenterEditorToolbarButton'
import {HelpCenterEditorToolbarSeparator} from './HelpCenterEditorToolbarSeparator'

// TODO : add 'underline' and 'strikethrough' later as it's not part of default markdown
export const inlineOptions = ['bold', 'italic', 'monospace'] as const

type Props = {
    onChange: (option: string, newValue: boolean) => void
    currentState: {
        bold: boolean
        italic: boolean
        underline: boolean
        strikethrough: boolean
        monospace: boolean
    }
}

export const HelpCenterEditorToolbarInline = ({
    onChange,
    currentState,
}: Props) => {
    return (
        <>
            {inlineOptions.map((option) => (
                <HelpCenterEditorToolbarButton
                    key={option}
                    active={currentState[option]}
                    icon={
                        option === 'monospace'
                            ? 'integration_instructions'
                            : `format_${option}`
                    }
                    onClick={() => onChange(option, !currentState[option])}
                />
            ))}
            <HelpCenterEditorToolbarSeparator />
        </>
    )
}
