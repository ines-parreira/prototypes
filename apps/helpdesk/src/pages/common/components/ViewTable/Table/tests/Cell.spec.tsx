import React from 'react'

import { userEvent } from '@repo/testing'
import { fireEvent, render, screen } from '@testing-library/react'
import { fromJS, List, Map } from 'immutable'
import _omit from 'lodash/omit'

import { views } from 'config/views'
import { ticket } from 'fixtures/ticket'
import Cell from 'pages/common/components/ViewTable/Table/Cell'

describe('ViewTable::Table::Cell', () => {
    const viewConfig = views.first() as Map<any, any>

    const minProps = {
        config: viewConfig,
        type: viewConfig.get('name'),
        item: fromJS(ticket),
        field: (viewConfig.get('fields') as List<any>).first(),
    }

    it('should use default props', () => {
        const props = { ..._omit(minProps, ['item']) }
        const { container } = render(<Cell {...props} />)

        expect(container.firstChild).toMatchSnapshot()
    })

    it("renders cell with no click handler passed (can't open items)", () => {
        render(<Cell {...minProps} />)

        expect(screen.getByText(ticket.subject)).toBeInTheDocument()
    })

    it('renders cell with a url passed', () => {
        render(<Cell {...minProps} itemUrl="/app/ticket/123" />)

        expect(document.querySelectorAll('a')).toHaveLength(1)
    })

    it('renders cell with a click handler passed', () => {
        const onClick = jest.fn()
        render(<Cell {...minProps} onClick={onClick} />)

        fireEvent.click(screen.getByText(ticket.subject))
        expect(onClick).toHaveBeenCalledWith(minProps.item)
    })

    it('should call onClick handler when itemUrl is passed', () => {
        const onClick = jest.fn()
        render(
            <Cell {...minProps} itemUrl="/app/ticket/123" onClick={onClick} />,
        )

        userEvent.click(screen.getByText(ticket.subject))
        expect(onClick).toHaveBeenLastCalledWith(minProps.item)
    })

    it('should set colSpan when provided', () => {
        const { container } = render(<Cell {...minProps} colSpan={2} />)
        const td = container.querySelector('td')

        expect(td).toHaveAttribute('colSpan', '2')
    })
})
