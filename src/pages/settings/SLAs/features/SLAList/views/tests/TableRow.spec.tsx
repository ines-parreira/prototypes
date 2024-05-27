import React from 'react'
import {render} from '@testing-library/react'

import {UISLAPolicy1} from 'pages/settings/SLAs/fixtures/fixtures'
import {TableColumn} from 'pages/settings/SLAs/features/SLAList/types'
import {useReorderDnD} from 'pages/common/hooks/useReorderDnD'

import * as SLATableConfig from '../config'
import {columnOrder} from '../config'
import TableRow from '../TableRow'

jest.mock('pages/common/hooks/useReorderDnD')

const mockUseReorderDnD = useReorderDnD as jest.Mock

describe('<TableRow />', () => {
    beforeEach(() => {
        mockUseReorderDnD.mockReturnValue({
            dragRef: {current: null},
            dropRef: {current: null},
            handlerId: 'handlerId',
            isDragging: false,
        })
    })

    it('should render a row', () => {
        jest.spyOn(SLATableConfig, 'getTableCell').mockImplementation(
            (column: TableColumn) => () => <div>{column}</div>
        )

        const {getByText} = render(
            <TableRow
                policy={UISLAPolicy1}
                onToggle={jest.fn()}
                dragItem={{
                    id: '1',
                    position: 1,
                    type: 'sla-policy-row',
                }}
                onMovePolicy={jest.fn()}
                onDropPolicy={jest.fn()}
                isSubmitting={false}
            />
        )

        columnOrder.forEach((column) => {
            expect(getByText(column)).toBeInTheDocument()
        })
        expect(getByText('chevron_right')).toBeInTheDocument()
    })
})
