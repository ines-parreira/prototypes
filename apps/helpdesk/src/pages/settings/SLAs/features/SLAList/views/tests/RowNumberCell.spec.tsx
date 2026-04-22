import { renderWithRouter } from 'utils/testing'

import RowNumberCell from '../RowNumberCell'

describe('<RowNumberCell />', () => {
    it('should render the 1-based row number for the first row', () => {
        const { getByText } = renderWithRouter(<RowNumberCell rowIndex={0} />)

        expect(getByText('1')).toBeInTheDocument()
    })

    it('should render the 1-based row number for a later row', () => {
        const { getByText } = renderWithRouter(<RowNumberCell rowIndex={4} />)

        expect(getByText('5')).toBeInTheDocument()
    })
})
