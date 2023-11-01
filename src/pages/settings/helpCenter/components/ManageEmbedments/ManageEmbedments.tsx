import React, {useState, useEffect} from 'react'
import classNames from 'classnames'
import _upperFirst from 'lodash/upperFirst'
import {useQueryClient} from '@tanstack/react-query'
import {useHistory, Link} from 'react-router-dom'

import {SegmentEvent, logEvent} from 'common/segment'
import {
    PageEmbedmentPosition,
    EmbeddablePage,
} from 'pages/common/components/PageEmbedmentForm'
import {HelpCenterPageEmbedment} from 'models/helpCenter/types'
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
import {
    helpCenterPageEmbedmentsKeys,
    useUpdatePageEmbedment,
    useDeletePageEmbedment,
    useGetShopifyPages,
} from 'pages/settings/helpCenter/queries'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import useAppDispatch from 'hooks/useAppDispatch'
import {CONTACT_FORM_EMBEDMENTS_LIMIT} from 'pages/settings/contactForm/constants'
import IconButton from 'pages/common/components/button/IconButton'
import ConfirmationPopover from 'pages/common/components/popover/ConfirmationPopover'
import PendingChangesModal from 'pages/settings/helpCenter/components/PendingChangesModal'
import useAppSelector from 'hooks/useAppSelector'
import {getCurrentAccountState} from 'state/currentAccount/selectors'
import {getCurrentUser} from 'state/currentUser/selectors'
import HelpCenterAutoEmbedModalAssistant from '../HelpCenterAutoEmbedModalAssistant'
import {HELP_CENTER_BASE_PATH} from '../../constants'
import css from './ManageEmbedments.less'

type ManageEmbedmentsProps = {
    embedments: HelpCenterPageEmbedment[]
    isEmbedmentsLoading: boolean
    helpCenterId: number
    shopName: string | null
}

const PositionOptions = Object.values(PageEmbedmentPosition).map(
    (position) => ({
        value: position,
        label: _upperFirst(position.toLowerCase()),
    })
)

const resetDraftPositions = (
    embedments: HelpCenterPageEmbedment[]
): Record<number, PageEmbedmentPosition> =>
    embedments.reduce(
        (acc, embedment) => ({
            ...acc,
            [embedment.id]: embedment.position ?? PageEmbedmentPosition.TOP,
        }),
        {}
    )

const ManageEmbedments = ({
    embedments,
    isEmbedmentsLoading,
    helpCenterId,
    shopName,
}: ManageEmbedmentsProps): JSX.Element | null => {
    const appDispatch = useAppDispatch()
    const currentUser = useAppSelector(getCurrentUser)
    const currentAccount = useAppSelector(getCurrentAccountState)
    const history = useHistory()
    const queryClient = useQueryClient()
    const [isEmbedModalOpen, setIsEmbedModalOpen] = useState(false)
    const [isChangesModalShown, setIsChangesModalShown] = useState(false)
    const [draftPositions, setDraftPositions] = useState<
        Record<string, PageEmbedmentPosition>
    >(() => resetDraftPositions(embedments))
    const [embedmentIdToDelete, setEmbedmentIdToDelete] = useState<
        number | null
    >(null)

    useEffect(() => {
        // If there are no embedments, redirect to the publish page
        if (embedments.length || isEmbedmentsLoading) return

        history.push(`${HELP_CENTER_BASE_PATH}/${helpCenterId}/publish-track`)
    }, [embedments.length, isEmbedmentsLoading, helpCenterId, history])

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
                    message: 'Help Center position updated',
                    status: NotificationStatus.Success,
                })
            )

            await queryClient.invalidateQueries(
                helpCenterPageEmbedmentsKeys.lists(helpCenterId)
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
                    message: 'Help Center removed from page.',
                    status: NotificationStatus.Success,
                })
            )

            await queryClient.invalidateQueries(
                helpCenterPageEmbedmentsKeys.lists(helpCenterId)
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

    const getShopifyPages = useGetShopifyPages(helpCenterId, {
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
                help_center_id: helpCenterId,
                embedment_id: embedmentId,
            },
        ])
        setEmbedmentIdToDelete(null)
    }

    const onSave = async () => {
        if (updatePageEmbedmentMutation.isLoading) return
        const embedmentsToUpdate = embedments.filter((embedment) => {
            return embedment.position !== draftPositions[embedment.id]
        })

        for (const embedment of embedmentsToUpdate) {
            const newPosition = draftPositions[embedment.id]
            const pageEmbedment = await updatePageEmbedmentMutation.mutateAsync(
                [
                    undefined,
                    {
                        help_center_id: helpCenterId,
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
        (embedment) =>
            embedment.id &&
            embedment.position &&
            draftPositions[embedment.id] !== embedment.position
    )

    return (
        <div className={contactFormCss.mtXl}>
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
                    Edit the position of your Help Center or remove it from the
                    page where it's currently embedded.
                    <br />
                    Note: Please allow a few minutes for the embed to reflect on
                    your Shopify page. Manually embedded pages will not appear
                    in this list.
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
                                    <br /> Help Center anywhere other than
                                    <br /> top or bottom, add{' '}
                                    <Link
                                        to={`${HELP_CENTER_BASE_PATH}/${helpCenterId}/publish-track`}
                                    >
                                        HTML <br /> code
                                    </Link>{' '}
                                    on the page instead.
                                </span>
                            }
                            title="Help Center position"
                        />
                        <HeaderCell />
                    </TableHead>
                    <TableBody>
                        {embedments.map(
                            (embedment: HelpCenterPageEmbedment) => {
                                const previewLink = shopName
                                    ? `https://${shopName}.myshopify.com/${
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
                                                data-testid={`position-select-${embedment.id}`}
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
                                                        Removing the Help center
                                                        from this page cannot be
                                                        undone. You can re-embed
                                                        it again later.
                                                    </>
                                                }
                                                onConfirm={onDelete(
                                                    embedment.id
                                                )}
                                                placement="bottom"
                                                title={
                                                    <b>
                                                        Remove embed from page?
                                                    </b>
                                                }
                                                confirmLabel={'Remove Embed'}
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
                            SegmentEvent.HelpCenterAutoEmbedEmbedOnAnotherPageClicked,
                            {
                                user_id: currentUser.get('id'),
                                account_domain: currentAccount.get('domain'),
                                help_center_id: helpCenterId,
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

            <HelpCenterAutoEmbedModalAssistant
                isOpen={isEmbedModalOpen}
                onClose={() => setIsEmbedModalOpen(false)}
                pages={availablePages}
                helpCenterId={helpCenterId}
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
