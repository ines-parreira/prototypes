import { useCallback } from 'react'

import classNames from 'classnames'
import { useHistory } from 'react-router-dom'

import { Button, LegacyIconButton } from '@gorgias/axiom'

import translationsOnboardingModalImageMobile from 'assets/img/tickets/ai-translations-onboarding-modal-mobile.png'
import translationsOnboardingModalImage from 'assets/img/tickets/ai-translations-onboarding-modal.png'
import Modal from 'pages/common/components/modal/Modal'
import ModalBody from 'pages/common/components/modal/ModalBody'
import ModalFooter from 'pages/common/components/modal/ModalFooter'

import { useTranslationsOnboardingModal } from './useTranslationsOnboardingModal'

import css from './TranslationsOnboardingModal.less'

export function TranslationsOnboardingModal() {
    const { isOpen, close } = useTranslationsOnboardingModal()
    const history = useHistory()

    /**
     * Using a redirection function instead of a link to ensure that the close() function is called before the redirection,
     * to save in the local storage that the modal has been seen.
     */
    const handleSetupRedirect = useCallback(() => {
        close()
        history.push('/app/settings/profile#translation-settings')
    }, [close, history])

    return (
        <Modal isOpen={isOpen} size="large" onClose={close}>
            <ModalBody className={css.modalBody}>
                <img
                    className={classNames(
                        css.modalImages,
                        css.modalDesktopImage,
                    )}
                    src={translationsOnboardingModalImage}
                    alt="A visualization of the translation feature"
                />
                <img
                    className={classNames(
                        css.modalImages,
                        css.modalMobileImage,
                    )}
                    src={translationsOnboardingModalImageMobile}
                    alt="A visualization of the translation feature"
                />
                <LegacyIconButton
                    icon="close"
                    fillStyle="ghost"
                    intent="secondary"
                    onClick={close}
                    className={css.closeButton}
                />
            </ModalBody>
            <ModalFooter className={css.modalFooter}>
                <div className={css.footerContent}>
                    <h2 className={css.footerTitle}>
                        New! Handle conversations in any language
                    </h2>
                    <p className={css.footerDescription}>
                        Set up your{' '}
                        <span className={css.highlight}>
                            Ticket translation settings
                        </span>{' '}
                        and Gorgias will automatically translate incoming
                        messages and let you translate your response.
                    </p>
                </div>
                <div className={css.footerActions}>
                    <Button variant="primary" onClick={handleSetupRedirect}>
                        Setup
                    </Button>
                    <Button
                        variant="secondary"
                        as="a"
                        href="https://docs.gorgias.com/en-US/2518007-0222a844fe7141adbd957eb1d8988e43"
                    >
                        Learn more
                    </Button>
                </div>
            </ModalFooter>
        </Modal>
    )
}
