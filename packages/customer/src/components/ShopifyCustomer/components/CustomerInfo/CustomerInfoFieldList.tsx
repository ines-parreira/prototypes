import {
    Box,
    OverflowList,
    OverflowListShowLess,
    OverflowListShowMore,
} from '@gorgias/axiom'

import { CustomerInfoFieldItem } from './CustomerInfoFieldItem'
import type { FieldConfig, FieldRenderContext } from './types'

import css from './CustomerInfoFieldList.less'

type Props = {
    fields: FieldConfig[]
    context: FieldRenderContext
    showOverflowToggle?: boolean
}

export function CustomerInfoFieldList({
    fields,
    context,
    showOverflowToggle = true,
}: Props) {
    return (
        <OverflowList
            className={css.overflowList}
            nonExpandedLineCount={showOverflowToggle ? 7 : Infinity}
            gap="xxs"
        >
            {fields.map((field) => (
                <CustomerInfoFieldItem
                    key={field.id}
                    field={field}
                    context={context}
                    className={css.overflowListItem}
                />
            ))}
            {showOverflowToggle && (
                <Box className={css.overflowListToggle}>
                    <OverflowListShowMore
                        leadingSlot="arrow-chevron-down"
                        className={css.overflowListToggle}
                    >
                        Show more
                    </OverflowListShowMore>
                </Box>
            )}
            {showOverflowToggle && (
                <Box className={css.overflowListToggle}>
                    <OverflowListShowLess
                        leadingSlot="arrow-chevron-up"
                        className={css.overflowListToggle}
                    >
                        Show less
                    </OverflowListShowLess>
                </Box>
            )}
        </OverflowList>
    )
}
