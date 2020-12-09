import {createSelector} from 'reselect'

import {View, ViewType, ViewVisibility} from '../../../models/view/types'
import {getUserSetting} from '../../currentUser/selectors'
import {RootState} from '../../types'
import {TicketNavbarElement} from '../../../pages/tickets/navbar/TicketNavbarContent'
import {SectionsState} from '../../entities/sections/types'
import {
    UserSettingType,
    UserViewsOrderingSettingData,
} from '../../../config/types/user'
import {TicketNavbarElementType} from '../../../pages/tickets/navbar/TicketNavbar'
import {ViewsState} from '../../entities/views/types'
import {getSettingsByType as getAccountSettingsByType} from '../../currentAccount/selectors'
import {
    AccountSetting,
    AccountSettingType,
    AccountViewsOrderingSettingData,
} from '../../currentAccount/types'

export const getTicketNavbarElements = (visibility: ViewVisibility) =>
    createSelector<
        RootState,
        TicketNavbarElement[],
        ViewsState,
        SectionsState,
        AccountViewsOrderingSettingData | UserViewsOrderingSettingData,
        AccountViewsOrderingSettingData | UserViewsOrderingSettingData
    >(
        (state: RootState) => state.entities.views,
        (state: RootState) => state.entities.sections,
        (state: RootState) =>
            (visibility === ViewVisibility.Private
                ? (getUserSetting(UserSettingType.ViewsOrdering)(state)
                      ?.data as UserViewsOrderingSettingData)
                : ((getAccountSettingsByType(AccountSettingType.ViewsOrdering)(
                      state
                  ).toJS() as AccountSetting)
                      ?.data as AccountViewsOrderingSettingData)) || {
                views: {},
                view_sections: {},
            },
        (state: RootState) =>
            visibility === ViewVisibility.Private
                ? state.ui.ticketNavbar.optimisticUserSettings
                : state.ui.ticketNavbar.optimisticAccountSettings,
        (views, sections, setting, optimisticSettings) => {
            const sectionIds = Object.keys(sections)
            const viewElements = Object.values(views)
                .filter(
                    (view) =>
                        view.type === ViewType.TicketList &&
                        (visibility === ViewVisibility.Private
                            ? view.visibility === ViewVisibility.Private
                            : view.visibility !== ViewVisibility.Private)
                )
                .map((view) => ({
                    data: view,
                    type: TicketNavbarElementType.View,
                })) as TicketNavbarElement[]
            const sectionElements = Object.values(sections)
                .filter((section) =>
                    visibility === ViewVisibility.Private
                        ? section.private
                        : !section.private
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
                                (optimisticSettings.views[view1.id]
                                    ? optimisticSettings.views[view1.id]
                                          .display_order
                                    : setting.views?.[view1.id]
                                          ?.display_order) -
                                (optimisticSettings.views[view2.id]
                                    ? optimisticSettings.views[view2.id]
                                          .display_order
                                    : setting.views?.[view2.id]?.display_order)
                        ),
                    data: section,
                    type: TicketNavbarElementType.Section,
                })) as TicketNavbarElement[]

            const getDisplayOrder = (element: TicketNavbarElement) => {
                return element.type === TicketNavbarElementType.Section
                    ? optimisticSettings.view_sections[element.data.id]
                        ? optimisticSettings.view_sections[element.data.id]
                              .display_order
                        : setting.view_sections[element.data.id]?.display_order
                    : optimisticSettings.views[element.data.id]
                    ? optimisticSettings.views[element.data.id].display_order
                    : setting.views?.[element.data.id]?.display_order
            }
            return [...viewElements, ...sectionElements]
                .filter(
                    (element) =>
                        element.type !== TicketNavbarElementType.View ||
                        element.data.section_id == null ||
                        !sectionIds.includes(element.data.section_id.toString())
                )
                .sort(
                    (element1, element2) =>
                        getDisplayOrder(element1) - getDisplayOrder(element2)
                )
        }
    )
