import React, {useMemo} from 'react'

import {humanizeString} from '../../../../../../utils'
import type {
    TicketMessage,
    TicketMessageIntent,
} from '../../../../../../models/ticket/types'

import {IntentsFeedbackDropdown} from './IntentsFeedbackDropdown'
import {DropdownOptionItem} from './DropdownOptionItem'

type Props = {
    message: TicketMessage
    allIntents?: Record<string, string>
    renderContentOnly?: boolean
    onContentMouseLeave?: () => void
    onToggle?: (isOpen: boolean) => void
    onBack?: () => void
}

export const IntentsFeedback = ({
    message: {intents},
    allIntents = window.GORGIAS_CONSTANTS.INTENTS,
    renderContentOnly,
    onContentMouseLeave,
    onToggle,
    onBack,
}: Props) => {
    const allIntentsNames: string[] = useMemo(
        () => Object.keys(allIntents),
        [allIntents]
    )

    const getIntentsFromMessage = (intents: TicketMessageIntent[]) =>
        allIntentsNames.filter((name) =>
            intents
                .filter((intent) => !intent.rejected)
                .map((intent) => intent.name)
                .includes(name)
        )
    const messageIntentNames = useMemo(
        () => getIntentsFromMessage(intents!),

        // eslint-disable-next-line react-hooks/exhaustive-deps
        [intents]
    )

    const numActiveIntents = messageIntentNames.length
    const activeIntentsHeader =
        numActiveIntents === 0
            ? 'No intents detected'
            : numActiveIntents === 1
            ? messageIntentNames[0]
            : `${numActiveIntents} intents detected`

    return (
        <IntentsFeedbackDropdown
            label={activeIntentsHeader}
            onToggle={(isOpen) => onToggle && onToggle(isOpen)}
            activeIntentsNames={messageIntentNames}
            renderActiveIntent={(intentName: string) => (
                <DropdownOptionItem
                    key={intentName}
                    option={{
                        key: intentName,
                        label: humanizeString(intentName),
                        description: allIntents[intentName],
                    }}
                />
            )}
            onBack={onBack}
            onContentMouseLeave={onContentMouseLeave}
            renderContentOnly={renderContentOnly}
        />
    )
}

export default IntentsFeedback
