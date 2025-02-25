import React from 'react'

import { logEvent, SegmentEvent } from 'common/segment'
import InstructionsCard from 'pages/common/components/InstructionsCard'

import { useContactFormManualEmbedInstructionsCardState } from './useContactFormManualEmbedTabs'

type ContactFormManualEmbedCardProps = {
    codeSnippet: string
    shopName: string | null
}

export function ContactFormManualEmbedCard({
    codeSnippet,
    shopName,
}: ContactFormManualEmbedCardProps) {
    const { isOpen, tabs } = useContactFormManualEmbedInstructionsCardState(
        codeSnippet,
        shopName,
    )

    return (
        <InstructionsCard
            title="Manually embed with code"
            description={
                <>
                    Use HTML to manually display the contact form on specific
                    pages of your website. <br /> Note: You must have access to
                    your site theme.
                </>
            }
            onCopyClick={() => {
                logEvent(SegmentEvent.HelpCenterContactFormCopyCode)
            }}
            initialIsOpen={isOpen}
            tabs={tabs}
        />
    )
}

export default ContactFormManualEmbedCard
