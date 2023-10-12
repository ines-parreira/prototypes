import React, {useState, useEffect} from 'react'
import classNames from 'classnames'
import _upperFirst from 'lodash/upperFirst'
import {useQueryClient} from '@tanstack/react-query'
import {useHistory, Link} from 'react-router-dom'
import {EmbeddablePage} from 'pages/common/components/PageEmbedmentForm/types'
import {ContactFormPageEmbedment} from 'models/contactForm/types'
import TableHead from 'pages/common/components/table/TableHead'
import HeaderCellProperty from 'pages/common/components/table/cells/HeaderCellProperty'
import HeaderCell from 'pages/common/components/table/cells/HeaderCell'
import TableBody from 'pages/common/components/table/TableBody'
import TableWrapper from 'pages/common/components/table/TableWrapper'
import TableBodyRow from 'pages/common/components/table/TableBodyRow'
import BodyCell from 'pages/common/components/table/cells/BodyCell'
import contactFormCss from 'pages/settings/contactForm/contactForm.less'
import Button from 'pages/common/components/button/Button'
import SelectField from 'pages/common/forms/SelectField/SelectField'
import {PageEmbedmentPosition} from 'pages/common/components/PageEmbedmentForm'
import settingsCss from 'pages/settings/settings.less'
import {useCurrentContactForm} from 'pages/settings/contactForm/hooks/useCurrentContactForm'
import {
    contactFormPageEmbedmentsKeys,
    useUpdatePageEmbedment,
    useDeletePageEmbedment,
    useGetShopifyPages,
} from 'pages/settings/contactForm/queries'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import useAppDispatch from 'hooks/useAppDispatch'
import ContactFormAutoEmbedModalAssistant from 'pages/settings/contactForm/components/ContactFormAutoEmbedModalAssistant'
import {
    CONTACT_FORM_EMBEDMENTS_LIMIT,
    CONTACT_FORM_PUBLISH_PATH,
} from 'pages/settings/contactForm/constants'
import {insertContactFormIdParam} from 'pages/settings/contactForm/utils/navigation'
import IconButton from 'pages/common/components/button/IconButton'
import ConfirmationPopover from 'pages/common/components/popover/ConfirmationPopover'
import PendingChangesModal from 'pages/settings/helpCenter/components/PendingChangesModal'
import {SegmentEvent, logEvent} from 'store/middlewares/segmentTracker'
import useAppSelector from 'hooks/useAppSelector'
import {getCurrentAccountState} from 'state/currentAccount/selectors'
import {getCurrentUser} from 'state/currentUser/selectors'
import {useIsShopifyCredentialsWorking} from 'pages/settings/contactForm/hooks/useIsShopifyCredentialsWorking'
import css from './ManageEmbedments.less'

type ManageEmbedmentsProps = {
    embedments: ContactFormPageEmbedment[]
}

const PositionOptions = Object.values(PageEmbedmentPosition).map(
    (position) => ({
        value: position,
        label: _upperFirst(position.toLowerCase()),
    })
)

const resetDraftPositions = (
    embedments: ContactFormPageEmbedment[]
): Record<number, PageEmbedmentPosition> =>
    embedments.reduce(
        (acc, e) => ({
            ...acc,
            [e.id]: e.position ?? PageEmbedmentPosition.TOP,
        }),
        {}
    )

