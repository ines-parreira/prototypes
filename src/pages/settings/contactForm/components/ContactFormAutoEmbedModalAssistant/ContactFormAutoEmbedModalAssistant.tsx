import React from 'react'
import _noop from 'lodash/noop'
import {useQueryClient} from '@tanstack/react-query'
import Modal from 'pages/common/components/modal/Modal'
import ModalHeader from 'pages/common/components/modal/ModalHeader'
import ModalActionsFooter from 'pages/common/components/modal/ModalActionsFooter'
import Button from 'pages/common/components/button/Button'

import {
    CreateShopifyPageEmbedmentDto,
    EmbeddablePage,
} from 'models/contactForm/types'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import useAppDispatch from 'hooks/useAppDispatch'
import {isGorgiasApiError} from 'models/api/types'
import PageEmbedmentForm, {
    EmbedMode,
    usePageEmbedmentForm,
} from '../PageEmbedmentForm'
import {
    contactFormPageEmbedmentsKeys,
    useCreatePageEmbedment,
} from '../../queries'
import {MODAL_LABELS} from './constants'

import css from './ContactFormAutoEmbedModalAssistant.less'

type ContactFormAutoEmbedModalAssistantProps = {
    isOpen: boolean
    onClose: () => void
    pages: EmbeddablePage[]
    contactFormId: number
}

/**
 * This is a modal that guides the merchant through the process of embedding the contact form  on their Website pages.
 * We might refactor this component to a more generic one in the future when supporting the Help center embedment.
 */
const ContactFormAutoEmbedModalAssistant = (
    {
        onClose,
        isOpen,
        pages,
        contactFormId,
    }: ContactFormAutoEmbedModalAssistantProps = {
        isOpen: false,
        onClose: _noop,
        pages: [],
        contactFormId: 0,
    }
) => {
    const {
        state: pageEmbedmentForm,
        dispatch: pageEmbedmentFormDispatch,
        reset: resetPageEmbedmentForm,
        // isPristine,
    } = usePageEmbedmentForm()

    const appDispatch = useAppDispatch()

    const queryClient = useQueryClient()

    const createPageEmbedmentMutation = useCreatePageEmbedment({
        onSuccess: async (newPageEmbedment) => {
            if (!newPageEmbedment) {
                void appDispatch(
                    notify({
                        message: 'Something went wrong',
                    })
                )
                return
            }

            void appDispatch(
                notify({
                    message: 'Form embedded to page.',
                    status: NotificationStatus.Success,
                })
            )

            await queryClient.invalidateQueries(
                contactFormPageEmbedmentsKeys.all(contactFormId)
            )
            handleOnClose()
        },
        onError: (error) => {
            const message = isGorgiasApiError(error)
                ? error.response?.data.error.msg
                : 'Something went wrong'

            const isHandleError =
                message?.indexOf(
                    `handle ${pageEmbedmentForm.pageSlug.value} already exists`
                ) !== -1

            if (isHandleError) {
                pageEmbedmentFormDispatch({
                    type: 'setPageSlug',
                    payload: {
                        ...pageEmbedmentForm.pageSlug,
                        error: message ?? '',
                    },
                })
            }

            void appDispatch(
                notify({
                    message: 'Something went wrong',
                    status: NotificationStatus.Error,
                })
            )
        },
    })

    const handleOnClose = () => {
        onClose()
        resetPageEmbedmentForm()
    }

    const handleEmbed = () => {
        const payload: CreateShopifyPageEmbedmentDto =
            pageEmbedmentForm.embedMode === EmbedMode.NEW_PAGE
                ? {
                      title: pageEmbedmentForm.pageName.value,
                      handle: pageEmbedmentForm.pageSlug.value,
                  }
                : {
                      shopify_page_id: pageEmbedmentForm.selectedPage.id,
                      position: pageEmbedmentForm.pagePosition,
                  }

        createPageEmbedmentMutation.mutate([
            undefined,
            {contact_form_id: contactFormId},
            payload,
        ])
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
                shopifyPages={pages}
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
