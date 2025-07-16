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
    // This is used to have a smooth animation when closing the side bar
    const [isClosing, setIsClosing] = useState(false)

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
        (knowledgeResourceType: AiAgentKnowledgeResourceTypeEnum) => {
            setSelectedResource({
                id: '',
                knowledgeResourceType,
                url: '',
                title: '',
                content: '',
                helpCenterId: '',
            })
            setSideBarMode(KnowledgeSourceSideBarMode.CREATE)
            onOpen()
        },
        [onOpen],
    )

    const closeModal = useCallback(() => {
        // Trigger drawer to close but don't immediately update state
        setIsClosing(true)

        setTimeout(() => {
            setSelectedResource(null)
            setSideBarMode(null)
            setIsClosing(false)
            onClose()
        }, 300)
    }, [onClose])

    const value = useMemo(
        () => ({
            selectedResource,
            mode: sideBarMode,
            isClosing,
            openPreview,
            openEdit,
            openCreate,
            closeModal,
        }),
        [
            selectedResource,
            sideBarMode,
            isClosing,
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
