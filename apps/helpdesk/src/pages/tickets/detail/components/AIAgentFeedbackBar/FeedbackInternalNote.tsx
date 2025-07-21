import { useCallback, useEffect, useState } from 'react'

import { Label } from '@gorgias/merchant-ui-kit'

import TextArea from 'gorgias-design-system/Input/TextArea'
import useDebouncedEffect from 'hooks/useDebouncedEffect'
import css from 'pages/tickets/detail/components/AIAgentFeedbackBar/AIAgentSimplifiedFeedback.less'
import AutoSaveBadge from 'pages/tickets/detail/components/AIAgentFeedbackBar/AutoSaveBadge'
import { AutoSaveState } from 'pages/tickets/detail/components/AIAgentFeedbackBar/types'

type FeedbackInternalNoteProps = {
    onDebouncedChange: (value: string) => void
    initialValue?: string
    lastUpdated?: string
    isMutationLoading?: boolean
}

const FeedbackInternalNote = ({
    onDebouncedChange,
    initialValue,
    isMutationLoading,
    lastUpdated,
}: FeedbackInternalNoteProps) => {
    const [value, setValue] = useState(initialValue || null)
    useEffect(() => {
        setValue(initialValue || '')
    }, [initialValue])

    useDebouncedEffect(
        () => {
            if (
                value !== (initialValue || '') &&
                value !== null &&
                onDebouncedChange
            ) {
                onDebouncedChange(value)
            }
        },
        [value],
        1500,
    )

    const handleChange = useCallback(
        (e: React.ChangeEvent<HTMLTextAreaElement> | string) => {
            // Handle both event object and string value
            const newValue = typeof e === 'string' ? e : e.target.value
            setValue(newValue)
        },
        [],
    )

    return (
        <div className={css.internalNote}>
            <Label className={css.label}>
                <span>Internal note</span>
                <AutoSaveBadge
                    state={
                        isMutationLoading === undefined
                            ? AutoSaveState.INITIAL
                            : isMutationLoading
                              ? AutoSaveState.SAVING
                              : AutoSaveState.SAVED
                    }
                    updatedAt={lastUpdated ? new Date(lastUpdated) : undefined}
                />
            </Label>
            <div className={css.info}>
                Keep track of specific AI Agent issues. Gorgias uses these notes
                to monitor conversation quality.
            </div>
            <TextArea
                id="ai-message-feedback-issues-note"
                data-testid="ai-message-feedback-issues-note-test-id"
                name="description"
                isValid
                rows={1}
                onChange={handleChange}
                value={value ?? ''}
            />
        </div>
    )
}

export default FeedbackInternalNote
