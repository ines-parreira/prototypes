import {render, fireEvent} from '@testing-library/react'
import React, {ComponentProps} from 'react'
import {DndProvider, useDrag} from 'react-dnd'
import {HTML5Backend} from 'react-dnd-html5-backend'

import TicketNavbarDropTarget, {
    TicketNavbarDropDirection,
} from '../TicketNavbarDropTarget'

const MockedDragComponent = ({isOver}: {isOver?: boolean}) => {
    const [, drag] = useDrag({
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
    props: ComponentProps<typeof TicketNavbarDropTarget>
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
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should render', () => {
        const {container} = render(
            <WrappedTicketNavbarDropTarget {...minProps} />
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should show an indicator and pass isOver to children', () => {
        const {container, getByText} = render(
            <WrappedTicketNavbarDropTarget {...minProps}>
                {(isOver) => <MockedDragComponent isOver={isOver} />}
            </WrappedTicketNavbarDropTarget>
        )

        fireEvent.dragStart(getByText('Drag me!'))
        fireEvent.dragEnter(container.firstChild as ChildNode)
        fireEvent.dragOver(container.firstChild as ChildNode)
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should handle drop event', () => {
        const {container, getByText} = render(
            <WrappedTicketNavbarDropTarget {...minProps} />
        )

        fireEvent.dragStart(getByText('Drag me!'))
        fireEvent.dragEnter(container.firstChild as ChildNode)
        fireEvent.dragOver(container.firstChild as ChildNode)
        fireEvent.drop(container.firstChild as ChildNode)
        expect(minProps.onDrop).toHaveBeenNthCalledWith(
            1,
            {id: 1, type: 'foo'},
            expect.any(Object),
            TicketNavbarDropDirection.Down
        )
    })
})
