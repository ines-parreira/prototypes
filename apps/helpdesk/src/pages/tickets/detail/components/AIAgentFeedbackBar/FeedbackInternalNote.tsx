import { useCallback, useEffect, useState } from 'react'

import { useFeedbackTracking } from '@repo/ai-agent'
import { useDebouncedEffect } from '@repo/hooks'

import { LegacyLabel as Label } from '@gorgias/axiom'

import TextArea from 'gorgias-design-system/Input/TextArea'
import useAppSelector from 'hooks/useAppSelector'
import css from 'pages/tickets/detail/components/AIAgentFeedbackBar/AIAgentSimplifiedFeedback.less'
import AutoSaveBadge from 'pages/tickets/detail/components/AIAgentFeedbackBar/AutoSaveBadge'
import { AutoSaveState } from 'pages/tickets/detail/components/AIAgentFeedbackBar/types'
import { getCurrentAccountState } from 'state/currentAccount/selectors'
import { getTicketState } from 'state/ticket/selectors'

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

    const ticket = useAppSelector(getTicketState)
    const account = useAppSelector(getCurrentAccountState)
    const currentUser = useAppSelector((state) => state.currentUser)

    const ticketId: number = ticket.get('id')
    const accountId: number = account.get('id')
    const userId: number = currentUser.get('id')

    const { onFeedbackGiven } = useFeedbackTracking({
        ticketId,
        accountId,
        userId,
    })

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
                onFeedbackGiven('internal-note')
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
                <span>Additional feedback</span>
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
                We use this to monitor conversation quality.
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
