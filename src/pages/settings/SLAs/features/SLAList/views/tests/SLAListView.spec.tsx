import React from 'react'
import {render} from '@testing-library/react'

import {UISLAPolicy1, UISLAPolicy2} from 'pages/settings/SLAs/fixtures/fixtures'
import {TableColumn} from '../../types'
import * as SLATableConfig from '../config'
import {columnConfig} from '../config'
import SLAListView from '../SLAListView'

jest.mock('../TableRow', () => () => <div>TableRow</div>)

describe('<SLAListView/>', () => {
    it('should render SLA policies in a table', () => {
        const SLAPolicies = [UISLAPolicy1, UISLAPolicy2]
        jest.spyOn(SLATableConfig, 'getTableCell').mockImplementation(
            (column: TableColumn) => () => <div>{column}</div>
        )

        const {getByText, getAllByText} = render(
            <SLAListView data={SLAPolicies} onTogglePolicy={jest.fn()} />
        )

        columnConfig.forEach((config) => {
            expect(getByText(config.title)).toBeInTheDocument()
        })

        expect(getAllByText('TableRow').length).toBe(2)
    })
})
