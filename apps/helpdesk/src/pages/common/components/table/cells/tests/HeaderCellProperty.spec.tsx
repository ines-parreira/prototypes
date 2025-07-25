import { render, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'

import { OrderDirection } from 'models/api/types'
import HeaderCellProperty from 'pages/common/components/table/cells/HeaderCellProperty'

describe('<HeaderCellProperty/>', () => {
    const minProps = {
        title: 'foo',
    }

    it('should render', () => {
        render(<HeaderCellProperty {...minProps} className="foo" />)

        expect(screen.getByText(minProps.title)).toBeInTheDocument()
    })

    it('should render children', () => {
        render(<HeaderCellProperty {...minProps}>Bar</HeaderCellProperty>)

        expect(screen.getByText('Bar')).toBeInTheDocument()
    })

    it('should render sorted property', () => {
        render(
            <HeaderCellProperty
                {...minProps}
                direction={OrderDirection.Asc}
                isOrderedBy
            />,
        )

        expect(screen.getByText('arrow_upward')).toBeInTheDocument()
    })

    it('should call onClick when clicked', async () => {
        const user = userEvent.setup()
        const onClick = jest.fn()

        render(<HeaderCellProperty {...minProps} onClick={onClick} />)
        user.click(screen.getByRole('columnheader'))

        await waitFor(() => {
            expect(onClick).toHaveBeenCalled()
        })
    })
})
