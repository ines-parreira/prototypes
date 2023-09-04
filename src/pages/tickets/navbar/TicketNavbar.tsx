import _debounce from 'lodash/debounce'
import React, {useCallback, useEffect, useMemo, useState} from 'react'
import {connect, ConnectedProps} from 'react-redux'
import {useHistory, useParams} from 'react-router-dom'
import {useAsyncFn} from 'react-use'
import {DropTargetMonitor} from 'react-dnd'

import GorgiasApi from 'services/gorgiasApi'
import useAutoScrollOnDragging from 'pages/common/hooks/useAutoScrollOnDragging'
import {TicketNavbarElementType} from 'state/ui/ticketNavbar/types'
import {tryLocalStorage} from 'services/common/utils'

import {
    UserRole,
    UserSetting,
    UserSettingType,
    UserViewsOrderingSettingData,
} from 'config/types/user'
import useSearch from 'hooks/useSearch'
import {createAccountSetting, updateAccountSetting} from 'models/account'
import {
    fetchSections,
    updateSection,
    createSection,
    deleteSection,
} from 'models/section/resources'
import {Section, SectionDraft} from 'models/section/types'
import {createUserSetting, updateUserSetting} from 'models/user/resources'
import {fetchViewsPaginated, updateView} from 'models/view/resources'
import {View, ViewCategoryNavbar, ViewVisibility} from 'models/view/types'
import NavbarBlock from 'pages/common/components/navbar/NavbarBlock'
import Navbar from 'pages/common/components/Navbar'
import RecentChats from 'pages/common/components/RecentChats'
import shortcutManager from 'services/shortcutManager/shortcutManager'

import {submitSettingSuccess as submitAccountSettingSuccess} from 'state/currentAccount/actions'
import {
    AccountSetting,
    AccountSettingType,
    AccountViewsOrderingSettingData,
} from 'state/currentAccount/types'
import {submitSettingSuccess} from 'state/currentUser/actions'
import {getViewsOrderingSetting} from 'state/currentAccount/selectors'
import {getViewsOrderingUserSetting} from 'state/currentUser/selectors'
import {
    sectionUpdated,
    sectionCreated,
    sectionsFetched,
    sectionDeleted,
} from 'state/entities/sections/actions'
import {viewsFetched, viewUpdated} from 'state/entities/views/actions'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import {RootState} from 'state/types'
import {
    getPrivateTicketNavbarElements,
    getPublicTicketNavbarElements,
} from 'state/ui/ticketNavbar/selectors'
import {activeViewIdSet} from 'state/ui/views/actions'
import {
    optimisticAccountSettingsReset,
    optimisticUserSettingsReset,
} from 'state/ui/ticketNavbar/actions'
import {fetchViewsSuccess} from 'state/views/actions'

import {hasRole} from 'utils'

import DeleteSectionModal from './DeleteSectionModal'
import SectionFormModal from './SectionFormModal'
import TicketNavbarContent, {TicketNavbarElement} from './TicketNavbarContent'
import TicketNavbarDropTarget, {
    TicketNavbarDragObject,
    TicketNavbarDropDirection,
    TicketNavbarDropResult,
} from './TicketNavbarDropTarget'

import css from './TicketNavbar.less'

