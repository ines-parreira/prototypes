import _debounce from 'lodash/debounce'
import React, {useEffect, useMemo, useCallback, useState} from 'react'
import {connect, ConnectedProps} from 'react-redux'
import {useHistory, useLocation, useParams} from 'react-router-dom'
import {useAsyncFn} from 'react-use'
import {parse} from 'query-string'

import {
    UserRole,
    UserSetting,
    UserSettingType,
    UserViewsOrderingSettingData,
} from '../../../config/types/user'
import {
    fetchSections,
    updateSection,
    createSection,
    deleteSection,
} from '../../../models/section/resources'
import {SectionDraft, Section} from '../../../models/section/types'
import {fetchViews, updateView} from '../../../models/view/resources'
import {ViewVisibility, View} from '../../../models/view/types'
import shortcutManager from '../../../services/shortcutManager/shortcutManager'
import {
    sectionUpdated,
    sectionCreated,
    sectionsFetched,
    sectionDeleted,
} from '../../../state/entities/sections/actions'
import {viewsFetched, viewUpdated} from '../../../state/entities/views/actions'
import {getTicketNavbarElements} from '../../../state/ui/ticketNavbar/selectors'
import {notify} from '../../../state/notifications/actions'
import {NotificationStatus} from '../../../state/notifications/types'
import {RootState} from '../../../state/types'
import {activeViewIdSet} from '../../../state/ui/views/actions'
import {fetchViewsSuccess} from '../../../state/views/actions'
import {hasRole} from '../../../utils'
import Navbar from '../../common/components/Navbar.js'
import NavbarBlock from '../../common/components/navbar/NavbarBlock'
import RecentChats from '../../common/components/RecentChats.js'
import {
    optimisticAccountSettingsReset,
    optimisticUserSettingsReset,
} from '../../../state/ui/ticketNavbar/actions'
import {
    createUserSetting,
    updateUserSetting,
} from '../../../models/user/resources'
import {submitSettingSuccess} from '../../../state/currentUser/actions'
import {getUserSetting} from '../../../state/currentUser/selectors'
import {
    AccountSetting,
    AccountSettingType,
    AccountViewsOrderingSettingData,
} from '../../../state/currentAccount/types'
import {getSettingsByType} from '../../../state/currentAccount/selectors'
import {
    createAccountSetting,
    updateAccountSetting,
} from '../../../models/account'
import {submitSettingSuccess as submitAccountSettingSuccess} from '../../../state/currentAccount/actions'

import DeleteSectionModal from './DeleteSectionModal'
import SectionFormModal from './SectionFormModal'
import TicketNavbarContent, {TicketNavbarElement} from './TicketNavbarContent'

export enum TicketNavbarElementType {
    View = 'view',
    Section = 'section',
}

