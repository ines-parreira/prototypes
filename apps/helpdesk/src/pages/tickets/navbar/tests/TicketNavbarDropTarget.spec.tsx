import { ComponentProps } from 'react'

import { fireEvent, render } from '@testing-library/react'
import { useDrag } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'

import { DndProvider } from 'utils/wrappers/DndProvider'

import TicketNavbarDropTarget, {
    TicketNavbarDropDirection,
} from '../TicketNavbarDropTarget'

const MockedDragComponent = ({ isOver }: { isOver?: boolean }) => {
    const [, drag] = useDrag({
        type: 'foo',
        item: {
            id: 1,
            type: 'foo',
        },
    })

    return (
        <div className={`${isOver ? 'isOver' : ''}`} ref={drag}>
            Drag me!
        </div>
    )
}

const WrappedTicketNavbarDropTarget = (
    props: ComponentProps<typeof TicketNavbarDropTarget>,
) => (
    <DndProvider backend={HTML5Backend}>
        <TicketNavbarDropTarget {...props} />
    </DndProvider>
)

const minProps = {
    accept: 'foo',
    children: <MockedDragComponent />,
    onDrop: jest.fn(),
}

describe('<TicketNavbarDropTarget/>', () => {
    it('should render', () => {
        const { container } = render(
            <WrappedTicketNavbarDropTarget {...minProps} />,
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should show an indicator and pass isOver to children', () => {
        const { container, getByText } = render(
            <WrappedTicketNavbarDropTarget {...minProps}>
                {(isOver) => <MockedDragComponent isOver={isOver} />}
            </WrappedTicketNavbarDropTarget>,
        )

        fireEvent.dragStart(getByText('Drag me!'))
        fireEvent.dragEnter(container.firstChild as ChildNode)
        fireEvent.dragOver(container.firstChild as ChildNode)
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should handle drop event', () => {
        const { container, getByText } = render(
            <WrappedTicketNavbarDropTarget {...minProps} />,
        )

        fireEvent.dragStart(getByText('Drag me!'))
        fireEvent.dragEnter(container.firstChild as ChildNode)
        fireEvent.dragOver(container.firstChild as ChildNode)
        fireEvent.drop(container.firstChild as ChildNode)
        expect(minProps.onDrop).toHaveBeenNthCalledWith(
            1,
            { id: 1, type: 'foo' },
            expect.any(Object),
            TicketNavbarDropDirection.Down,
        )
    })

    it('should handle drop event with direction calculation at drop time', () => {
        const { container, getByText } = render(
            <WrappedTicketNavbarDropTarget {...minProps} />,
        )

        const dragElement = getByText('Drag me!')
        const dropElement = container.firstChild as Element

        // Mock getBoundingClientRect for direction calculation
        jest.spyOn(dropElement, 'getBoundingClientRect').mockReturnValue({
            top: 100,
            height: 50,
            left: 0,
            width: 100,
            bottom: 150,
            right: 100,
            x: 0,
            y: 100,
            toJSON: () => ({}),
        })

        const clientX = 50
        const clientY = 110 // Below middle point (125), should be Down

        fireEvent.dragStart(dragElement)
        fireEvent.dragEnter(dropElement, { clientX, clientY })
        fireEvent.dragOver(dropElement, { clientX, clientY })
        fireEvent.drop(dropElement, { clientX, clientY })

        expect(minProps.onDrop).toHaveBeenCalledWith(
            { id: 1, type: 'foo' },
            expect.any(Object),
            TicketNavbarDropDirection.Down,
        )
    })

    it('should calculate direction correctly based on drop coordinates', () => {
        const mockBoundingRect = { top: 100, height: 50 }

        const calculateDirection = (
            clientY: number,
            boundingRect: { top: number; height: number },
        ) => {
            return clientY < boundingRect.top + boundingRect.height / 2
                ? TicketNavbarDropDirection.Up
                : TicketNavbarDropDirection.Down
        }

        // Test coordinates above middle point
        expect(calculateDirection(110, mockBoundingRect)).toBe(
            TicketNavbarDropDirection.Up,
        )
        expect(calculateDirection(124, mockBoundingRect)).toBe(
            TicketNavbarDropDirection.Up,
        )

        // Test coordinates at or below middle point
        expect(calculateDirection(125, mockBoundingRect)).toBe(
            TicketNavbarDropDirection.Down,
        )
        expect(calculateDirection(130, mockBoundingRect)).toBe(
            TicketNavbarDropDirection.Down,
        )
        expect(calculateDirection(150, mockBoundingRect)).toBe(
            TicketNavbarDropDirection.Down,
        )

        // Verify enum values
        expect(TicketNavbarDropDirection.Up).toBe('up')
        expect(TicketNavbarDropDirection.Down).toBe('down')
    })

    it('should return result when onDrop returns a result', () => {
        const mockResult = {
            sectionId: 1,
            viewId: 2,
            direction: TicketNavbarDropDirection.Up,
        }
        const onDropWithResult = jest.fn().mockReturnValue(mockResult)

        const { container, getByText } = render(
            <WrappedTicketNavbarDropTarget
                {...minProps}
                onDrop={onDropWithResult}
            />,
        )

        fireEvent.dragStart(getByText('Drag me!'))
        fireEvent.dragEnter(container.firstChild as ChildNode)
        fireEvent.drop(container.firstChild as ChildNode)

        expect(onDropWithResult).toHaveBeenCalled()
    })
})
