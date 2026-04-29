import { render } from '@repo/testing'
import { fireEvent, screen } from '@testing-library/react'
import { act } from 'react-dom/test-utils'

import { FlowSettingsItem } from '../components/FlowSettingsItem'

describe('FeatureSettings', () => {
    test('renders the component with all props', () => {
        render(
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
            />,
        )
        expect(screen.getByText('Feature Title')).toBeInTheDocument()
        expect(screen.getByText('Feature Subtitle')).toBeInTheDocument()
        expect(screen.getByText(/drag_indicator/i)).toBeInTheDocument()
    })
    it('should call onDelete when delete button is clicked', () => {
        const onDelete = jest.fn()
        render(
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
            />,
        )
        fireEvent.click(screen.getByText(/close/i))
        expect(onDelete).toHaveBeenCalledTimes(1)
    })
    it('should call onDrop when move button is clicked', () => {
        const onDrop = jest.fn()
        render(
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
            />,
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
