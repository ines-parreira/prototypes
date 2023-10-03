import {UserViewsOrderingSettingData} from 'config/types/user'
import {AccountViewsOrderingSettingData} from 'state/currentAccount/types'

export type TicketNavbarState = {
    optimisticAccountSettings: AccountViewsOrderingSettingData
    optimisticUserSettings: UserViewsOrderingSettingData
}

export enum TicketNavbarElementType {
    View = 'view',
    Section = 'section',
    Category = 'category',
}
