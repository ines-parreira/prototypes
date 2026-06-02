import { useMemo } from 'react'

import { GuidanceEditor } from 'pages/aiAgent/components/GuidanceEditor/GuidanceEditor'

import {
    normalizeLegacyContent,
    stabilize,
} from 'AIJourney/utils/normalizeLegacyContent'

type MessageGuidanceFieldEditorProps = {
    value: string
    onChange: (next: string) => void
    shopName: string
    charLimit: number
    description?: string
    label?: string
}

export const MessageGuidanceFieldEditor = ({
    value,
    onChange,
    shopName,
    charLimit,
    description,
    label,
}: MessageGuidanceFieldEditorProps) => {
    const displayContent = useMemo(() => normalizeLegacyContent(value), [value])
    const stableValue = useMemo(
        () => stabilize(displayContent),
        [displayContent],
    )

    const handleChange = (next: string) => {
        if (next === stableValue) return
        onChange(next)
    }

    return (
        <GuidanceEditor
            content={displayContent}
            shopName={shopName}
            availableActions={[]}
            showActionsButton={false}
            showVariablesButton={false}
            showShortcutHint={false}
            handleUpdateContent={handleChange}
            charLimit={charLimit}
            description={description}
            label={label}
            editorContextName="MessageGuidance"
        />
    )
}
