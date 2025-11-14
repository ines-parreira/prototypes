import { fireEvent, screen } from '@testing-library/react'
import { createDragDropManager } from 'dnd-core'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { act } from 'react-dom/test-utils'

import { renderWithRouter } from 'utils/testing'
import { DndProvider } from 'utils/wrappers/DndProvider'

import { FlowSettingsItem } from '../components/FlowSettingsItem'

const manager = createDragDropManager(HTML5Backend, undefined, undefined)

describe('FeatureSettings', () => {
    test('renders the component with all props', () => {
        renderWithRouter(
            <DndProvider manager={manager}>
                <FlowSettingsItem
                    label="Feature Title"
                    triggerName="Feature Subtitle"
                    url="http://example.com"
                    index={0}
                    channelType="channelType"
                    id="id"
                    onDelete={() => {}}
                    onMove={() => {}}
                    onDrop={() => {}}
                    onCancel={() => {}}
                />
            </DndProvider>,
        )

        expect(screen.getByText('Feature Title')).toBeInTheDocument()
        expect(screen.getByText('Feature Subtitle')).toBeInTheDocument()
        expect(screen.getByText(/drag_indicator/i)).toBeInTheDocument()
    })

    it('should call onDelete when delete button is clicked', () => {
        const onDelete = jest.fn()
        renderWithRouter(
            <DndProvider manager={manager}>
                <FlowSettingsItem
                    label="Feature Title"
                    triggerName="Feature Subtitle"
                    url="http://example.com"
                    index={0}
                    channelType="channelType"
                    id="id"
                    onDelete={onDelete}
                    onMove={() => {}}
                    onDrop={() => {}}
                    onCancel={() => {}}
                />
            </DndProvider>,
        )

        fireEvent.click(screen.getByText(/close/i))
        expect(onDelete).toHaveBeenCalledTimes(1)
    })

    it('should call onDrop when move button is clicked', () => {
        const onDrop = jest.fn()
        renderWithRouter(
            <DndProvider manager={manager}>
                <FlowSettingsItem
                    label="Feature Title"
                    triggerName="Feature Subtitle"
                    url="http://example.com"
                    index={0}
                    channelType="channelType"
                    id="id"
                    onDelete={() => {}}
                    onMove={() => {}}
                    onDrop={onDrop}
                    onCancel={() => {}}
                />
            </DndProvider>,
        )

        // start dragging
        act(() => {
            const dragHandle = screen.getByText(/drag_indicator/i)

            fireEvent.dragStart(dragHandle)
            fireEvent.drop(dragHandle)
        })

        expect(onDrop).toHaveBeenCalledTimes(1)
    })
})
