import {render} from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import {fromJS, Map, List} from 'immutable'
import _noop from 'lodash/noop'
import React, {ComponentProps} from 'react'

import * as viewsConfig from '../../../../../../config/views'
import * as agentsFixtures from '../../../../../../fixtures/agents'
import * as ticketFixtures from '../../../../../../fixtures/ticket'
import {RowContainer} from '../Row'

jest.mock(
    'pages/common/components/ViewingIndicator/ViewingIndicator',
    () => () => {
        return <div>ViewingIndicator</div>
    }
)

jest.mock('../Cell', () => () => {
    return <div>Cell</div>
})
describe('ViewTable::Table::Row', () => {
    const viewConfig = viewsConfig.views.first() as Map<any, any>

    const minProps: JSX.LibraryManagedAttributes<
        typeof RowContainer,
        ComponentProps<typeof RowContainer>
    > = {
        type: viewConfig.get('name'),
        fields: (viewConfig.get('fields') as List<any>).take(3) as List<any>,
        item: fromJS(ticketFixtures.ticket),
        isSelected: false,
        getAgentsViewing: jest.fn().mockReturnValue(fromJS([])),
        toggleIdInSelectedItemsIds: jest.fn(),
        itemUrl: '/app/ticket/123',
        onItemClick: _noop,
        hasCursor: false,
    }

    describe('default row', () => {
        it('displays', () => {
            const {getAllByText, container} = render(
                <RowContainer {...minProps} />
            )
            expect(container.querySelector('input')).toBeInTheDocument()
            expect(getAllByText('Cell')[0]).toBeInTheDocument()
        })

        it('toggle delete confirmation', () => {
            const {container} = render(<RowContainer {...minProps} />)
            userEvent.click(container.querySelector('input') as Element)
            expect(minProps.toggleIdInSelectedItemsIds).toBeCalled()
        })
    })

    it('display agents viewing', () => {
        ;(
            minProps.getAgentsViewing as jest.MockedFunction<
                typeof minProps.getAgentsViewing
            >
        ).mockReturnValueOnce(fromJS(agentsFixtures.agents))
        const {getByText} = render(
            <RowContainer
                {...minProps}
                item={(fromJS(ticketFixtures.ticket) as Map<any, any>).set(
                    'id',
                    1
                )}
            />
        )
        expect(getByText('ViewingIndicator')).toBeInTheDocument()
    })
})
