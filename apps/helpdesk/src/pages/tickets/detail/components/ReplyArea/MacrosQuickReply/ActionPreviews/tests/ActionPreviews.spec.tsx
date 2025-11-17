import type { ComponentProps } from 'react'
import React from 'react'

import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { setOpenStatusAction, setTextAction } from 'fixtures/macro'
import type { RootState, StoreDispatch } from 'state/types'

import { ActionPreviews } from '../ActionPreviews'

jest.mock('draft-js/lib/generateRandomKey', () => () => '42')

const mockPreview = 'Preview'
jest.mock('pages/tickets/common/macros/Preview/Preview', () => ({
    Preview: () => <>{mockPreview}</>,
}))

describe('<ActionPreviews />', () => {
    const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([
        thunk,
    ])
    let store = mockStore({})
    const minProps: ComponentProps<typeof ActionPreviews> = {
        textPreviewMinWidth: 200,
        actions: [],
    }

    beforeEach(() => {
        store = mockStore({})
    })

    it.each([
        ['set text action', [setTextAction], [mockPreview]],
        [
            'other type of action',
            [setOpenStatusAction],
            [setOpenStatusAction.title],
        ],
        [
            'both set text action and other type of action',
            [setTextAction, setOpenStatusAction],
            [mockPreview, setOpenStatusAction.title],
        ],
    ])('should render %s ', (_, actions, expectedTexts) => {
        render(
            <Provider store={store}>
                <ActionPreviews {...minProps} actions={actions} />
            </Provider>,
        )

        expectedTexts.forEach((text) => {
            expect(screen.getByText(text)).toBeInTheDocument()
        })
    })
})
