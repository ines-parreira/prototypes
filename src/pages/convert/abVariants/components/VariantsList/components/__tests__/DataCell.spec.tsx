import React from 'react'

import {render} from '@testing-library/react'

import useGetDateAndTimeFormat from 'hooks/useGetDateAndTimeFormat'

import {ABGroupValueFormat} from 'pages/convert/abVariants/components/VariantsList/types'

import DataCell from '../DataCell'

jest.mock('hooks/useGetDateAndTimeFormat')

const mockUseGetDateAndTimeFormat = jest.mocked(useGetDateAndTimeFormat)

mockUseGetDateAndTimeFormat.mockReturnValue('MM/DD/YYYY')

describe('<DataCell />', () => {
    it('renders percent', () => {
        const {getByText} = render(
            <DataCell
                isLoading={false}
                data={3}
                format={ABGroupValueFormat.Percentage}
            />
        )

        expect(getByText('3%')).toBeInTheDocument()
    })

    it('renders number', () => {
        const {getByText} = render(
            <DataCell
                isLoading={false}
                data={3}
                format={ABGroupValueFormat.Number}
            />
        )

        expect(getByText('3')).toBeInTheDocument()
    })

    it.each([
        {
            value: '2024-08-10',
            expected: '08/10/2024',
        },
        {
            value: undefined,
            expected: '-',
        },
    ])('renders date', ({value, expected}) => {
        const {getByText} = render(
            <DataCell
                isLoading={false}
                data={value}
                format={ABGroupValueFormat.Date}
            />
        )

        expect(getByText(expected)).toBeInTheDocument()
    })
})
