import { useCallback, useEffect, useMemo, useState } from 'react'

import { tryLocalStorage } from '@repo/browser-storage'
import { useAsyncFn } from '@repo/hooks'
import {
    NavigationSectionGroup,
    useSidebar,
    useTicketViewNavigationOrderingStore,
} from '@repo/navigation'
import { hasRole, UserRole } from '@repo/permissions'
import { CollapsedDefaultViews } from '@repo/tickets'
import { shortcutManager } from '@repo/utils'
import { syncViewRealtimeEvent, useViewsOrderingCacheSync } from '@repo/views'
import _debounce from 'lodash/debounce'
import type { DropTargetMonitor } from 'react-dnd'
import { useHistory } from 'react-router-dom'

import { Box, Separator, toast } from '@gorgias/axiom'

import type {
    UserSetting,
    UserViewsOrderingSettingData,
} from 'config/types/user'
import { UserSettingType } from 'config/types/user'
import { createAccountSetting, updateAccountSetting } from 'models/account'
import {
    createSection,
    deleteSection,
    updateSection,
} from 'models/section/resources'
import type { Section, SectionDraft } from 'models/section/types'
import { createUserSetting, updateUserSetting } from 'models/user/resources'
import { updateView } from 'models/view/resources'
import type { View, ViewCategoryNavbar } from 'models/view/types'
import { ViewVisibility } from 'models/view/types'
import { InboxSidebarBlock } from 'pages/tickets/navbar/InboxSidebarBlock'
import { TicketNavbarCreateMenu } from 'pages/tickets/navbar/TicketNavbarCreateMenu'
import { useSplitTicketViewSwitcher } from 'split-ticket-view-toggle'
import { submitSettingSuccess as submitAccountSettingSuccess } from 'state/currentAccount/actions'
import type {
    AccountSetting,
    AccountViewsOrderingSettingData,
} from 'state/currentAccount/types'
import { AccountSettingType } from 'state/currentAccount/types'
import type { submitSettingSuccess as submitUserSettingSuccess } from 'state/currentUser/actions'
import type { CurrentUserState } from 'state/currentUser/types'
import type {
    sectionCreated as sectionCreatedAction,
    sectionDeleted as sectionDeletedAction,
    sectionUpdated as sectionUpdatedAction,
} from 'state/entities/sections/actions'
import type { SectionsState } from 'state/entities/sections/types'
import type { viewUpdated as viewUpdatedAction } from 'state/entities/views/actions'
import { TicketNavbarElementType } from 'state/ui/ticketNavbar/types'
import type { activeViewIdSet as activeViewIdSetAction } from 'state/ui/views/actions'

import { ViewCategories } from './constants'
import { DefaultViews } from './DefaultViews'
import DeleteSectionModal from './DeleteSectionModal'
import { RecentChats } from './RecentChats'
import SectionFormModal from './SectionFormModal'
import type { TicketNavbarElement } from './TicketNavbarContent'
import TicketNavbarContentBridge from './TicketNavbarContentBridge'
import type {
    TicketNavbarDragObject,
    TicketNavbarDropResult,
} from './TicketNavbarDropTarget'
import TicketNavbarDropTarget, {
    TicketNavbarDropDirection,
} from './TicketNavbarDropTarget'
import { useWayfindingTicketNavbarData } from './useWayfindingTicketNavbarData'

type TicketNavbarBridgeContainerProps = {
    accountSetting: AccountSetting
    activeViewId: Maybe<number>
    activeViewIdSet: typeof activeViewIdSetAction
    currentUser: CurrentUserState
    sectionCreated: typeof sectionCreatedAction
    sectionDeleted: typeof sectionDeletedAction
    sections: SectionsState
    sectionUpdated: typeof sectionUpdatedAction
    submitSettingSuccess: typeof submitUserSettingSuccess
    userSetting: Maybe<UserSetting>
    viewUpdated: typeof viewUpdatedAction
}

