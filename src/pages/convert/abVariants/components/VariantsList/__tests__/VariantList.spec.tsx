import React from 'react'
import {render} from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import {variants} from 'fixtures/abGroup'

import VariantsList from '../VariantList'

describe('<VariantsList />', () => {
    const onDelete = jest.fn()
    const onDuplicate = jest.fn()

    it('render and user can performa basic actions', () => {
        const {getByText, getByTestId} = render(
            <VariantsList
                variants={[]}
                onDelete={onDelete}
                onDuplicate={onDuplicate}
            />
        )

        expect(getByText('Control Variant')).toBeInTheDocument()

        const deleteBtn = getByTestId('delete-icon-button')
        expect(deleteBtn).toHaveAttribute('aria-disabled', 'true')

        const duplicateBtn = getByTestId('duplicate-icon-button')
        userEvent.click(duplicateBtn)

        expect(onDuplicate).toBeCalledWith(null)
    })

    it('render and list actions shoould be disabled', () => {
        const {getAllByTestId} = render(
            <VariantsList
                variants={variants}
                onDelete={onDelete}
                onDuplicate={onDuplicate}
            />
        )

        const deleteButtons = getAllByTestId('delete-icon-button')
        expect(deleteButtons).toHaveLength(3)

        deleteButtons.forEach((element, idx) => {
            // First element is 'control version'
            expect(element).toHaveAttribute(
                'aria-disabled',
                idx === 0 ? 'true' : 'false'
            )
        })

        const duplicateButtons = getAllByTestId('duplicate-icon-button')
        expect(duplicateButtons).toHaveLength(3)

        duplicateButtons.forEach((element) => {
            expect(element).toHaveAttribute('aria-disabled', 'true')
        })
    })
})