export function TicketNavbarContainer({
    activeViewId,
    activeViewIdSet,
    currentUser,
    fetchViewsSuccess,
    notify,
    optimisticAccountSettingsReset,
    optimisticUserSettingsReset,
    sectionCreated,
    sectionDeleted,
    sectionUpdated,
    sections,
    sectionsFetched,
    viewsFetched,
    privateElements,
    sharedElements,
    viewUpdated,
    accountSetting,
    userSetting,
    submitSettingSuccess,
}: ConnectedProps<typeof connector>) {
    const history = useHistory()
    const location = useLocation()
    const params = useParams<{viewId?: string}>()
    const [isSectionFormModalOpened, setSectionFormModalOpened] = useState(
        false
    )
    const [isDeleteSectionModalOpened, setDeleteSectionModalOpened] = useState(
        false
    )
    const [isMovingItem, setMovingItem] = useState(false)
    const [sectionForm, setSectionForm] = useState<
        Maybe<SectionDraft & Partial<Section>>
    >(null)
    const isNewSection = useMemo(
        () => !!sectionForm && sectionForm?.id == null,
        [sectionForm]
    )
    const isAgent = useMemo(() => hasRole(currentUser, UserRole.Agent), [
        currentUser,
    ])

    useEffect(() => {
        void (async () => {
            try {
                const res = await fetchViews()
                fetchViewsSuccess(
                    res,
                    params.viewId != null
                        ? params.viewId
                        : (parse(location.search).viewId as string)
                )
                viewsFetched(res.data)
            } catch (error) {
                void notify({
                    message: 'Failed to fetch views',
                    status: NotificationStatus.Error,
                })
            }
        })()
    }, [])

    useEffect(() => {
        void (async () => {
            try {
                const res = await fetchSections()
                sectionsFetched(res.data)
            } catch (error) {
                void notify({
                    message: 'Failed to fetch sections',
                    status: NotificationStatus.Error,
                })
            }
        })()
    }, [])

    const allViews = useMemo(
        () =>
            [...sharedElements, ...privateElements].reduce(
                (acc, element) =>
                    acc.concat(
                        element.type === TicketNavbarElementType.View
                            ? [element.data]
                            : element.children
                    ),
                [] as View[]
            ),
        [sharedElements, privateElements]
    )

    const moveCursor = useCallback(
        (direction: 'next' | 'prev') => {
            const currentIndex = allViews.findIndex(
                (view) => view.id === activeViewId
            )

            if (currentIndex === -1) {
                return
            }
            const nextIndex = currentIndex + (direction === 'next' ? 1 : -1)
            const nextView =
                nextIndex >= allViews.length
                    ? allViews[0]
                    : nextIndex < 0
                    ? allViews[allViews.length - 1]
                    : allViews[nextIndex]

            activeViewIdSet(nextView.id)
            updateUrl(`/app/tickets/${nextView.id}/${nextView.slug}`)
        },
        [activeViewId, allViews]
    )
    const updateUrl = useCallback(
        _debounce((viewUrl: string) => history.push(viewUrl)),
        []
    )
    useEffect(() => {
        shortcutManager.bind('ViewNavbar', {
            GO_NEXT_VIEW: {
                action: () => {
                    moveCursor('next')
                },
            },
            GO_PREV_VIEW: {
                action: () => {
                    moveCursor('prev')
                },
            },
        })
        return () => {
            shortcutManager.unbind('ViewNavbar')
        }
    }, [moveCursor])

    const handleCreateSectionClick = useCallback(
        (isPrivate: boolean) => {
            setSectionFormModalOpened(true)
            setSectionForm({
                name: '',
                private: isPrivate,
            })
        },
        [setSectionFormModalOpened, setSectionForm]
    )
    const handleSectionRenameClick = useCallback(
        (sectionId: number) => {
            setSectionFormModalOpened(true)
            setSectionForm(sections[sectionId])
        },
        [setSectionFormModalOpened, setSectionForm, sections]
    )
    const handleSectionDeleteClick = useCallback(
        (sectionId: number) => {
            setDeleteSectionModalOpened(true)
            setSectionForm(sections[sectionId])
        },
        [setDeleteSectionModalOpened, setSectionForm, sections]
    )
    const handleSectionModalClose = useCallback(() => {
        setSectionFormModalOpened(false)
        setSectionForm(null)
    }, [setSectionFormModalOpened, setSectionForm])
    const handleDeleteSectionModalClose = useCallback(() => {
        setDeleteSectionModalOpened(false)
        setSectionForm(null)
    }, [setDeleteSectionModalOpened, setSectionForm])
    const handleSectionDraftChange = useCallback(
        <T extends keyof SectionDraft>(name: T, value: SectionDraft[T]) => {
            if (!sectionForm) {
                return
            }
            setSectionForm({
                ...sectionForm,
                [name]: value,
            })
        },
        [sectionForm]
    )
    const [
        {loading: isSubmitting},
        handleSectionDraftSubmit,
    ] = useAsyncFn(async () => {
        if (!sectionForm) {
            return
        }

        try {
            const res = isNewSection
                ? await createSection(sectionForm)
                : await updateSection(sectionForm as Section)
            if (isNewSection) {
                sectionCreated(res)
            } else {
                sectionUpdated(res)
            }
            handleSectionModalClose()
        } catch (error) {
            void notify({
                message: `Failed to ${
                    isNewSection ? 'create' : 'update'
                } section`,
                status: NotificationStatus.Error,
            })
        }
    }, [sectionForm, isNewSection])
    const [
        {loading: isDeleting},
        handleSectionDelete,
    ] = useAsyncFn(async () => {
        if (!sectionForm || sectionForm.id == null) {
            return
        }

        try {
            await deleteSection(sectionForm.id)
            sectionDeleted(sectionForm.id)
            handleDeleteSectionModalClose()
        } catch (error) {
            void notify({
                message: 'Failed to delete the section',
                status: NotificationStatus.Error,
            })
        }
    }, [sectionForm])

    const handleSubmitMoveItem = useCallback(
        async (
            nextElement: TicketNavbarElement,
            currentElement: TicketNavbarElement,
            nextSettingData:
                | AccountViewsOrderingSettingData
                | UserViewsOrderingSettingData,
            isPrivateSetting: boolean
        ) => {
            setMovingItem(true)
            if (
                currentElement.type === TicketNavbarElementType.View &&
                nextElement.type === TicketNavbarElementType.View &&
                nextElement.data.section_id !== currentElement.data.section_id
            ) {
                try {
                    const res = await updateView(nextElement.data.id, {
                        section_id: nextElement.data.section_id,
                    })
                    viewUpdated(res)
                } catch (error) {
                    void notify({
                        message: 'Failed to add the view to the section',
                        status: NotificationStatus.Error,
                    })
                    viewUpdated(currentElement.data)
                    setMovingItem(false)
                    return
                }
            }
            try {
                if (isPrivateSetting) {
                    const resp = await (userSetting
                        ? updateUserSetting({
                              ...userSetting,
                              data: nextSettingData,
                          } as UserSetting)
                        : createUserSetting({
                              type: UserSettingType.ViewsOrdering,
                              data: nextSettingData,
                          }))
                    submitSettingSuccess(resp.data, !!userSetting)
                } else {
                    const resp = await (accountSetting.id
                        ? updateAccountSetting({
                              ...accountSetting,
                              data: nextSettingData,
                          } as AccountSetting)
                        : createAccountSetting({
                              type: AccountSettingType.ViewsOrdering,
                              data: nextSettingData,
                          }))
                    submitAccountSettingSuccess(resp.data, !!accountSetting)
                }
            } catch (error) {
                void notify({
                    message: 'Failed to change order',
                    status: NotificationStatus.Error,
                })
            } finally {
                isPrivateSetting
                    ? optimisticUserSettingsReset()
                    : optimisticAccountSettingsReset()
                setMovingItem(false)
            }
        },
        [accountSetting, userSetting]
    )

    return (
        <>
            {/*$TsFixMe remove once Navbar is migrated*/}
            {/*@ts-ignore*/}
            <Navbar activeContent="tickets">
                <RecentChats />
                <NavbarBlock
                    actions={
                        isAgent
                            ? [
                                  {
                                      label: 'Create view',
                                      onClick: () =>
                                          history.push(
                                              '/app/tickets/new/public'
                                          ),
                                  },
                                  {
                                      label: 'Create section',
                                      onClick: () =>
                                          handleCreateSectionClick(false),
                                  },
                              ]
                            : []
                    }
                    title="Shared views"
                >
                    <TicketNavbarContent
                        {...(isAgent
                            ? {
                                  onSectionDeleteClick: handleSectionDeleteClick,
                                  onSectionRenameClick: handleSectionRenameClick,
                              }
                            : {})}
                        elements={sharedElements}
                        isMovingItem={isMovingItem}
                        onSubmitMoveItem={handleSubmitMoveItem}
                    />
                </NavbarBlock>
                <NavbarBlock
                    actions={[
                        {
                            label: 'Create view',
                            onClick: () =>
                                history.push('/app/tickets/new/private'),
                        },
                        {
                            label: 'Create section',
                            onClick: () => handleCreateSectionClick(true),
                        },
                    ]}
                    title="Private views"
                >
                    <TicketNavbarContent
                        elements={privateElements}
                        isMovingItem={isMovingItem}
                        isPrivate
                        onSectionDeleteClick={handleSectionDeleteClick}
                        onSectionRenameClick={handleSectionRenameClick}
                        onSubmitMoveItem={handleSubmitMoveItem}
                    />
                </NavbarBlock>

                <SectionFormModal
                    isNewSection={isNewSection}
                    isOpen={isSectionFormModalOpened}
                    isSubmitting={isSubmitting}
                    onChange={handleSectionDraftChange}
                    onClose={handleSectionModalClose}
                    onSubmit={handleSectionDraftSubmit}
                    sectionForm={sectionForm}
                />

                <DeleteSectionModal
                    isOpen={isDeleteSectionModalOpened}
                    isSubmitting={isDeleting}
                    onClose={handleDeleteSectionModalClose}
                    onSubmit={handleSectionDelete}
                    section={sectionForm as Maybe<Section>}
                />
            </Navbar>
        </>
    )
}

const connector = connect(
    (state: RootState) => ({
        activeViewId: state.ui.views.activeViewId,
        currentUser: state.currentUser,
        sections: state.entities.sections,
        privateElements: getTicketNavbarElements(ViewVisibility.Private)(state),
        sharedElements: getTicketNavbarElements(ViewVisibility.Public)(state),
        userSetting: getUserSetting(UserSettingType.ViewsOrdering)(state),
        accountSetting: getSettingsByType(AccountSettingType.ViewsOrdering)(
            state
        ).toJS() as AccountSetting,
    }),
    {
        activeViewIdSet,
        fetchViewsSuccess,
        notify,
        optimisticAccountSettingsReset,
        optimisticUserSettingsReset,
        sectionCreated,
        sectionDeleted,
        sectionUpdated,
        sectionsFetched,
        submitSettingSuccess,
        viewsFetched,
        viewUpdated,
    }
)

export default connector(TicketNavbarContainer)
