import {fromJS, Map} from 'immutable'
import React from 'react'
import {render} from '@testing-library/react'
import _noop from 'lodash/noop'

import * as viewsConfig from '../../../../../../config/views'
import * as viewsFixtures from '../../../../../../fixtures/views'

import {ViewSelectionContainer} from '../ViewSelection'

describe('<ViewSelection/>', () => {
    const viewConfig = viewsConfig.views.first() as Map<any, any>

    const minProps = {
        colSize: 5,
        selectedCount: 30,
        viewSelected: false,
        onSelectViewClick: _noop,
        type: viewConfig.get('name'),
        activeView: fromJS(viewsFixtures.view),
        getViewCount: () => {
            return 100
        },
        dirtyView: false,
        dispatch: jest.fn(),
    }

    describe('render()', () => {
        it('should render the component when only elements on the active view are selected', () => {
            const {container} = render(<ViewSelectionContainer {...minProps} />)

            expect(container.firstChild).toMatchSnapshot()
        })

        it('should render the component for an entire view selection', () => {
            const {container} = render(
                <ViewSelectionContainer {...minProps} viewSelected={true} />
            )
            expect(container.firstChild).toMatchSnapshot()
        })
    })
})
