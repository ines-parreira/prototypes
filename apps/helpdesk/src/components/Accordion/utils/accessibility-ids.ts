import type { AccordionValue } from './types'

export const AccordionIds = {
    trigger: (id: string, value: AccordionValue) =>
        `accordion-trigger-${id}-${value}`,
    content: (id: string, value: AccordionValue) =>
        `accordion-content-${id}-${value}`,
}
