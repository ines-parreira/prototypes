import { createSelector } from 'reselect'

import type { UserViewsOrderingSettingData } from 'config/types/user'
import type { View } from 'models/view/types'
import { ViewCategory, ViewType, ViewVisibility } from 'models/view/types'
import type { TicketNavbarElement } from 'pages/tickets/navbar/TicketNavbarContent'
import { getViewsOrderingSetting } from 'state/currentAccount/selectors'
import type { AccountViewsOrderingSettingData } from 'state/currentAccount/types'
import { getViewsOrderingUserSetting } from 'state/currentUser/selectors'
import type { RootState } from 'state/types'

import { TicketNavbarElementType } from './types'

const createTicketNavbarElementsSelector = (viewVisibility: ViewVisibility) => {
    const emptyViewsOrdering: UserViewsOrderingSettingData = {
        views: {},
        view_sections: {},
    }
    return createSelector(
        (state: RootState) => state.entities.views,
        (state: RootState) => state.entities.sections,
        (state: RootState) =>
            (viewVisibility === ViewVisibility.Private
                ? (getViewsOrderingUserSetting(state)
                      ?.data as UserViewsOrderingSettingData)
                : (getViewsOrderingSetting(state).data as
                      | AccountViewsOrderingSettingData
                      | undefined)) || emptyViewsOrdering,
        (state: RootState) =>
            viewVisibility === ViewVisibility.Private
                ? state.ui.ticketNavbar.optimisticUserSettings
                : state.ui.ticketNavbar.optimisticAccountSettings,
        (views, sections, setting, optimisticSettings) => {
            const viewsData = Object.values(views)

            const sectionIds = Object.keys(sections)
            const viewElements = viewsData
                .filter(
                    (view) =>
                        view.type === ViewType.TicketList &&
                        view.category !== ViewCategory.System &&
                        (viewVisibility === ViewVisibility.Private
                            ? view.visibility === ViewVisibility.Private
                            : view.visibility !== ViewVisibility.Private),
                )
                .map((view) => ({
                    data: view,
                    type: TicketNavbarElementType.View,
                })) as TicketNavbarElement[]
            const sectionElements = Object.values(sections)
                .filter((section) =>
                    viewVisibility === ViewVisibility.Private
                        ? section.private
                        : !section.private,
                )
                .map((section) => ({
                    children: viewElements
                        .reduce((acc, viewElement) => {
                            const data = viewElement.data as View
                            if (data.section_id === section.id) {
                                acc.push(data)
                            }
                            return acc
                        }, [] as View[])
                        .sort(
                            (view1, view2) =>
                                ((optimisticSettings.views[view1.id]
                                    ? optimisticSettings.views[view1.id]
                                          .display_order
                                    : setting.views?.[view1.id]
                                          ?.display_order) ?? Infinity) -
                                ((optimisticSettings.views[view2.id]
                                    ? optimisticSettings.views[view2.id]
                                          .display_order
                                    : setting.views?.[view2.id]
                                          ?.display_order) ?? Infinity),
                        ),
                    data: section,
                    type: TicketNavbarElementType.Section,
                })) as TicketNavbarElement[]

            const getDisplayOrder = (element: TicketNavbarElement) => {
                const order =
                    element.type === TicketNavbarElementType.Section
                        ? optimisticSettings.view_sections[element.data.id]
                            ? optimisticSettings.view_sections[element.data.id]
                                  .display_order
                            : setting.view_sections[element.data.id]
                                  ?.display_order
                        : optimisticSettings.views[element.data.id]
                          ? optimisticSettings.views[element.data.id]
                                .display_order
                          : setting.views?.[element.data.id]?.display_order
                return order ?? Infinity
            }
            return [...viewElements, ...sectionElements]
                .filter(
                    (element) =>
                        element.type !== TicketNavbarElementType.View ||
                        element.data.section_id == null ||
                        !sectionIds.includes(
                            element.data.section_id.toString(),
                        ),
                )
                .sort(
                    (element1, element2) =>
                        getDisplayOrder(element1) - getDisplayOrder(element2),
                )
        },
    )
}

export const getPrivateTicketNavbarElements =
    createTicketNavbarElementsSelector(ViewVisibility.Private)

export const getPublicTicketNavbarElements = createTicketNavbarElementsSelector(
    ViewVisibility.Public,
)
