import { useCallback } from 'react'

import { Label } from '@gorgias/merchant-ui-kit'

import TextArea from 'gorgias-design-system/Input/TextArea'
import css from 'pages/tickets/detail/components/AIAgentFeedbackBar/AIAgentSimplifiedFeedback.less'
import AutoSaveBadge from 'pages/tickets/detail/components/AIAgentFeedbackBar/AutoSaveBadge'
import { AutoSaveState } from 'pages/tickets/detail/components/AIAgentFeedbackBar/types'

type FeedbackInternalNoteProps = {
    onChange: (value: string) => void
    value: string
    lastUpdated?: string
    isMutationLoading?: boolean
}

const FeedbackInternalNote = ({
    onChange,
    value,
    isMutationLoading,
    lastUpdated,
}: FeedbackInternalNoteProps) => {
    const handleChange = useCallback(
        (e: React.ChangeEvent<HTMLTextAreaElement>) => {
            onChange(e as unknown as string)
        },
        [onChange],
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
                value={value}
            />
        </div>
    )
}

export default FeedbackInternalNote