const viewCategories = {
    public: 'Shared views',
    private: 'Private views',
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
    const params = useParams<{viewId?: string}>()
    const {viewId} = useSearch<{viewId?: string}>()
    const [isSectionFormModalOpened, setSectionFormModalOpened] =
        useState(false)
    const [isDeleteSectionModalOpened, setDeleteSectionModalOpened] =
        useState(false)
    const [isMovingItem, setMovingItem] = useState(false)
    const [sectionForm, setSectionForm] =
        useState<Maybe<SectionDraft & Partial<Section>>>(null)
    const isNewSection = useMemo(
        () => !!sectionForm && sectionForm?.id == null,
        [sectionForm]
    )
    const isAgent = useMemo(
        () => hasRole(currentUser, UserRole.Agent),
        [currentUser]
    )

    useEffect(() => {
        void (async () => {
            try {
                const client = new GorgiasApi()
                const generator = client.cursorPaginate(fetchViewsPaginated)
                let result: View[] = []
                for await (const page of generator) {
                    result = result.concat(page)
                }
                fetchViewsSuccess(
                    {data: result},
                    params.viewId != null ? params.viewId : (viewId as string)
                )
                viewsFetched(result)
            } catch (error) {
                void notify({
                    message: 'Failed to fetch views',
                    status: NotificationStatus.Error,
                })
            }
        })()
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
            updateUrl(
                `/app/tickets/${nextView.id}/${encodeURIComponent(
                    nextView.slug
                )}`
            )
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [activeViewId, allViews]
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    const [{loading: isSubmitting}, handleSectionDraftSubmit] =
        useAsyncFn(async () => {
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
    const [{loading: isDeleting}, handleSectionDelete] =
        useAsyncFn(async () => {
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [accountSetting, userSetting]
    )

    const [categories, setCategories] = useState<ViewCategoryNavbar[]>(() => {
        const viewCategories = window.localStorage.getItem('viewCategories')

        if (!viewCategories) {
            return [ViewVisibility.Public, ViewVisibility.Private]
        }
        return JSON.parse(viewCategories) as ViewCategoryNavbar[]
    })

    const handleCategoryDrop = useCallback(
        (item: TicketNavbarDragObject, monitor: DropTargetMonitor) => {
            const {categoryId, direction} =
                monitor.getDropResult() as TicketNavbarDropResult
            const id = item.id as ViewCategoryNavbar
            let categories: ViewCategoryNavbar[]
            if (categoryId === item.id) {
                return
            } else if (direction === TicketNavbarDropDirection.Up) {
                categories = [id, categoryId!]
            } else {
                categories = [categoryId!, id]
            }
            tryLocalStorage(() =>
                window.localStorage.setItem(
                    'viewCategories',
                    JSON.stringify(categories)
                )
            )
            setCategories(categories)
        },
        []
    )

    const {scrollableAreaRef} = useAutoScrollOnDragging()

    return (
        <Navbar activeContent="tickets" navbarContentRef={scrollableAreaRef}>
            <RecentChats />
            {categories.map((category) => (
                <TicketNavbarDropTarget
                    type={TicketNavbarElementType.Category}
                    key={category}
                    accept={TicketNavbarElementType.Category}
                    canDrop={(item) =>
                        item.type === TicketNavbarElementType.Category
                    }
                    onDrop={handleCategoryDrop}
                >
                    <NavbarBlock
                        actions={
                            (category === 'public' && isAgent) ||
                            category === 'private'
                                ? [
                                      {
                                          label: 'Create view',
                                          onClick: () =>
                                              history.push(
                                                  `/app/tickets/new/${category}`
                                              ),
                                      },
                                      {
                                          label: 'Create section',
                                          onClick: () =>
                                              handleCreateSectionClick(
                                                  category === 'private'
                                              ),
                                      },
                                  ]
                                : undefined
                        }
                        title={viewCategories[category]}
                        value={category}
                        className={css.navbarBlock}
                    >
                        <TicketNavbarContent
                            {...((category === 'public' && isAgent) ||
                            category === 'private'
                                ? {
                                      onSectionDeleteClick:
                                          handleSectionDeleteClick,
                                      onSectionRenameClick:
                                          handleSectionRenameClick,
                                  }
                                : {})}
                            elements={
                                category === 'public'
                                    ? sharedElements
                                    : privateElements
                            }
                            isMovingItem={isMovingItem}
                            onSubmitMoveItem={handleSubmitMoveItem}
                            isPrivate={category === 'private'}
                        />
                    </NavbarBlock>
                </TicketNavbarDropTarget>
            ))}
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
    )
}

const connector = connect(
    (state: RootState) => ({
        activeViewId: state.ui.views.activeViewId,
        currentUser: state.currentUser,
        sections: state.entities.sections,
        privateElements: getPrivateTicketNavbarElements(state),
        sharedElements: getPublicTicketNavbarElements(state),
        userSetting: getViewsOrderingUserSetting(state),
        accountSetting: getViewsOrderingSetting(state),
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
