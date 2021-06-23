import React, {ComponentProps} from 'react'
import {Provider} from 'react-redux'
import thunk from 'redux-thunk'
import configureMockStore from 'redux-mock-store'
import {render} from '@testing-library/react'
import {fromJS} from 'immutable'

import {addTagsAction} from '../../../../../../../../fixtures/macro'
import {TagActionPreview} from '../TagActionPreview'
import {RootState, StoreDispatch} from '../../../../../../../../state/types'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])
describe('<TagPreviewContainer/>', () => {
    const minProps: ComponentProps<typeof TagActionPreview> = {
        action: addTagsAction,
    }

    const state: Partial<RootState> = {
        tags: fromJS({
            items: [
                {name: 'refund'},
                {name: 'billing'},
                {
                    name: 'refund accepted',
                    decoration: fromJS({color: '#dedede'}),
                },
            ],
        }),
    }

    const store = mockStore(state)

    it('should render tags', () => {
        const {container} = render(
            <Provider store={store}>
                <TagActionPreview {...minProps} />
            </Provider>
        )
        expect(container.firstChild).toMatchSnapshot()
    })
})
