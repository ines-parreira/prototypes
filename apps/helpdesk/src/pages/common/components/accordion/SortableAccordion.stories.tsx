import type { ComponentProps } from 'react'
import { useState } from 'react'

import { createDragDropManager } from 'dnd-core'
import { HTML5Backend } from 'react-dnd-html5-backend'
import type { Meta, StoryObj } from 'storybook-react-rsbuild'

import { DndProvider } from 'utils/wrappers/DndProvider'

import AccordionBody from './AccordionBody'
import SortableAccordion from './SortableAccordion'
import SortableAccordionHeader from './SortableAccordionHeader'
import SortableAccordionItem from './SortableAccordionItem'

const manager = createDragDropManager(HTML5Backend, undefined, undefined)

const storyConfig: Meta = {
    title: 'General/Accordion/SortableAccordion',
    component: SortableAccordion,
    decorators: [
        (story) => <DndProvider manager={manager}>{story()}</DndProvider>,
    ],
    argTypes: {
        children: {
            table: {
                disable: true,
            },
        },
        items: {
            table: {
                disable: true,
            },
        },
        defaultExpandedItem: {
            control: {
                type: 'text',
            },
        },
        expandedItem: {
            control: {
                type: 'text',
            },
        },
        type: {
            description:
                'Used to isolate DnD items, in case there are multiple sortable accordions on the same page.',
            control: {
                type: 'text',
            },
        },
    },
}

type Item = { id: string; isDisabled?: boolean }

const Template: StoryObj<
    ComponentProps<typeof SortableAccordion> & { items: Item[] }
> = {
    render: function Template({ items, ...props }) {
        const [orderedItems, setOrderedItems] = useState(items)

        return (
            <SortableAccordion
                {...props}
                onReorder={(reorderedItems) => {
                    setOrderedItems(
                        reorderedItems.map(
                            (id) =>
                                items.find((item) => item.id === id) as Item,
                        ),
                    )
                }}
            >
                {orderedItems.map((item) => (
                    <SortableAccordionItem
                        key={item.id}
                        id={item.id}
                        isDisabled={item.isDisabled}
                    >
                        <SortableAccordionHeader>
                            Header {item.id}
                        </SortableAccordionHeader>
                        <AccordionBody>
                            Lorem ipsum dolor sit amet, consectetur adipiscing
                            elit. Suspendisse malesuada lacus ex, sit amet
                            blandit leo lobortis eget.
                        </AccordionBody>
                    </SortableAccordionItem>
                ))}
            </SortableAccordion>
        )
    },
}

export const Default = {
    ...Template,
    args: {
        items: [{ id: '1' }, { id: '2' }, { id: '3' }],
    },
}

export const Disabled = {
    ...Template,
    args: {
        items: [{ id: '1' }, { id: '2' }, { id: '3' }],
        isDisabled: true,
    },
}

export const WithDisabledItem = {
    ...Template,
    args: {
        type: 'sortable-accordion-with-disabled-item',
        items: [{ id: '1', isDisabled: true }, { id: '2' }, { id: '3' }],
    },
}

export default storyConfig
