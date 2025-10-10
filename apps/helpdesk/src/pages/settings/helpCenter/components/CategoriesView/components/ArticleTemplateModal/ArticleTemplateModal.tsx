import { LegacyButton as Button } from '@gorgias/axiom'

import { logEvent, SegmentEvent } from 'common/segment'
import { ArticleTemplate } from 'models/helpCenter/types'
import Modal from 'pages/common/components/modal/Modal'
import ModalActionsFooter from 'pages/common/components/modal/ModalActionsFooter'
import ModalBody from 'pages/common/components/modal/ModalBody'
import ModalHeader from 'pages/common/components/modal/ModalHeader'

import css from './ArticleTemplateModal.less'

type Props = {
    isOpen: boolean
    onClose: () => void
    template: ArticleTemplate
    canUpdateArticle: boolean | null
    onCreateArticleWithTemplate: (template: ArticleTemplate) => void
}

export const ArticleTemplateModal = ({
    isOpen,
    onClose,
    template,
    canUpdateArticle,
    onCreateArticleWithTemplate,
}: Props) => {
    const sanitizedHtmlContent = (template.html_content || '')?.replace(
        /\\n/g,
        '',
    )

    const handleUseTemplate = () => {
        onCreateArticleWithTemplate(template)
        logEvent(
            SegmentEvent.HelpCenterTemplatesUseTemplateButtonInModalClicked,
            {
                template_key: template.key,
            },
        )
        onClose()
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} classNameDialog={css.dialog}>
            <ModalHeader title={template.title} />
            <ModalBody className={css.modalBody}>
                <div className={css.preview}>
                    {isOpen && (
                        <>
                            <h1 className={css.title}>{template.title}</h1>
                            <div
                                dangerouslySetInnerHTML={{
                                    __html: sanitizedHtmlContent,
                                }}
                            />
                        </>
                    )}
                </div>
            </ModalBody>
            <ModalActionsFooter>
                <Button intent="secondary" onClick={onClose}>
                    Cancel
                </Button>
                <Button
                    onClick={handleUseTemplate}
                    isDisabled={!canUpdateArticle}
                >
                    Use template
                </Button>
            </ModalActionsFooter>
        </Modal>
    )
}
