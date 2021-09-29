import React from 'react'

import {HelpCenterEditorToolbarButton} from './HelpCenterEditorToolbarButton'
import {HelpCenterEditorToolbarSeparator} from './HelpCenterEditorToolbarSeparator'

// TODO : add 'underline' and 'strikethrough' later as it's not part of default markdown
export const inlineOptions = [
    {name: 'bold', tooltip: 'Bold'},
    {name: 'italic', tooltip: 'Italic'},
    {name: 'monospace', tooltip: 'Inline code'},
] as const

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
            {inlineOptions.map(({name, tooltip}) => (
                <HelpCenterEditorToolbarButton
                    key={name}
                    active={currentState[name]}
                    icon={
                        name === 'monospace'
                            ? 'integration_instructions'
                            : `format_${name}`
                    }
                    onClick={() => onChange(name, !currentState[name])}
                    tooltip={tooltip}
                />
            ))}
            <HelpCenterEditorToolbarSeparator />
        </>
    )
}
