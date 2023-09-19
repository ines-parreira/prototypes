import React from 'react'
import {act, render, screen, within} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import BodyCell from 'pages/common/components/table/cells/BodyCell'
import {
    TableBodyRowExpandable,
    WithChildren,
} from 'pages/common/components/table/TableBodyRowExpandable'

type Data = {
    label: string
    value: number
}

const SampleRowContentComponent = ({label, value}: Data) => (
    <>
        <BodyCell>{label}</BodyCell>
        <BodyCell>{value}</BodyCell>
    </>
)

describe('<TableBodyRowExpandable />', () => {
    const level1Label = 'Level 1.1'
    const level2Label = 'Level 2.1'
    const level3Label = 'Level 3.1'
    const sampleData = {
        label: level1Label,
        value: 10,
        children: [
            {
                label: level2Label,
                value: 10,
                children: [
                    {
                        label: level3Label,
                        value: 10,
                        children: [],
                    },
                    {
                        label: 'Level 3.2',
                        value: 20,
                        children: [],
                    },
                    {
                        label: 'Level 3.3',
                        value: 30,
                        children: [],
                    },
                ],
            },
        ],
    }

    it('should render the component with it`s props but no children initially', () => {
        render(
            <TableBodyRowExpandable<WithChildren<Data>>
                RowContentComponent={SampleRowContentComponent}
                rowContentProps={sampleData}
            />
        )

        expect(screen.getByText(level1Label)).toBeInTheDocument()
        expect(screen.queryByText(level2Label)).not.toBeInTheDocument()
    })

    it('should show children 1 level below after clicking expand icon', () => {
        render(
            <TableBodyRowExpandable<WithChildren<Data>>
                RowContentComponent={SampleRowContentComponent}
                rowContentProps={sampleData}
            />
        )

        act(() => {
            userEvent.click(screen.getByRole('cell', {name: 'arrow_right'}))
        })

        expect(screen.queryByText(level2Label)).toBeInTheDocument()
        expect(screen.queryByText(level3Label)).not.toBeInTheDocument()
    })

    it('should show allow expanding all levels', () => {
        render(
            <TableBodyRowExpandable<WithChildren<Data>>
                RowContentComponent={SampleRowContentComponent}
                rowContentProps={sampleData}
            />
        )

        act(() => {
            userEvent.click(screen.getByRole('cell', {name: 'arrow_right'}))
            // userEvent.click(screen.getByRole('cell', {name: 'arrow_right'}))
        })
        act(() => {
            // userEvent.click(screen.getByRole('cell', {name: 'arrow_right'}))
            userEvent.click(screen.getByRole('cell', {name: 'arrow_right'}))
        })

        expect(screen.queryByText(level2Label)).toBeInTheDocument()
        expect(screen.queryByText(level3Label)).toBeInTheDocument()
    })

    it('should hide all levels below', () => {
        render(
            <TableBodyRowExpandable<WithChildren<Data>>
                RowContentComponent={SampleRowContentComponent}
                rowContentProps={sampleData}
            />
        )

        act(() => {
            userEvent.click(screen.getByRole('cell', {name: 'arrow_right'}))
        })
        act(() => {
            userEvent.click(screen.getByRole('cell', {name: 'arrow_right'}))
        })

        expect(screen.queryByText(level2Label)).toBeInTheDocument()
        expect(screen.queryByText(level3Label)).toBeInTheDocument()

        act(() => {
            const topLevelRow = screen.getByRole('row', {
                name: new RegExp(level1Label),
            })
            userEvent.click(
                within(topLevelRow).getByRole('cell', {name: 'arrow_drop_down'})
            )
        })

        expect(screen.queryByText(level2Label)).not.toBeInTheDocument()
        expect(screen.queryByText(level3Label)).not.toBeInTheDocument()
    })
})
