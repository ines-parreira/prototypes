import { useCallback, useState } from 'react'

import { logEvent, SegmentEvent } from '@repo/logging'

import { Button, Heading, Modal, Text } from '@gorgias/axiom'

import { GuidanceTemplateCard } from 'pages/aiAgent/components/GuidanceTemplateCard/GuidanceTemplateCard'
import { useGuidanceTemplates } from 'pages/aiAgent/hooks/useGuidanceTemplates'
import { OPEN_CREATE_GUIDANCE_ARTICLE_MODAL } from 'pages/aiAgent/KnowledgeHub/constants'
import { useListenToDocumentEvent } from 'pages/aiAgent/KnowledgeHub/EmptyState/utils'
import type { GuidanceTemplate } from 'pages/aiAgent/types'

import css from './EmptyState.less'

type AddGuidanceTemplateModalProps = {
    onTemplateSelect: (template: GuidanceTemplate | undefined) => void
}

export const AddGuidanceTemplateModal = ({
    onTemplateSelect,
}: AddGuidanceTemplateModalProps) => {
    const { guidanceTemplates } = useGuidanceTemplates()
    const [isOpen, setIsOpen] = useState(false)

    const toggleModal = useCallback(() => {
        setIsOpen((prev) => !prev)
    }, [])

    useListenToDocumentEvent(OPEN_CREATE_GUIDANCE_ARTICLE_MODAL, toggleModal)

    const onGuidanceTemplateClick = useCallback(
        (template: GuidanceTemplate) => {
            logEvent(SegmentEvent.AiAgentGuidanceCardClicked, {
                source: 'empty',
                type: 'template',
                name: template.name,
            })

            onTemplateSelect(template)
            setIsOpen(false)
        },
        [onTemplateSelect],
    )

    const onCustomGuidanceClick = useCallback(() => {
        logEvent(SegmentEvent.AiAgentGuidanceCardClicked, {
            source: 'empty',
            type: 'custom',
        })

        onTemplateSelect(undefined)
        setIsOpen(false)
    }, [onTemplateSelect])

    return (
        <Modal isOpen={isOpen} onOpenChange={toggleModal} size="lg">
            {guidanceTemplates.length > 0 && (
                <div className={css.templatesContainer}>
                    <div className={css.templatesContainerHeader}>
                        <div>
                            <Heading size="lg">Create Guidance</Heading>
                            <Text>
                                Use our pre-built templates as a starting point
                                or build your own guidance from scratch.
                            </Text>
                        </div>
                        <Button
                            variant="secondary"
                            leadingSlot="add"
                            onClick={onCustomGuidanceClick}
                        >
                            Custom Guidance
                        </Button>
                    </div>
                    <div className={css.templatesList}>
                        {guidanceTemplates.map((template) => (
                            <div key={template.id}>
                                <GuidanceTemplateCard
                                    onClick={() =>
                                        onGuidanceTemplateClick(template)
                                    }
                                    guidanceTemplate={template}
                                />
                            </div>
                        ))}
                    </div>
                    <div>
                        <Text variant="bold" size="sm">
                            Not sure where to start?{' '}
                        </Text>
                        <Text size="sm" className={css.templateFooter}>
                            Explore our Help Center↗ for step-by-step guides,
                            best practices, and educational resources to make
                            the most of guidance templates.
                        </Text>
                    </div>
                </div>
            )}
        </Modal>
    )
}
