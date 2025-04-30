import { useEffect, useState } from 'react'

import { useHistory, useParams } from 'react-router'

import { Banner, Button, ToggleField } from '@gorgias/merchant-ui-kit'

import { ArticleWithLocalTranslation } from 'models/helpCenter/types'
import ControlledCollapsibleDetails from 'pages/tickets/detail/components/TicketVoiceCall/ControlledCollapsibleDetails'

import { useAiAgentNavigation } from '../hooks/useAiAgentNavigation'
import { IngestedResourceStatus } from './constant'
import { IngestedResourceWithArticleId } from './types'

import css from './ScrapedDomainQuestion.less'

type Props = {
    question: IngestedResourceWithArticleId | null
    detail?: ArticleWithLocalTranslation | null
    onUpdateStatus?: (
        id: number,
        { status }: { status: IngestedResourceStatus },
    ) => void
}

const ScrapedDomainQuestion = ({ question, detail, onUpdateStatus }: Props) => {
    const history = useHistory()
    const { shopName } = useParams<{
        shopName: string
    }>()
    const { routes } = useAiAgentNavigation({ shopName })

    const [isOpen, setIsOpen] = useState(false)
    const [isEnabled, setIsEnabled] = useState(
        question?.status === IngestedResourceStatus.Enabled,
    )

    useEffect(() => {
        setIsEnabled(question?.status === IngestedResourceStatus.Enabled)
    }, [question])

    const handleToggleChange = ({ id }: { id?: number }) => {
        if (onUpdateStatus && id) {
            onUpdateStatus(id, {
                status: isEnabled
                    ? IngestedResourceStatus.Disabled
                    : IngestedResourceStatus.Enabled,
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
                        id: question?.id,
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
                        onClick={() => history.push(routes.guidance)}
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
                <div>{question?.title}</div>
            </div>
            <div className={css.contentBody}>
                <div className={css.bodySemibold}>Answer</div>
                <div>{detail?.translation.content}</div>
            </div>
            <div>
                <ControlledCollapsibleDetails
                    isOpen={isOpen}
                    setIsOpen={setIsOpen}
                    title={
                        <div className={css.sourceHeader}>View source URLs</div>
                    }
                >
                    <div className={css.sourceBody}>
                        {question?.web_pages?.map((web_page, index) => (
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
        </div>
    )
}

export default ScrapedDomainQuestion
