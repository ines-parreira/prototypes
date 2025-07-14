import { PropsWithRef } from 'react'

import { useTheme } from 'core/theme'
import { TICKET_CUSTOM_FIELDS_API_SEPARATOR } from 'domains/reporting/models/queryFactories/utils'
import GaugeAddon from 'domains/reporting/pages/common/components/charts/GaugeAddon'
import { TruncateCellContent } from 'domains/reporting/pages/common/components/TruncateCellContent'
import { TICKET_CUSTOM_FIELDS_NEW_SEPARATOR } from 'domains/reporting/pages/utils'
import BodyCell, {
    Props as BodyCellProps,
} from 'pages/common/components/table/cells/BodyCell'

type Props = {
    category: string
    progress: number
}

export const formatCategory = (category: string) =>
    category
        ?.split(TICKET_CUSTOM_FIELDS_API_SEPARATOR)
        .join(TICKET_CUSTOM_FIELDS_NEW_SEPARATOR)

export const DistributionCategoryCell = ({
    category,
    progress,
    ...props
}: PropsWithRef<BodyCellProps> & Props) => {
    const theme = useTheme()
    const cellColor = theme.tokens.Accessory.Blue_1.value
    const content = formatCategory(category)

    return (
        <BodyCell {...props}>
            <GaugeAddon progress={progress} color={cellColor}>
                <TruncateCellContent content={content} left />
            </GaugeAddon>
        </BodyCell>
    )
}