export function TicketNavbarBridgeContainer({
    activeViewId,
    activeViewIdSet,
    currentUser,
    sectionCreated,
    sectionDeleted,
    sectionUpdated,
    sections,
    viewUpdated,
    accountSetting,
    userSetting,
    submitSettingSuccess,
}: TicketNavbarBridgeContainerProps) {
    const history = useHistory()
    const { isCollapsed } = useSidebar()
    const [isSectionFormModalOpened, setSectionFormModalOpened] =
        useState(false)
    const [isDeleteSectionModalOpened, setDeleteSectionModalOpened] =
        useState(false)
    const [isMovingItem, setMovingItem] = useState(false)
    const [sectionForm, setSectionForm] =
        useState<Maybe<SectionDraft & Partial<Section>>>(null)
    const isNewSection = useMemo(
        () => !!sectionForm && sectionForm?.id == null,
        [sectionForm],
    )
    const currentUserRole = currentUser.getIn(['role', 'name']) as
        | UserRole
        | undefined
    const isAgent = useMemo(
        () => hasRole({ role: { name: currentUserRole } }, UserRole.Agent),
        [currentUserRole],
    )
    const resetOptimisticPrivateOrdering = useTicketViewNavigationOrderingStore(
        (state) => state.resetOptimisticPrivateOrdering,
    )
    const resetOptimisticSharedOrdering = useTicketViewNavigationOrderingStore(
        (state) => state.resetOptimisticSharedOrdering,
    )

    useSplitTicketViewSwitcher()

    const handleCreateSectionClick = useCallback(
        (isPrivate: boolean) => {
            setSectionFormModalOpened(true)
            setSectionForm({
                name: '',
                private: isPrivate,
            })
        },
        [setSectionFormModalOpened, setSectionForm],
    )
    const handleSectionRenameClick = useCallback(
        (sectionId: number, section?: Section) => {
            setSectionFormModalOpened(true)
            setSectionForm(section ?? sections[sectionId])
        },
        [setSectionFormModalOpened, setSectionForm, sections],
    )
    const handleSectionDeleteClick = useCallback(
        (sectionId: number, section?: Section) => {
            setDeleteSectionModalOpened(true)
            setSectionForm(section ?? sections[sectionId])
        },
        [setDeleteSectionModalOpened, setSectionForm, sections],
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
        [sectionForm],
    )
    const [{ loading: isSubmitting }, handleSectionDraftSubmit] =
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
                    syncViewRealtimeEvent({
                        type: 'view-section-created',
                        section: res,
                    })
                } else {
                    sectionUpdated(res)
                    syncViewRealtimeEvent({
                        type: 'view-section-updated',
                        section: res,
                    })
                }
                handleSectionModalClose()
            } catch {
                toast.error(
                    `Failed to ${isNewSection ? 'create' : 'update'} section`,
                )
            }
        }, [sectionForm, isNewSection])
    const [{ loading: isDeleting }, handleSectionDelete] =
        useAsyncFn(async () => {
            if (!sectionForm || sectionForm.id == null) {
                return
            }

            try {
                await deleteSection(sectionForm.id)
                sectionDeleted(sectionForm.id)
                syncViewRealtimeEvent({
                    type: 'view-section-deleted',
                    sectionId: sectionForm.id,
                })
                handleDeleteSectionModalClose()
            } catch {
                toast.error('Failed to delete the section')
            }
        }, [sectionForm])
    const { syncViewQueriesForSectionMove, syncViewsOrderingQueryCache } =
        useViewsOrderingCacheSync()

    const handleSubmitMoveItem = useCallback(
        async (
            nextElement: TicketNavbarElement,
            currentElement: TicketNavbarElement,
            nextSettingData:
                | AccountViewsOrderingSettingData
                | UserViewsOrderingSettingData,
            isPrivateSetting: boolean,
        ) => {
            setMovingItem(true)
            if (
                currentElement.type === TicketNavbarElementType.View &&
                nextElement.type === TicketNavbarElementType.View &&
                nextElement.data.section_id !== currentElement.data.section_id
            ) {
                let rollbackViewQueries = () => {}

                try {
                    const viewQueriesSync = await syncViewQueriesForSectionMove(
                        currentElement.data,
                        nextElement.data,
                    )
                    rollbackViewQueries = viewQueriesSync.rollback
                    const res = await updateView(nextElement.data.id, {
                        section_id: nextElement.data.section_id,
                    })
                    viewUpdated(res)
                    viewQueriesSync.invalidate()
                } catch {
                    toast.error('Failed to add the view to the section')
                    rollbackViewQueries()
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
                    syncViewsOrderingQueryCache(
                        nextSettingData,
                        true,
                        resp.data.id,
                    )
                } else {
                    const resp = await (accountSetting.id
                        ? updateAccountSetting({
                              ...accountSetting,
                              data: nextSettingData,
                          } as AccountSetting)
                        : createAccountSetting({
                              type: AccountSettingType.ViewsOrdering,
                              data: nextSettingData as AccountViewsOrderingSettingData,
                          }))
                    submitAccountSettingSuccess(resp.data, !!accountSetting)
                    syncViewsOrderingQueryCache(
                        nextSettingData,
                        false,
                        resp.data.id,
                    )
                }
            } catch {
                toast.error('Failed to change order')
            } finally {
                if (isPrivateSetting) {
                    resetOptimisticPrivateOrdering()
                } else {
                    resetOptimisticSharedOrdering()
                }
                setMovingItem(false)
            }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [
            accountSetting,
            syncViewQueriesForSectionMove,
            syncViewsOrderingQueryCache,
            resetOptimisticPrivateOrdering,
            resetOptimisticSharedOrdering,
            userSetting,
        ],
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
            const { categoryId, direction } =
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
                    JSON.stringify(categories),
                ),
            )
            setCategories(categories)
        },
        [],
    )

    const sectionModals = (
        <>
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
        </>
    )

    if (isCollapsed) {
        return (
            <>
                <TicketNavbarCreateMenu />
                <Separator />
                <Box flexDirection="column" gap="xs">
                    <RecentChats />
                    <CollapsedDefaultViews />
                </Box>
            </>
        )
    }

    return (
        <>
            <TicketNavbarCreateMenu />
            <Box flexDirection="column" gap="xs">
                <RecentChats />
                <DefaultViews />
            </Box>
            <NavigationSectionGroup
                storageKey="inbox-navigation"
                defaultExpandedKeys={Object.keys(ViewCategories)}
            >
                <WayfindingTicketNavbarSections
                    activeViewId={activeViewId}
                    activeViewIdSet={activeViewIdSet}
                    categories={categories}
                    handleCategoryDrop={handleCategoryDrop}
                    handleCreateSectionClick={handleCreateSectionClick}
                    handleSectionDeleteClick={handleSectionDeleteClick}
                    handleSectionRenameClick={handleSectionRenameClick}
                    handleSubmitMoveItem={handleSubmitMoveItem}
                    history={history}
                    isAgent={isAgent}
                    isMovingItem={isMovingItem}
                    viewUpdated={viewUpdated}
                />
            </NavigationSectionGroup>
            {sectionModals}
        </>
    )
}

