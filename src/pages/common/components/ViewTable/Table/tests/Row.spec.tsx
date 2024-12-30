import {render} from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import {fromJS, Map, List} from 'immutable'
import _noop from 'lodash/noop'
import React, {ComponentProps} from 'react'

import useAgentsViewing from 'hooks/realtime/useAgentsViewing'
import useAppDispatch from 'hooks/useAppDispatch'
import {scrollToReactNode} from 'pages/common/utils/keyboard'
import * as viewsActions from 'state/views/actions'

import * as viewsConfig from '../../../../../../config/views'
import * as agentsFixtures from '../../../../../../fixtures/agents'
import * as ticketFixtures from '../../../../../../fixtures/ticket'

import Row from '../Row'

jest.mock(
    'pages/common/components/ViewingIndicator/ViewingIndicator',
    () => () => {
        return <div>ViewingIndicator</div>
    }
)

jest.mock('../Cell', () => () => {
    return <div>Cell</div>
})

jest.mock('hooks/useAppDispatch')
jest.mock('state/views/actions')
const mockUseAppDispatch = useAppDispatch as jest.Mock

jest.mock('pages/common/utils/keyboard')
const mockScrollToReactNode = scrollToReactNode as jest.Mock

jest.mock('hooks/realtime/useAgentsViewing')
const mockUseAgentsViewing = useAgentsViewing as jest.Mock

describe('ViewTable::Table::Row', () => {
    const viewConfig = viewsConfig.views.first() as Map<any, any>

    const minProps: ComponentProps<typeof Row> = {
        type: viewConfig.get('name'),
        fields: (viewConfig.get('fields') as List<any>).take(3) as List<any>,
        item: fromJS(ticketFixtures.ticket),
        isSelected: false,
        itemUrl: '/app/ticket/123',
        onItemClick: _noop,
        hasCursor: false,
        selectable: true,
    }

    beforeEach(() => {
        mockUseAppDispatch.mockReturnValue(jest.fn())
        mockUseAgentsViewing.mockReturnValue({agentsViewing: []})
    })

    describe('default row', () => {
        it('displays', () => {
            const {getAllByText, container} = render(<Row {...minProps} />)
            expect(container.querySelector('input')).toBeInTheDocument()
            expect(getAllByText('Cell')[0]).toBeInTheDocument()
        })

        it('toggle delete confirmation', () => {
            const {container} = render(<Row {...minProps} />)
            userEvent.click(container.querySelector('input') as Element)
            expect(viewsActions.toggleIdInSelectedItemsIds).toHaveBeenCalled()
        })

        it('does not scroll to row if cursor is not present', () => {
            render(<Row {...minProps} />)
            expect(mockScrollToReactNode).not.toHaveBeenCalled()
        })

        it('scrolls to row', () => {
            render(<Row {...minProps} hasCursor={true} />)
            expect(mockScrollToReactNode).toHaveBeenCalled()
        })
    })

    it('display agents viewing', () => {
        mockUseAgentsViewing.mockReturnValue({
            agentsViewing: agentsFixtures.agents,
        })
        const {getByText} = render(
            <Row
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
