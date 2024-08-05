import React from 'react'
import {render} from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import VariantsList from '../VariantList'

describe('<VariantsList />', () => {
    it('render and user can performa basic actions', () => {
        const consoleLogMock = jest.spyOn(console, 'log')

        const {getByText, getByTestId} = render(<VariantsList />)

        expect(getByText('Control Variant')).toBeInTheDocument()

        const deleteBtn = getByTestId('delete-icon-button')
        userEvent.click(deleteBtn)

        expect(consoleLogMock).toBeCalledWith('deleting variant')

        const duplicateBtn = getByTestId('duplicate-icon-button')
        userEvent.click(duplicateBtn)

        expect(consoleLogMock).toBeCalledWith('duplicating variant')
    })
})
