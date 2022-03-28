import React from 'react'
import {render} from '@testing-library/react'

import {getSingleCategoryEnglish} from 'pages/settings/helpCenter/fixtures/getCategoriesResponse.fixtures'
import {DroppableTableBodyRow} from '../DroppableTableBodyRow'

jest.mock('pages/settings/helpCenter/hooks/useReorderDnD', () => {
    return {
        useReorderDnD: jest.fn().mockResolvedValue({
            dragRef: '',
            dropRef: '',
            handlerId: 0,
            isDragging: false,
        }),
        Callbacks: {
            onHover: jest.fn(),
            onDrop: jest.fn(),
        },
        DragItemRequired: {},
    }
})
describe('<DroppableTableBodyRow />', () => {
    it('should match snapshot', () => {
        const {container} = render(
            <DroppableTableBodyRow
                onMoveEntity={() => null}
                dragItem={{type: 'CATEGORY', position: 0}}
                onDragStart={function (): void {
                    throw new Error('Function not implemented.')
                }}
                category={getSingleCategoryEnglish}
            >
                <td>test</td>
            </DroppableTableBodyRow>
        )

        expect(container.firstChild).toMatchSnapshot()
    })
})
