import type { ComponentProps } from 'react'
import React from 'react'

import { fireEvent, render, screen } from '@testing-library/react'
import { createDragDropManager } from 'dnd-core'
import { HTML5Backend } from 'react-dnd-html5-backend'

import { EditColumnsItem } from 'domains/reporting/pages/common/components/Table/EditColumnsItem'
import { DndProvider } from 'utils/wrappers/DndProvider'

const manager = createDragDropManager(HTML5Backend, undefined, undefined)

describe('<EditColumnsItem>', () => {
    const title = 'item title'
    const minProps: ComponentProps<typeof EditColumnsItem> = {
        title,
        isChecked: false,
        onChange: (v) => v,
        option: { id: 'someId' },
        onDrop: jest.fn(),
    }

    it('should render dropdown item', () => {
        render(
            <DndProvider manager={manager}>
                <EditColumnsItem {...minProps} />
            </DndProvider>,
        )

        expect(screen.getByText(title)).toBeInTheDocument()
    })

    it('should render disabled dropdown item', () => {
        render(
            <DndProvider manager={manager}>
                <EditColumnsItem {...minProps} disabled />
            </DndProvider>,
        )
        const dropdown = document.querySelector('.dropdownItem')

        expect(dropdown).toHaveClass('disabled')
    })

    it('should render tooltip on hover dropdown item', async () => {
        const tooltip = 'test tooltip'
        render(
            <DndProvider manager={manager}>
                <EditColumnsItem {...minProps} tooltip={tooltip} />
            </DndProvider>,
        )

        fireEvent.mouseOver(screen.getByText('info'))

        expect(await screen.findByRole('tooltip')).toHaveTextContent(tooltip)
    })

    it('should call onChange on clicking', () => {
        const onChange = jest.fn()
        render(
            <DndProvider manager={manager}>
                <EditColumnsItem {...minProps} onChange={onChange} />
            </DndProvider>,
        )

        fireEvent.click(screen.getByText(title))

        expect(onChange).toBeCalledWith(!minProps.isChecked)
    })
})
