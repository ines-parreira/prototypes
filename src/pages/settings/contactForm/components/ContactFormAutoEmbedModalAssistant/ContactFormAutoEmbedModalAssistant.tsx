import React from 'react'
import _noop from 'lodash/noop'
import Modal from 'pages/common/components/modal/Modal'
import ModalHeader from 'pages/common/components/modal/ModalHeader'
import ModalActionsFooter from 'pages/common/components/modal/ModalActionsFooter'
import Button from 'pages/common/components/button/Button'

import PageEmbedmentForm, {
    ShopifyPage,
    usePageEmbedmentForm,
} from '../PageEmbedmentForm'
import {MODAL_LABELS} from './constants'

import css from './ContactFormAutoEmbedModalAssistant.less'

const MOCK_SHOPIFY_PAGES: ShopifyPage[] = [
    {
        id: 'About Us',
        name: 'About Us',
        slug: 'about-us',
    },
    {
        id: 'Contact Us',
        name: 'Contact Us',
        slug: 'contact-us',
    },
    {
        id: 'FAQ',
        name: 'FAQ',
        slug: 'faq',
    },
    {
        id: 'Size Chart',
        name: 'Size Chart',
        slug: 'size-chart',
    },
    {
        id: 'Shipping',
        name: 'Shipping',
        slug: 'shipping',
    },
]

type ContactFormAutoEmbedModalAssistantProps = {
    isOpen: boolean
    onClose: () => void
}

/**
 * This is a modal that guides the merchant through the process of embedding the contact form  on their Website pages.
 * We might refactor this component to a more generic one in the future when supporting the Help center embedment.
 */
const ContactFormAutoEmbedModalAssistant = (
    {onClose, isOpen}: ContactFormAutoEmbedModalAssistantProps = {
        isOpen: false,
        onClose: _noop,
    }
) => {
    const {
        state: pageEmbedmentForm,
        dispatch: pageEmbedmentFormDispatch,
        reset: resetPageEmbedmentForm,
        // isPristine,
    } = usePageEmbedmentForm()

    const handleOnClose = () => {
        onClose()

        // TODO: reset form inputs
        resetPageEmbedmentForm()
    }

    const handleEmbed = () => {
        alert(
            `trying to embed the following form: ${JSON.stringify(
                pageEmbedmentForm
            )}`
        ) // eslint-disable-line no-alert
    }

    return (
        <Modal
            classNameDialog={css.modalDialog}
            isOpen={isOpen}
            onClose={handleOnClose}
        >
            <ModalHeader title={MODAL_LABELS.TITLE} />
            <PageEmbedmentForm
                modeSelectionTitle={MODAL_LABELS.FORM_MODE_SELECTION_TITLE}
                positionSelectionTitle={
                    MODAL_LABELS.FORM_POSITION_SELECTION_TITLE
                }
                dispatch={pageEmbedmentFormDispatch}
                state={pageEmbedmentForm}
                shopifyPages={MOCK_SHOPIFY_PAGES}
            />
            <ModalActionsFooter>
                <Button intent="secondary" onClick={resetPageEmbedmentForm}>
                    {MODAL_LABELS.CANCEL}
                </Button>
                <Button onClick={handleEmbed}>{MODAL_LABELS.EMBED}</Button>
            </ModalActionsFooter>
        </Modal>
    )
}

export default ContactFormAutoEmbedModalAssistant
