import React from 'react'

import { act, fireEvent, screen } from '@testing-library/react'

import { renderWithStore } from 'utils/testing'

import { DateConditionType } from '../DateConditionType'

describe('<DateConditionType />', () => {
    it('should render greaterThan/lessThan disabled date condition ', () => {
        renderWithStore(
            <DateConditionType
                condition={{
                    lessThan: [{ var: '' }, '2024-08-28T18:46:09.178Z'],
                }}
                onChange={jest.fn()}
                isDisabled
            />,
            {},
        )

        expect(screen.getByDisplayValue('Aug 28, 2024')).toBeDisabled()
    })

    it('should render greaterThanInterval/lessThanInterval disabled date condition ', () => {
        renderWithStore(
            <DateConditionType
                condition={{
                    greaterThanInterval: [{ var: '' }, '-1d'],
                }}
                onChange={jest.fn()}
                isDisabled
            />,
            {},
        )

        expect(screen.getByDisplayValue('1')).toBeDisabled()

        act(() => {
            fireEvent.click(screen.getAllByText('arrow_drop_down')[0])
        })

        expect(
            screen.getAllByRole('menu', { hidden: true })[0],
        ).toHaveAttribute('aria-hidden', 'true')

        act(() => {
            fireEvent.click(screen.getAllByText('arrow_drop_down')[1])
        })

        expect(
            screen.getAllByRole('menu', { hidden: true })[1],
        ).toHaveAttribute('aria-hidden', 'true')
    })
})
