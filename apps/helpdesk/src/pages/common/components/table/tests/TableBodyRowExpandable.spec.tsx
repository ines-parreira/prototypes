import React from 'react'

import { userEvent } from '@repo/testing'
import { act, render, screen, waitFor, within } from '@testing-library/react'

import BodyCell from 'pages/common/components/table/cells/BodyCell'
import {
    COLUMN_WIDTH,
    MOBILE_COLUMN_WIDTH,
    TableBodyRowExpandable,
    WithChildren,
} from 'pages/common/components/table/TableBodyRowExpandable'
import { mockRequestAnimationFrame, triggerWidthResize } from 'utils/testing'

type Data = {
    label: string
    value: number
}

const rafControl = mockRequestAnimationFrame()

const SampleRowContentComponentMock = jest
    .fn()
    .mockImplementation(({ label, value }: Data) => (
        <>
            <BodyCell>{label}</BodyCell>
            <BodyCell>{value}</BodyCell>
        </>
    ))

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
        otherProp: '123',
    }

    it('should render the component with it`s props but no children initially', () => {
        render(
            <TableBodyRowExpandable<WithChildren<Data>, undefined>
                RowContentComponent={SampleRowContentComponentMock}
                rowContentProps={sampleData}
                tableProps={undefined}
            />,
        )

        expect(screen.getByText(level1Label)).toBeInTheDocument()
        expect(screen.queryByText(level2Label)).not.toBeInTheDocument()
    })

    it('should show children when first rendering if isDefaultExpanded is true', () => {
        render(
            <TableBodyRowExpandable<WithChildren<Data>, undefined>
                RowContentComponent={SampleRowContentComponentMock}
                rowContentProps={sampleData}
                tableProps={undefined}
                isDefaultExpanded
            />,
        )

        expect(screen.getByText(level1Label)).toBeInTheDocument()
        expect(screen.queryByText(level2Label)).toBeInTheDocument()
    })

    it('should show children 1 level below after clicking expand icon', () => {
        render(
            <TableBodyRowExpandable<WithChildren<Data>, undefined>
                RowContentComponent={SampleRowContentComponentMock}
                rowContentProps={sampleData}
                tableProps={undefined}
            />,
        )

        act(() => {
            userEvent.click(screen.getByRole('cell', { name: 'arrow_right' }))
        })

        expect(screen.queryByText(level2Label)).toBeInTheDocument()
        expect(screen.queryByText(level3Label)).not.toBeInTheDocument()
    })

    it('should show allow expanding all levels and pass common props to each', () => {
        render(
            <TableBodyRowExpandable<WithChildren<Data>, undefined>
                RowContentComponent={SampleRowContentComponentMock}
                rowContentProps={sampleData}
                tableProps={undefined}
            />,
        )

        act(() => {
            userEvent.click(screen.getByRole('cell', { name: 'arrow_right' }))
        })
        act(() => {
            userEvent.click(screen.getByRole('cell', { name: 'arrow_right' }))
        })

        expect(screen.queryByText(level2Label)).toBeInTheDocument()
        expect(screen.queryByText(level3Label)).toBeInTheDocument()
        expect(SampleRowContentComponentMock).toHaveBeenCalledTimes(7)
        expect(SampleRowContentComponentMock).toHaveBeenNthCalledWith(
            7,
            expect.objectContaining({ otherProp: sampleData.otherProp }),
            {},
        )
    })

    it('should hide all levels below', () => {
        render(
            <TableBodyRowExpandable<WithChildren<Data>, undefined>
                RowContentComponent={SampleRowContentComponentMock}
                rowContentProps={sampleData}
                tableProps={undefined}
            />,
        )

        act(() => {
            userEvent.click(screen.getByRole('cell', { name: 'arrow_right' }))
        })
        act(() => {
            userEvent.click(screen.getByRole('cell', { name: 'arrow_right' }))
        })

        expect(screen.queryByText(level2Label)).toBeInTheDocument()
        expect(screen.queryByText(level3Label)).toBeInTheDocument()

        act(() => {
            const topLevelRow = screen.getByRole('row', {
                name: new RegExp(level1Label),
            })
            userEvent.click(
                within(topLevelRow).getByRole('cell', {
                    name: 'arrow_drop_down',
                }),
            )
        })

        expect(screen.queryByText(level2Label)).not.toBeInTheDocument()
        expect(screen.queryByText(level3Label)).not.toBeInTheDocument()
    })

    it('should check if expand cell indent(left) style is applied based on depth level', async () => {
        const { container } = render(
            <TableBodyRowExpandable<WithChildren<Data>, undefined>
                RowContentComponent={SampleRowContentComponentMock}
                rowContentProps={sampleData}
                tableProps={undefined}
            />,
        )
        triggerWidthResize(500)
        rafControl.run()

        act(() => {
            userEvent.click(screen.getByRole('cell', { name: 'arrow_right' }))
        })
        act(() => {
            userEvent.click(screen.getByRole('cell', { name: 'arrow_right' }))
        })

        const expandCells = Array.from(
            container.querySelectorAll('.expandCell'),
        )
        const expandCellLevel0 = 0
        const expandCellLevel1 = 1

        expect((expandCells[expandCellLevel0] as HTMLElement).style?.left).toBe(
            `${MOBILE_COLUMN_WIDTH * expandCellLevel0}px`,
        )
        expect((expandCells[expandCellLevel1] as HTMLElement).style?.left).toBe(
            `${MOBILE_COLUMN_WIDTH * expandCellLevel1}px`,
        )

        triggerWidthResize(1000)
        rafControl.run()

        await waitFor(() => {
            expect(
                (expandCells[expandCellLevel0] as HTMLElement).style?.left,
            ).toBe(`${COLUMN_WIDTH * expandCellLevel0}px`)
            expect(
                (expandCells[expandCellLevel1] as HTMLElement).style?.left,
            ).toBe(`${COLUMN_WIDTH * expandCellLevel1}px`)
        })
    })
})
