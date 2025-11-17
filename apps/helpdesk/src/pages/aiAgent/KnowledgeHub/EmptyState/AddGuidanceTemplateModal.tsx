import { useCallback, useEffect, useState } from 'react'

import { logEvent, SegmentEvent } from '@repo/logging'

import { Heading, Icon, Modal, Text } from '@gorgias/axiom'

import { useGuidanceTemplates } from 'pages/aiAgent/hooks/useGuidanceTemplates'

import { GuidanceTemplateCard } from '../../components/GuidanceTemplateCard/GuidanceTemplateCard'
import type { GuidanceTemplate } from '../../types'
import { OPEN_CREATE_GUIDANCE_ARTICLE_MODAL } from '../constants'

import css from './EmptyState.less'

const SHOW_TEMPLATES_COUNT = 8

export const AddGuidanceTemplateModal = () => {
    const { guidanceTemplates } = useGuidanceTemplates()
    const [isOpen, setIsOpen] = useState(false)

    const toggleModal = useCallback(() => {
        setIsOpen(!isOpen)
    }, [isOpen])

    useEffect(() => {
        document.addEventListener(
            OPEN_CREATE_GUIDANCE_ARTICLE_MODAL,
            toggleModal,
        )
        return () => {
            document.removeEventListener(
                OPEN_CREATE_GUIDANCE_ARTICLE_MODAL,
                toggleModal,
            )
        }
    }, [toggleModal])

    const onGuidanceTemplateClick = (template: GuidanceTemplate) => {
        logEvent(SegmentEvent.AiAgentGuidanceCardClicked, {
            source: 'empty',
            type: 'template',
            name: template.name,
        })

        // TODO: open knowledge editor
    }

    return (
        <Modal isOpen={isOpen} onOpenChange={toggleModal} size="lg">
            {guidanceTemplates.length > 0 && (
                <div className={css.templatesContainer}>
                    <div className={css.templatesContainerHeader}>
                        <Heading size="lg">Create Guidance</Heading>
                        <Text>
                            Use our pre-built templates as a starting point or
                            build your own guidance from scratch.
                        </Text>
                    </div>
                    <div className={css.templatesList}>
                        <div key="empty-card" className={css.emptyCard}>
                            <div className={css.chip}>
                                <Icon name="add-plus" />
                            </div>
                            <Heading size="sm">Custom Guidance</Heading>
                        </div>
                        {guidanceTemplates
                            .slice(0, SHOW_TEMPLATES_COUNT)
                            .map((template) => (
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
