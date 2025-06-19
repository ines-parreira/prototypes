import { ReactNode, useCallback, useMemo, useRef, useState } from 'react'

import { NavBarDisplayMode } from 'common/navigation/hooks/useNavBar/context'
import { useNavBar } from 'common/navigation/hooks/useNavBar/useNavBar'
import {
    KnowledgeSourceSideBarContext,
    KnowledgeSourceSideBarMode,
} from 'pages/tickets/detail/components/AIAgentFeedbackBar/hooks/useKnowledgeSourceSideBar/context'
import {
    AiAgentKnowledgeResourceTypeEnum,
    KnowledgeResourcePreview,
} from 'pages/tickets/detail/components/AIAgentFeedbackBar/types'
import { useSplitTicketView } from 'split-ticket-view-toggle'

export function KnowledgeSourceSideBarProvider({
    children,
}: {
    children: ReactNode
}) {
    const { setNavBarDisplay, navBarDisplay } = useNavBar()
    const {
        setIsEnabled: setSplitTicketView,
        isEnabled: isSplitTicketViewEnabled,
    } = useSplitTicketView()

    const navBarDisplayInitialValue = useRef(navBarDisplay)
    const isSplitTicketViewEnabledInitialValue = useRef(
        isSplitTicketViewEnabled,
    )

    const [selectedResource, setSelectedResource] =
        useState<KnowledgeResourcePreview | null>(null)
    const [sideBarMode, setSideBarMode] =
        useState<KnowledgeSourceSideBarMode | null>(null)

    const onOpen = useCallback(() => {
        navBarDisplayInitialValue.current = navBarDisplay
        isSplitTicketViewEnabledInitialValue.current = isSplitTicketViewEnabled
        // use setTimeout to avoid side bar animation delay
        setTimeout(() => {
            setNavBarDisplay(NavBarDisplayMode.Collapsed)
            setSplitTicketView(false)
        }, 0)
    }, [
        setNavBarDisplay,
        setSplitTicketView,
        navBarDisplay,
        isSplitTicketViewEnabled,
    ])

    const onClose = useCallback(() => {
        // use setTimeout to avoid side bar animation delay
        setTimeout(() => {
            setNavBarDisplay(navBarDisplayInitialValue.current)
            setSplitTicketView(isSplitTicketViewEnabledInitialValue.current)
        }, 0)
    }, [
        navBarDisplayInitialValue,
        isSplitTicketViewEnabledInitialValue,
        setNavBarDisplay,
        setSplitTicketView,
    ])

    const openPreview = useCallback(
        (resource: KnowledgeResourcePreview) => {
            setSelectedResource(resource)
            setSideBarMode(KnowledgeSourceSideBarMode.PREVIEW)
            onOpen()
        },
        [onOpen],
    )

    const openEdit = useCallback(
        (resource: KnowledgeResourcePreview) => {
            setSelectedResource(resource)
            setSideBarMode(KnowledgeSourceSideBarMode.EDIT)
            onOpen()
        },
        [onOpen],
    )

    const openCreate = useCallback(
        (type: AiAgentKnowledgeResourceTypeEnum) => {
            setSelectedResource({
                id: '',
                type,
                url: '',
                title: '',
                content: '',
            })
            setSideBarMode(KnowledgeSourceSideBarMode.CREATE)
            onOpen()
        },
        [onOpen],
    )

    const closeModal = useCallback(() => {
        setSelectedResource(null)
        setSideBarMode(null)
        onClose()
    }, [onClose])

    const value = useMemo(
        () => ({
            selectedResource,
            mode: sideBarMode,
            openPreview,
            openEdit,
            openCreate,
            closeModal,
        }),
        [
            selectedResource,
            sideBarMode,
            openPreview,
            openEdit,
            openCreate,
            closeModal,
        ],
    )

    return (
        <KnowledgeSourceSideBarContext.Provider value={value}>
            {children}
        </KnowledgeSourceSideBarContext.Provider>
    )
}
