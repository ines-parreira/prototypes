import type { ReactNode } from 'react'
import { useCallback, useMemo, useRef, useState } from 'react'

import { useFeedbackTracking } from '@repo/ai-agent'

import { NavBarDisplayMode } from 'common/navigation/hooks/useNavBar/context'
import { useNavBar } from 'common/navigation/hooks/useNavBar/useNavBar'
import useAppSelector from 'hooks/useAppSelector'
import {
    KnowledgeSourceSideBarContext,
    KnowledgeSourceSideBarMode,
} from 'pages/tickets/detail/components/AIAgentFeedbackBar/hooks/useKnowledgeSourceSideBar/context'
import type {
    AiAgentKnowledgeResourceTypeEnum,
    KnowledgeResourcePreview,
} from 'pages/tickets/detail/components/AIAgentFeedbackBar/types'
import { useSplitTicketView } from 'split-ticket-view-toggle'
import { getCurrentAccountState } from 'state/currentAccount/selectors'
import { getTicketState } from 'state/ticket/selectors'

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

    const ticket = useAppSelector(getTicketState)
    const account = useAppSelector(getCurrentAccountState)
    const currentUser = useAppSelector((state) => state.currentUser)

    const ticketId: number = ticket.get('id')
    const accountId: number = account.get('id')
    const userId: number = currentUser.get('id')

    const { onKnowledgeResourceClick } = useFeedbackTracking({
        ticketId,
        accountId,
        userId,
    })

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

            onKnowledgeResourceClick(
                resource.id,
                resource.knowledgeResourceType,
                resource.helpCenterId || '',
            )
        },
        [onOpen, onKnowledgeResourceClick],
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