const ManageEmbedments = ({
    embedments,
}: ManageEmbedmentsProps): JSX.Element | null => {
    const appDispatch = useAppDispatch()
    const currentUser = useAppSelector(getCurrentUser)
    const currentAccount = useAppSelector(getCurrentAccountState)
    const history = useHistory()
    const queryClient = useQueryClient()
    const [isEmbedModalOpen, setIsEmbedModalOpen] = useState(false)
    const [isChangesModalShown, setIsChangesModalShown] = useState(false)
    const contactForm = useCurrentContactForm()
    const [draftPositions, setDraftPositions] = useState<
        Record<string, PageEmbedmentPosition>
    >(() => resetDraftPositions(embedments))
    const [embedmentIdToDelete, setEmbedmentIdToDelete] = useState<
        number | null
    >(null)

    const {isWorking, isLoading} = useIsShopifyCredentialsWorking()

    useEffect(() => {
        if ((!isWorking && !isLoading) || !embedments.length) {
            history.push(
                insertContactFormIdParam(
                    CONTACT_FORM_PUBLISH_PATH,
                    contactForm.id
                )
            )
        }
    }, [embedments.length, history, contactForm, isWorking, isLoading])

    useEffect(() => {
        setDraftPositions({
            ...resetDraftPositions(embedments),
            ...draftPositions,
        })
        // eslint-disable-next-line
    }, [embedments])

    const updatePageEmbedmentMutation = useUpdatePageEmbedment({
        onSuccess: async (updatedPageEmbedment) => {
            if (!updatedPageEmbedment) {
                return void appDispatch(
                    notify({message: 'Something went wrong'})
                )
            }

            void appDispatch(
                notify({
                    message: 'Form position updated',
                    status: NotificationStatus.Success,
                })
            )

            await queryClient.invalidateQueries(
                contactFormPageEmbedmentsKeys.lists(contactForm.id)
            )
        },
        onError: () => {
            void appDispatch(
                notify({
                    message: 'Something went wrong',
                    status: NotificationStatus.Error,
                })
            )
        },
    })

    const deletePageEmbedmentMutation = useDeletePageEmbedment({
        onSuccess: async () => {
            void appDispatch(
                notify({
                    message: 'Form removed from page.',
                    status: NotificationStatus.Success,
                })
            )

            await queryClient.invalidateQueries(
                contactFormPageEmbedmentsKeys.lists(contactForm.id)
            )
        },
        onError: () => {
            void appDispatch(
                notify({
                    message: 'Something went wrong',
                    status: NotificationStatus.Error,
                })
            )
        },
    })

    const getShopifyPages = useGetShopifyPages(contactForm.id, {
        enabled: isEmbedModalOpen,
    })
    const pages: EmbeddablePage[] = getShopifyPages.data ?? []
    const availablePages = pages.filter((page) =>
        embedments.every(
            (pageEmbedment) =>
                pageEmbedment.page_external_id !== page.external_id
        )
    )

    const onPositionChange = (
        embedmentId: number,
        newPosition: PageEmbedmentPosition
    ) => {
        setDraftPositions({...draftPositions, [embedmentId]: newPosition})
    }

    const onDelete = (embedmentId: number) => async () => {
        setEmbedmentIdToDelete(embedmentId)
        await deletePageEmbedmentMutation.mutateAsync([
            undefined,
            {
                contact_form_id: contactForm.id,
                embedment_id: embedmentId,
            },
        ])
        setEmbedmentIdToDelete(null)
    }

    const onSave = async () => {
        if (updatePageEmbedmentMutation.isLoading) return
        const embedmentsToUpdate = embedments.filter((e) => {
            return e.position !== draftPositions[e.id]
        })

        for (const embedment of embedmentsToUpdate) {
            const newPosition = draftPositions[embedment.id]
            const pageEmbedment = await updatePageEmbedmentMutation.mutateAsync(
                [
                    undefined,
                    {
                        contact_form_id: contactForm.id,
                        embedment_id: embedment.id,
                    },
                    {position: newPosition},
                ]
            )

            if (pageEmbedment) {
                setDraftPositions({
                    ...draftPositions,
                    [embedment.id]: newPosition,
                })
            }
        }
    }

    const handleOnCancel = () => {
        setDraftPositions(resetDraftPositions(embedments))
    }

    const isDirty = embedments.some(
        (e) => e.id && e.position && draftPositions[e.id] !== e.position
    )

    if (!contactForm) return null

    return (
        <div
            className={classNames(
                contactFormCss.mtXl,
                settingsCss.contentWrapper
            )}
        >
            <section className={contactFormCss.mbM}>
                <h2
                    className={classNames(
                        contactFormCss.sectionTitle,
                        contactFormCss.mbXxs
                    )}
                >
                    Manage embedded pages
                </h2>
                <div>
                    Edit the position of the contact form or remove it from the
                    page where it's currently embedded.
                    <br />
                    Note: Manually embedded pages will not appear in this list.
                </div>
            </section>

            <section>
                <TableWrapper>
                    <TableHead>
                        <HeaderCellProperty
                            style={{width: '50%'}}
                            title="Page"
                        />
                        <HeaderCellProperty
                            tooltip={
                                <span>
                                    If you want to position the
                                    <br /> form anywhere other than
                                    <br /> top or bottom, add{' '}
                                    <Link
                                        to={insertContactFormIdParam(
                                            CONTACT_FORM_PUBLISH_PATH,
                                            contactForm.id
                                        )}
                                    >
                                        HTML <br /> code
                                    </Link>{' '}
                                    on the page instead.
                                </span>
                            }
                            title="Form Position"
                        />
                        <HeaderCell />
                    </TableHead>
                    <TableBody>
                        {embedments.map(
                            (embedment: ContactFormPageEmbedment) => {
                                const previewLink = contactForm?.shop_name
                                    ? `https://${
                                          contactForm.shop_name
                                      }.myshopify.com/${
                                          embedment.page_path_url.startsWith(
                                              '/'
                                          )
                                              ? embedment.page_path_url.slice(1)
                                              : embedment.page_path_url
                                      }`
                                    : ''

                                return (
                                    <TableBodyRow key={embedment.id}>
                                        <BodyCell
                                            style={{
                                                cursor: 'default',
                                                whiteSpace: 'nowrap',
                                                maxWidth: '100%',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                            }}
                                        >
                                            <b>{embedment.page_title}</b>
                                        </BodyCell>

                                        <BodyCell>
                                            <SelectField
                                                fixedWidth
                                                style={{width: '200px'}}
                                                onChange={(value) =>
                                                    onPositionChange(
                                                        embedment.id,
                                                        value as PageEmbedmentPosition
                                                    )
                                                }
                                                value={
                                                    draftPositions[embedment.id]
                                                }
                                                options={PositionOptions}
                                                aria-label="language selector"
                                            />
                                        </BodyCell>

                                        <BodyCell>
                                            <a
                                                data-testid={`preview-button-${embedment.id}`}
                                                href={previewLink}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                <IconButton
                                                    fillStyle="ghost"
                                                    intent="secondary"
                                                    title="Preview"
                                                >
                                                    open_in_new
                                                </IconButton>
                                            </a>
                                            <ConfirmationPopover
                                                buttonProps={{
                                                    intent: 'destructive',
                                                    size: 'small',
                                                }}
                                                cancelButtonProps={{
                                                    intent: 'secondary',
                                                    size: 'small',
                                                }}
                                                content={
                                                    <>
                                                        Removing the contact
                                                        form from this page
                                                        cannot be undone. You
                                                        can re-embed the form
                                                        again later.
                                                    </>
                                                }
                                                onConfirm={onDelete(
                                                    embedment.id
                                                )}
                                                placement="bottom"
                                                title={
                                                    <b>
                                                        Remove embedded Contact
                                                        Form?
                                                    </b>
                                                }
                                                confirmLabel={'Remove Form'}
                                                showCancelButton
                                            >
                                                {({
                                                    uid,
                                                    onDisplayConfirmation,
                                                    elementRef,
                                                }) => (
                                                    <IconButton
                                                        className={
                                                            contactFormCss.mlXs
                                                        }
                                                        fillStyle="ghost"
                                                        intent="destructive"
                                                        data-testid={`delete-button-${embedment.id}`}
                                                        title={'Remove'}
                                                        name="Remove"
                                                        id={uid}
                                                        isLoading={
                                                            embedment.id ===
                                                                embedmentIdToDelete &&
                                                            deletePageEmbedmentMutation.isLoading
                                                        }
                                                        onClick={
                                                            onDisplayConfirmation
                                                        }
                                                        ref={elementRef}
                                                    >
                                                        delete
                                                    </IconButton>
                                                )}
                                            </ConfirmationPopover>
                                        </BodyCell>
                                    </TableBodyRow>
                                )
                            }
                        )}
                    </TableBody>
                </TableWrapper>
            </section>

            <section className={contactFormCss.mbL}>
                <Button
                    onClick={() => {
                        logEvent(
                            SegmentEvent.ContactFormAutoEmbedEmbedOnAnotherPageClicked,
                            {
                                user_id: currentUser.get('id'),
                                account_domain: currentAccount.get('domain'),
                                contact_form_id: contactForm.id,
                                page_embedments_count: embedments.length,
                            }
                        )
                        setIsEmbedModalOpen(true)
                    }}
                    intent="secondary"
                    isDisabled={
                        embedments.length >= CONTACT_FORM_EMBEDMENTS_LIMIT ||
                        isDirty
                    }
                    className={css.button}
                >
                    <i className="material-icons">add</i>
                    <span>Embed on Another Page</span>
                </Button>
                <div className={contactFormCss.mtXl}>
                    <Button
                        isDisabled={
                            !(isDirty && !updatePageEmbedmentMutation.isLoading)
                        }
                        onClick={onSave}
                    >
                        Save Changes
                    </Button>
                    <Button
                        className={contactFormCss.mlXs}
                        intent="secondary"
                        onClick={handleOnCancel}
                    >
                        Cancel
                    </Button>
                </div>
            </section>

            <ContactFormAutoEmbedModalAssistant
                isOpen={isEmbedModalOpen}
                onClose={() => setIsEmbedModalOpen(false)}
                pages={availablePages}
                contactFormId={contactForm.id}
            />

            <PendingChangesModal
                when={isDirty}
                show={isChangesModalShown}
                onSave={onSave}
                onDiscard={() => setIsChangesModalShown(false)}
                onContinueEditing={() => setIsChangesModalShown(false)}
            />
        </div>
    )
}

export default ManageEmbedments