type WayfindingTicketNavbarSectionsProps = {
    activeViewId: Maybe<number>
    activeViewIdSet: (viewId: number) => void
    categories: ViewCategoryNavbar[]
    handleCategoryDrop: (
        item: TicketNavbarDragObject,
        monitor: DropTargetMonitor,
    ) => void
    handleCreateSectionClick: (isPrivate: boolean) => void
    handleSectionDeleteClick: (sectionId: number, section?: Section) => void
    handleSectionRenameClick: (sectionId: number, section?: Section) => void
    handleSubmitMoveItem: (
        nextElement: TicketNavbarElement,
        currentElement: TicketNavbarElement,
        nextSettingData:
            | AccountViewsOrderingSettingData
            | UserViewsOrderingSettingData,
        isPrivateSetting: boolean,
    ) => void
    history: ReturnType<typeof useHistory>
    isAgent: boolean
    isMovingItem: boolean
    viewUpdated: typeof viewUpdatedAction
}

function WayfindingTicketNavbarSections({
    activeViewId,
    activeViewIdSet,
    categories,
    handleCategoryDrop,
    handleCreateSectionClick,
    handleSectionDeleteClick,
    handleSectionRenameClick,
    handleSubmitMoveItem,
    history,
    isAgent,
    isMovingItem,
    viewUpdated,
}: WayfindingTicketNavbarSectionsProps) {
    const { privateElements, sectionsById, sharedElements, viewsById } =
        useWayfindingTicketNavbarData()
    const allViews = useMemo(
        () =>
            [...sharedElements, ...privateElements].reduce(
                (acc, element) =>
                    acc.concat(
                        element.type === TicketNavbarElementType.View
                            ? [element.data]
                            : element.children,
                    ),
                [] as View[],
            ),
        [sharedElements, privateElements],
    )
    const updateUrl = useMemo(
        () => _debounce((viewUrl: string) => history.push(viewUrl)),
        [history],
    )
    const moveCursor = useCallback(
        (direction: 'next' | 'prev') => {
            const currentIndex = allViews.findIndex(
                (view) => view.id === activeViewId,
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
                    nextView.slug,
                )}`,
            )
        },
        [activeViewId, activeViewIdSet, allViews, updateUrl],
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
            updateUrl.cancel()
        }
    }, [moveCursor, updateUrl])

    return (
        <>
            {categories.map((category) => (
                <TicketNavbarDropTarget
                    type={TicketNavbarElementType.Category}
                    key={category}
                    accept={TicketNavbarElementType.Category}
                    onDrop={handleCategoryDrop}
                    canDrop={(item) =>
                        item.type === TicketNavbarElementType.Category
                    }
                >
                    <InboxSidebarBlock
                        id={category}
                        title={ViewCategories[category]}
                        value={category}
                        actions={
                            (category === 'public' && isAgent) ||
                            category === 'private'
                                ? [
                                      {
                                          label: 'Create view',
                                          onClick: () =>
                                              history.push(
                                                  `/app/tickets/new/${category}`,
                                              ),
                                      },
                                      {
                                          label: 'Create section',
                                          onClick: () =>
                                              handleCreateSectionClick(
                                                  category === 'private',
                                              ),
                                      },
                                  ]
                                : undefined
                        }
                    >
                        <TicketNavbarContentBridge
                            {...((category === 'public' && isAgent) ||
                            category === 'private'
                                ? {
                                      onSectionDeleteClick: (sectionId) =>
                                          handleSectionDeleteClick(
                                              sectionId,
                                              sectionsById[sectionId],
                                          ),
                                      onSectionRenameClick: (sectionId) =>
                                          handleSectionRenameClick(
                                              sectionId,
                                              sectionsById[sectionId],
                                          ),
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
                            sections={sectionsById}
                            viewUpdated={viewUpdated}
                            views={viewsById}
                        />
                    </InboxSidebarBlock>
                </TicketNavbarDropTarget>
            ))}
        </>
    )
}
