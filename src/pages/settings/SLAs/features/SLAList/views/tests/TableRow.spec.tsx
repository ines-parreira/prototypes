import React from 'react'
import {render} from '@testing-library/react'

import {UISLAPolicy1} from 'pages/settings/SLAs/fixtures/fixtures'
import {TableColumn} from 'pages/settings/SLAs/features/SLAList/types'

import * as SLATableConfig from '../config'
import {columnOrder} from '../config'
import TableRow from '../TableRow'

describe('<TableRow />', () => {
    it('should render a row', () => {
        jest.spyOn(SLATableConfig, 'getTableCell').mockImplementation(
            (column: TableColumn) => () => <div>{column}</div>
        )

        const {getByText} = render(
            <TableRow policy={UISLAPolicy1} onToggle={jest.fn()} />
        )

        columnOrder.forEach((column) => {
            expect(getByText(column)).toBeInTheDocument()
        })
        expect(getByText('chevron_right')).toBeInTheDocument()
    })
})
