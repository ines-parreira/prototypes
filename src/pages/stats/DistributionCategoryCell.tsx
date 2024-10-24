import colors from '@gorgias/design-tokens/dist/tokens/colors.json'
import React, {PropsWithRef} from 'react'

import {TICKET_CUSTOM_FIELDS_API_SEPARATOR} from 'models/reporting/queryFactories/utils'

import BodyCell, {
    Props as BodyCellProps,
} from 'pages/common/components/table/cells/BodyCell'
import GaugeAddon from 'pages/stats/GaugeAddon'

import {TruncateCellContent} from 'pages/stats/TruncateCellContent'
import {TICKET_CUSTOM_FIELDS_NEW_SEPARATOR} from 'pages/stats/utils'

type Props = {
    category: string
    progress: number
}

const cellColor = colors['📺 Classic'].Accessory.Blue_bg.value
export const formatCategory = (category: string) =>
    category
        ?.split(TICKET_CUSTOM_FIELDS_API_SEPARATOR)
        .join(TICKET_CUSTOM_FIELDS_NEW_SEPARATOR)

export const DistributionCategoryCell = ({
    category,
    progress,
    ...props
}: PropsWithRef<BodyCellProps> & Props) => {
    const content = formatCategory(category)

    return (
        <BodyCell {...props}>
            <GaugeAddon progress={progress} color={cellColor}>
                <TruncateCellContent content={content} left />
            </GaugeAddon>
        </BodyCell>
    )
}
