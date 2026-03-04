import { Button, Heading, Text } from '@gorgias/axiom'

import { GuidanceTemplateCard } from 'pages/aiAgent/components/GuidanceTemplateCard/GuidanceTemplateCard'
import { useGuidanceTemplates } from 'pages/aiAgent/hooks/useGuidanceTemplates'
import type { GuidanceTemplate } from 'pages/aiAgent/types'
import Modal from 'pages/common/components/modal/Modal'
import ModalBody from 'pages/common/components/modal/ModalBody'
import ModalFooter from 'pages/common/components/modal/ModalFooter'
import ModalHeader from 'pages/common/components/modal/ModalHeader'

import css from './GuidanceTemplatesModal.less'

type Props = {
    isOpen: boolean
    onClose: () => void
    onTemplateClick: (template?: GuidanceTemplate) => void
}

export const GuidanceTemplatesModal: React.FC<Props> = ({
    isOpen,
    onClose,
    onTemplateClick,
}) => {
    const { guidanceTemplates } = useGuidanceTemplates()

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            classNameDialog={css.modal}
            preventCloseClickOutside={true}
        >
            <ModalHeader
                className={css.header}
                title={
                    <div className={css.headerContent}>
                        <div>
                            <Heading size="md">Guidance templates</Heading>
                            <Text size="md" variant="regular">
                                Edit, test, and refine these scenarios to build
                                knowledge quickly.
                            </Text>
                        </div>
                        <Button
                            variant="secondary"
                            leadingSlot="add"
                            onClick={() => onTemplateClick()}
                        >
                            Custom Guidance
                        </Button>
                    </div>
                }
            />

            <ModalBody className={css.modalBody}>
                <ul className={css.container}>
                    {guidanceTemplates.map((template) => (
                        <li key={template.id}>
                            <GuidanceTemplateCard
                                onClick={() => onTemplateClick(template)}
                                guidanceTemplate={template}
                            />
                        </li>
                    ))}
                </ul>
            </ModalBody>

            <ModalFooter className={css.modalFooter}>
                <Text size="sm" variant="regular">
                    <span className={css.highlight}>
                        Not sure where to start?{' '}
                    </span>{' '}
                    Explore our{' '}
                    <a
                        href="https://link.gorgias.com/y4z"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={css.helpCenterLink}
                    >
                        Help Center
                    </a>
                    ↗ for step-by-step guides, best practices, and educational
                    resources to make the most of guidance templates.
                </Text>
            </ModalFooter>
        </Modal>
    )
}
