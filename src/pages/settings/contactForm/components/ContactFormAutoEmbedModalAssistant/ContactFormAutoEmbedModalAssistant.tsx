import React from 'react'
import _noop from 'lodash/noop'
import {useQueryClient} from '@tanstack/react-query'
import {useHistory} from 'react-router-dom'
import {get} from 'lodash'
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
import {insertContactFormIdParam} from 'pages/settings/contactForm/utils/navigation'
import {CONTACT_FORM_MANAGE_EMBEDMENTS_PATH} from 'pages/settings/contactForm/constants'
import PageEmbedmentForm, {
    EmbedMode,
    usePageEmbedmentForm,
} from '../PageEmbedmentForm'
import {
    contactFormPageEmbedmentsKeys,
    useCreatePageEmbedment,
} from '../../queries'
import {MODAL_LABELS, SHOPIFY_PAGE_EMBEDMENT_PATH_PREFIX} from './constants'

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
    const history = useHistory()

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

            history.push(
                insertContactFormIdParam(
                    CONTACT_FORM_MANAGE_EMBEDMENTS_PATH,
                    contactFormId
                )
            )
            handleOnClose()
        },
        onError: (error) => {
            const message =
                String(get(error, 'response.data.error.msg')) ??
                'Something went wrong'

            const isHandleError =
                message?.indexOf(`has already been taken`) !== -1

            if (isHandleError) {
                return pageEmbedmentFormDispatch({
                    type: 'setPageSlug',
                    payload: {
                        ...pageEmbedmentForm.pageSlug,
                        error: `This slug already exists on your website. Try a new slug or select 'Embed to existing page' above.`,
                    },
                })
            }

            void appDispatch(
                notify({
                    message,
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
                      page_url_path:
                          SHOPIFY_PAGE_EMBEDMENT_PATH_PREFIX +
                          pageEmbedmentForm.pageSlug.value,
                  }
                : {
                      page_external_id:
                          pageEmbedmentForm.selectedPage.external_id,
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
                <Button
                    isDisabled={
                        createPageEmbedmentMutation.isLoading ||
                        (pageEmbedmentForm.embedMode === EmbedMode.NEW_PAGE &&
                            (!pageEmbedmentForm.pageName?.value ||
                                !pageEmbedmentForm.pageSlug.value)) ||
                        (pageEmbedmentForm.embedMode ===
                            EmbedMode.EXISTING_PAGE &&
                            !pageEmbedmentForm.selectedPage.external_id)
                    }
                    onClick={handleEmbed}
                >
                    {MODAL_LABELS.EMBED}
                </Button>
            </ModalActionsFooter>
        </Modal>
    )
}

export default ContactFormAutoEmbedModalAssistant
