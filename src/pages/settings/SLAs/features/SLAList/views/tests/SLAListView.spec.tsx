import {render} from '@testing-library/react'
import React from 'react'

import {UISLAPolicy1, UISLAPolicy2} from 'pages/settings/SLAs/fixtures/fixtures'

import {TableColumn} from '../../types'

import * as SLATableConfig from '../config'
import {columnConfig} from '../config'
import SLAListView from '../SLAListView'
import useSortablePolicies from '../useSortablePolicies'

jest.mock('../TableRow', () => () => <div>TableRow</div>)

jest.mock('../useSortablePolicies')

const mockUseSortablePolicies = useSortablePolicies as jest.Mock

const SLAPolicies = [UISLAPolicy1, UISLAPolicy2]

describe('<SLAListView/>', () => {
    beforeEach(() => {
        mockUseSortablePolicies.mockReturnValue({
            policies: SLAPolicies,
            handleMovePolicy: jest.fn(),
            handleDropPolicy: jest.fn(),
        })
    })

    it('should render SLA policies in a table', () => {
        jest.spyOn(SLATableConfig, 'getTableCell').mockImplementation(
            (column: TableColumn) => () => <div>{column}</div>
        )

        const {getByText, getAllByText} = render(
            <SLAListView
                data={SLAPolicies}
                onTogglePolicy={jest.fn()}
                onPolicyPriorityChange={jest.fn()}
                isSubmitting={false}
            />
        )

        columnConfig.forEach((config) => {
            expect(getByText(config.title)).toBeInTheDocument()
        })

        expect(getAllByText('TableRow').length).toBe(2)
    })
})
