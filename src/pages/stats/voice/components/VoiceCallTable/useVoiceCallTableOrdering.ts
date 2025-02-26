import { FeatureFlagKey } from 'config/featureFlags'
import { useFlag } from 'core/flags'
import useOrderBy from 'hooks/useOrderBy'
import { OrderDirection } from 'models/api/types'

import { VoiceCallTableColumnName } from './constants'
import {
    isVoiceCallTableColumnSortable,
    voiceCallTableColumnNameToDimension,
} from './utils'

export default function useVoiceCallTableOrdering() {
    const shouldShowNewUnansweredStatuses = useFlag(
        FeatureFlagKey.ShowNewUnansweredStatuses,
    )

    const {
        orderBy: orderByColumnName,
        toggleOrderBy,
        orderDirection,
    } = useOrderBy<VoiceCallTableColumnName>(
        VoiceCallTableColumnName.Date,
        OrderDirection.Desc,
    )

    const orderByDimension =
        orderByColumnName &&
        voiceCallTableColumnNameToDimension(orderByColumnName)

    const onOrderChange = (column: VoiceCallTableColumnName) => {
        if (
            isVoiceCallTableColumnSortable(
                column,
                shouldShowNewUnansweredStatuses,
            )
        ) {
            toggleOrderBy(column)
        }
    }

    return {
        onOrderChange,
        orderByColumnName,
        orderByDimension,
        orderDirection,
    }
}
