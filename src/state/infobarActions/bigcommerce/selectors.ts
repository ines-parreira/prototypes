import {createSelector} from 'reselect'

import {IntegrationType} from 'models/integration/types'
import {RootState} from 'state/types'
import {getInfobarActionsState} from 'state/infobarActions/selectors'
import {InfobarActionsState} from 'state/infobarActions/types'
import {BigCommerceActionsState} from './types'

export const getBigCommerceActionsState = createSelector<
    RootState,
    BigCommerceActionsState,
    InfobarActionsState
>(getInfobarActionsState, (state) => state[IntegrationType.BigCommerce])
