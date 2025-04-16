import { AccordionItem } from './components/AccordionItem'
import { AccordionItemContent } from './components/AccordionItemContent'
import { AccordionItemIndicator } from './components/AccordionItemIndicator'
import { AccordionItemTrigger } from './components/AccordionItemTrigger'
import { AccordionRoot } from './components/AccordionRoot'

export type { AccordionProps } from './utils/types'
export type { AccordionItemProps } from './components/AccordionItem'
export type { AccordionItemTriggerProps } from './components/AccordionItemTrigger'

export const Accordion = {
    Root: AccordionRoot,
    Item: AccordionItem,
    ItemContent: AccordionItemContent,
    ItemTrigger: AccordionItemTrigger,
    ItemIndicator: AccordionItemIndicator,
}
