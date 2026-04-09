import { OverflowList } from '@gorgias/axiom'

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
            nonExpandedLineCount={Infinity}
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
        </OverflowList>
    )
}
