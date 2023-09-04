import {UserViewsOrderingSettingData} from '../../../config/types/user'
import {AccountViewsOrderingSettingData} from '../../currentAccount/types'

export type TicketNavbarState = {
    optimisticAccountSettings: AccountViewsOrderingSettingData
    optimisticUserSettings: UserViewsOrderingSettingData
}

export enum TicketNavbarElementType {
    View = 'view',
    Section = 'section',
}
