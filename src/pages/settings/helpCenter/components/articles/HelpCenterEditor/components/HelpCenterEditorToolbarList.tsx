import React from 'react'

import {HelpCenterEditorToolbarButton} from './HelpCenterEditorToolbarButton'
import {HelpCenterEditorToolbarSeparator} from './HelpCenterEditorToolbarSeparator'

export const listOptions = [
    'unordered',
    'ordered',
    'indent',
    'outdent',
] as const

type Props = {
    onChange: (action: typeof listOptions[number]) => void
    currentState: {
        listType: 'unordered' | 'ordered'
    }
    outdentDisabled: boolean
    indentDisabled: boolean
}

export const HelpCenterEditorToolbarList = ({
    currentState,
    onChange,
    outdentDisabled,
    indentDisabled,
}: Props) => {
    return (
        <>
            <HelpCenterEditorToolbarButton
                active={currentState.listType === 'ordered'}
                icon="format_list_numbered"
                onClick={() => onChange('ordered')}
                tooltip="Numbered list"
            />
            <HelpCenterEditorToolbarButton
                active={currentState.listType === 'unordered'}
                icon="format_list_bulleted"
                onClick={() => onChange('unordered')}
                tooltip="Unumbered list"
            />
            <HelpCenterEditorToolbarButton
                disabled={outdentDisabled}
                icon="format_indent_decrease"
                onClick={() => onChange('outdent')}
                tooltip="Indent list"
            />
            <HelpCenterEditorToolbarButton
                disabled={indentDisabled}
                icon="format_indent_increase"
                onClick={() => onChange('indent')}
                tooltip="Unindent list"
            />
            <HelpCenterEditorToolbarSeparator />
        </>
    )
}
