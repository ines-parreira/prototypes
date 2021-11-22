import React, {ComponentProps} from 'react'
import {shallow, ShallowWrapper} from 'enzyme'
import {fromJS, Map, List} from 'immutable'
import _noop from 'lodash/noop'

import * as viewsConfig from '../../../../../../config/views'
import * as ticketFixtures from '../../../../../../fixtures/ticket'
import * as agentsFixtures from '../../../../../../fixtures/agents'
import {RowContainer} from '../Row'

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

    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('default row', () => {
        let component: ShallowWrapper<
            ComponentProps<typeof RowContainer>,
            any,
            RowContainer
        >
        beforeEach(() => {
            component = shallow(<RowContainer {...minProps} />)
        })

        it('displays', () => {
            expect(component).toMatchSnapshot()
        })

        it('toggle delete confirmation', () => {
            component.instance()._toggleSelection()
            expect(minProps.toggleIdInSelectedItemsIds).toBeCalled()
        })
    })

    it('display agents viewing', () => {
        ;(
            minProps.getAgentsViewing as jest.MockedFunction<
                typeof minProps.getAgentsViewing
            >
        ).mockReturnValueOnce(fromJS(agentsFixtures.agents))
        const component = shallow(
            <RowContainer
                {...minProps}
                item={(fromJS(ticketFixtures.ticket) as Map<any, any>).set(
                    'id',
                    1
                )}
            />
        )
        expect(component).toMatchSnapshot()
    })
})
