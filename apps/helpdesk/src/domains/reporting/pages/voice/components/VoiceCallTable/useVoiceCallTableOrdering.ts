import { VoiceCallTableColumn } from 'domains/reporting/pages/voice/components/VoiceCallTable/constants'
import {
    isVoiceCallTableColumnSortable,
    voiceCallTableColumnNameToDimension,
} from 'domains/reporting/pages/voice/components/VoiceCallTable/utils'
import useOrderBy from 'hooks/useOrderBy'
import { OrderDirection } from 'models/api/types'

export default function useVoiceCallTableOrdering() {
    const {
        orderBy: orderByColumnName,
        toggleOrderBy,
        orderDirection,
    } = useOrderBy<VoiceCallTableColumn>(
        VoiceCallTableColumn.Date,
        OrderDirection.Desc,
    )

    const orderByDimension =
        orderByColumnName &&
        voiceCallTableColumnNameToDimension(orderByColumnName)

    const onOrderChange = (column: VoiceCallTableColumn) => {
        if (isVoiceCallTableColumnSortable(column)) {
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
