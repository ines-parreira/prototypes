import { useMemo } from 'react'

import {
    createTicketViewNavigationData,
    useTicketViewNavigationOrderingStore,
} from '@repo/navigation'
import {
    usePrivateViews,
    usePrivateViewSections,
    usePrivateViewsOrdering,
    usePublicViews,
    usePublicViewSections,
    usePublicViewsOrdering,
} from '@repo/views'

import type { View as SdkView } from '@gorgias/helpdesk-types'

import type { Section } from 'models/section/types'
import type { View } from 'models/view/types'
import { TicketNavbarElementType } from 'state/ui/ticketNavbar/types'

import type { TicketNavbarElement } from './TicketNavbarContent'

export function useWayfindingTicketNavbarData() {
    const publicViews = usePublicViews()
    const privateViews = usePrivateViews()
    const publicSections = usePublicViewSections()
    const privateSections = usePrivateViewSections()
    const publicOrdering = usePublicViewsOrdering()
    const privateOrdering = usePrivateViewsOrdering()
    const optimisticSharedOrdering = useTicketViewNavigationOrderingStore(
        (state) => state.optimisticSharedOrdering,
    )
    const optimisticPrivateOrdering = useTicketViewNavigationOrderingStore(
        (state) => state.optimisticPrivateOrdering,
    )

    return useMemo(() => {
        return createTicketViewNavigationData<
            View,
            Section,
            TicketNavbarElementType.View,
            TicketNavbarElementType.Section
        >({
            elementTypes: {
                section: TicketNavbarElementType.Section,
                view: TicketNavbarElementType.View,
            },
            optimisticPrivateOrdering,
            optimisticSharedOrdering,
            persistedPrivateOrdering: privateOrdering,
            persistedSharedOrdering: publicOrdering,
            privateSections: privateSections as Section[],
            privateViews: privateViews as SdkView[] as View[],
            sharedSections: publicSections as Section[],
            sharedViews: publicViews as SdkView[] as View[],
        }) as {
            privateElements: TicketNavbarElement[]
            sectionsById: Record<number, Section>
            sharedElements: TicketNavbarElement[]
            viewsById: Record<number, View>
        }
    }, [
        optimisticPrivateOrdering,
        optimisticSharedOrdering,
        privateOrdering,
        privateSections,
        privateViews,
        publicOrdering,
        publicSections,
        publicViews,
    ])
}
