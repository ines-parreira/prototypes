import {render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React, {ComponentProps} from 'react'
import {fromJS, Map, List} from 'immutable'
import _omit from 'lodash/omit'
import _noop from 'lodash/noop'

import * as ticketFixtures from 'fixtures/ticket'
import {CellContainer} from 'pages/common/components/ViewTable/Table/Cell'
import * as viewsConfig from 'config/views'

describe('ViewTable::Table::Cell', () => {
    const viewConfig = viewsConfig.views.first() as Map<any, any>

    const minProps = {
        config: viewConfig,
        type: viewConfig.get('name'),
        item: fromJS(ticketFixtures.ticket),
        field: (viewConfig.get('fields') as List<any>).first(),
    } as ComponentProps<typeof CellContainer>

    it('should use default props', () => {
        const props = {..._omit(minProps, ['item'])}
        const {container} = render(<CellContainer {...props} />)

        expect(container.firstChild).toMatchSnapshot()
    })

    it('default cell with no click handler passed (cant open items)', () => {
        const {container} = render(<CellContainer {...minProps} />)

        expect(container.firstChild).toMatchSnapshot()
    })

    it('default cell with a url passed', () => {
        const {container} = render(
            <CellContainer {...minProps} itemUrl="/app/ticket/123" />
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('default cell with a click handler passed', () => {
        const {container} = render(
            <CellContainer {...minProps} onClick={_noop} />
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('it should call onClick handler when itemUrl is passed', () => {
        const onClick = jest.fn()

        render(
            <CellContainer
                {...minProps}
                itemUrl="/app/ticket/123"
                onClick={onClick}
            />
        )

        userEvent.click(screen.getByText(ticketFixtures.ticket.subject))

        expect(onClick).toHaveBeenLastCalledWith(minProps.item)
    })
})
