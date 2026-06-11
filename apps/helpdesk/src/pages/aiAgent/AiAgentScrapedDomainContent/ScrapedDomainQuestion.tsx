import { useEffect, useState } from 'react'

import { logEvent, SegmentEvent } from '@repo/logging'
import { useHistory, useParams } from 'react-router'

import {
    LegacyBanner as Banner,
    LegacyButton as Button,
    toast,
    LegacyToggleField as ToggleField,
} from '@gorgias/axiom'

import { useAiAgentNavigation } from 'pages/aiAgent/hooks/useAiAgentNavigation'
import { ControlledCollapsibleDetails } from 'pages/tickets/detail/components/TicketVoiceCall/ControlledCollapsibleDetails'

import { IngestedResourceStatus } from './constant'

import css from './ScrapedDomainQuestion.less'

type Props = {
    onUpdateStatus?: (
        id: number,
        { status }: { status: IngestedResourceStatus },
    ) => Promise<void>
    questionId?: number
    questionStatus?: 'enabled' | 'disabled'
    questionTitle?: string
    questionAnswer?: string
    questionWebPages?: { url: string }[]
}

const ScrapedDomainQuestion = ({
    onUpdateStatus,
    questionId,
    questionStatus,
    questionTitle,
    questionAnswer,
    questionWebPages,
}: Props) => {
    const history = useHistory()
    const { shopName } = useParams<{
        shopName: string
    }>()
    const { routes } = useAiAgentNavigation({ shopName })

    const [isOpen, setIsOpen] = useState(false)
    const [isEnabled, setIsEnabled] = useState(
        questionStatus === IngestedResourceStatus.Enabled,
    )

    useEffect(() => {
        setIsEnabled(questionStatus === IngestedResourceStatus.Enabled)
    }, [questionStatus])

    const handleToggleChange = ({ id }: { id?: number }) => {
        if (onUpdateStatus && id) {
            onUpdateStatus(id, {
                status: isEnabled
                    ? IngestedResourceStatus.Disabled
                    : IngestedResourceStatus.Enabled,
            }).then(() => {
                toast.success('Successfully updated question')
            })
        }
    }

    return (
        <div className={css.contentContainer}>
            <ToggleField
                name={`toggle-question-details`}
                label="Available for AI Agent"
                value={isEnabled}
                onChange={() => {
                    handleToggleChange({
                        id: questionId,
                    })
                    setIsEnabled(!isEnabled)
                }}
                className={css.toggleInput}
            />
            <Banner
                variant="inline"
                icon
                type="info"
                fillStyle="ghost"
                action={
                    <Button
                        fillStyle="ghost"
                        onClick={() => {
                            logEvent(
                                SegmentEvent.AiAgentGoToGuidanceLinkClicked,
                            )
                            history.push(routes.guidance)
                        }}
                    >
                        Go to Guidance
                    </Button>
                }
            >
                Disable this content if incorrect. Create or update Guidance
                with accurate information for AI Agent.
            </Banner>
            <div className={css.contentBody}>
                <div className={css.bodySemibold}>Question</div>
                <div>{questionTitle}</div>
            </div>
            <div className={css.contentBody}>
                <div className={css.bodySemibold}>Answer</div>
                <div>{questionAnswer}</div>
            </div>
            {questionWebPages && questionWebPages.length > 0 && (
                <div>
                    <ControlledCollapsibleDetails
                        isOpen={isOpen}
                        setIsOpen={setIsOpen}
                        title={
                            <div className={css.sourceHeader}>
                                View source URLs
                            </div>
                        }
                    >
                        <div className={css.sourceBody}>
                            {questionWebPages.map((web_page, index) => (
                                <a
                                    key={index}
                                    href={web_page.url}
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    {web_page.url}
                                </a>
                            ))}
                        </div>
                    </ControlledCollapsibleDetails>
                </div>
            )}
        </div>
    )
}

export { ScrapedDomainQuestion }
