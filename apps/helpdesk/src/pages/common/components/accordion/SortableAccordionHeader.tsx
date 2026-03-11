import classnames from 'classnames'

import type { AccordionHeaderProps } from './AccordionHeader'
import AccordionHeader from './AccordionHeader'
import { useSortableAccordionContext } from './SortableAccordionContext'
import { useSortableAccordionItemContext } from './SortableAccordionItemContext'

import css from './SortableAccordionHeader.less'

type Props = Omit<AccordionHeaderProps, 'action'>

/**
 * @deprecated This component is deprecated and will be removed in future versions.
 * Please use `<Disclosure />` from @gorgias/axiom instead.
 * @date 2026-03-11
 * @type ui-kit-migration
 */
const SortableAccordionHeader = (props: Props) => {
    const { isDisabled } = useSortableAccordionContext()
    const { dragRef } = useSortableAccordionItemContext()

    return (
        <AccordionHeader
            {...props}
            action={
                <div
                    ref={dragRef}
                    className={classnames(css.dragHandle, {
                        [css.isDisabled]: isDisabled,
                    })}
                >
                    <i className="material-icons md-2">drag_indicator</i>
                </div>
            }
        />
    )
}

export default SortableAccordionHeader
