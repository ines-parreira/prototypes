import { useQueryClient } from '@tanstack/react-query'
import { get } from 'lodash'
import _noop from 'lodash/noop'
import { useHistory } from 'react-router-dom'

import { LegacyButton as Button } from '@gorgias/axiom'

import useAppDispatch from 'hooks/useAppDispatch'
import type { CreateShopifyPageEmbedmentDto } from 'models/contactForm/types'
import Modal from 'pages/common/components/modal/Modal'
import ModalActionsFooter from 'pages/common/components/modal/ModalActionsFooter'
import ModalHeader from 'pages/common/components/modal/ModalHeader'
import type { EmbeddablePage } from 'pages/common/components/PageEmbedmentForm'
import PageEmbedmentForm, {
    EmbedMode,
    SHOPIFY_PAGE_EMBEDMENT_PATH_PREFIX,
    usePageEmbedmentForm,
} from 'pages/common/components/PageEmbedmentForm'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

import {
    HELP_CENTER_BASE_PATH,
    HELP_CENTER_EMBED_FORM_TEXTS,
} from '../../constants'
import {
    helpCenterPageEmbedmentsKeys,
    useCreatePageEmbedment,
} from '../../queries'
import { MODAL_LABELS } from './constants'

import css from './HelpCenterAutoEmbedModalAssistant.less'

type HelpCenterAutoEmbedModalAssistantProps = {
    isOpen: boolean
    onClose: () => void
    pages: EmbeddablePage[]
    helpCenterId: number
}

/**
 * This is a modal that guides the merchant through the process of embedding the help center  on their Website pages.
 */
const HelpCenterAutoEmbedModalAssistant = (
    {
        onClose,
        isOpen,
        pages,
        helpCenterId,
    }: HelpCenterAutoEmbedModalAssistantProps = {
        isOpen: false,
        onClose: _noop,
        pages: [],
        helpCenterId: 0,
    },
) => {
    const {
        state: pageEmbedmentForm,
        dispatch: pageEmbedmentFormDispatch,
        reset: resetPageEmbedmentForm,
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
                    }),
                )
                return
            }

            void appDispatch(
                notify({
                    message: 'Help Center embedded to page.',
                    status: NotificationStatus.Success,
                }),
            )

            await queryClient.invalidateQueries(
                helpCenterPageEmbedmentsKeys.all(helpCenterId),
            )

            history.push(
                `${HELP_CENTER_BASE_PATH}/${helpCenterId}/publish-track/embedments`,
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
                }),
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
            { help_center_id: helpCenterId },
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
                pageNamePlaceholder={
                    HELP_CENTER_EMBED_FORM_TEXTS.PageNamePlaceholder
                }
                pageSlugPlaceholder={
                    HELP_CENTER_EMBED_FORM_TEXTS.PageSlugPlaceholder
                }
                tooltipText={HELP_CENTER_EMBED_FORM_TEXTS.TooltipText}
                dispatch={pageEmbedmentFormDispatch}
                state={pageEmbedmentForm}
                shopifyPages={pages}
            />
            <ModalActionsFooter>
                <Button intent="secondary" onClick={handleOnClose}>
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

export default HelpCenterAutoEmbedModalAssistant
