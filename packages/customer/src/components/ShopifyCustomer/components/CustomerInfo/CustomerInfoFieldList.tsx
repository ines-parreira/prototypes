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
}

export function CustomerInfoFieldList({ fields, context }: Props) {
    return (
        <OverflowList
            className={css.overflowList}
            nonExpandedLineCount={7}
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
            <Box className={css.overflowListToggle}>
                <OverflowListShowMore
                    leadingSlot="arrow-chevron-down"
                    className={css.overflowListToggle}
                >
                    Show more
                </OverflowListShowMore>
            </Box>
            <Box className={css.overflowListToggle}>
                <OverflowListShowLess
                    leadingSlot="arrow-chevron-up"
                    className={css.overflowListToggle}
                >
                    Show less
                </OverflowListShowLess>
            </Box>
        </OverflowList>
    )
}
