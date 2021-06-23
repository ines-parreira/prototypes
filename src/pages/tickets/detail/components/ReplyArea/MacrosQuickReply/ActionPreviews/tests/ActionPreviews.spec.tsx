import React, {ComponentProps} from 'react'
import {render} from '@testing-library/react'

import {ActionPreviews} from '../ActionPreviews'

import {
    setStatusAction,
    setTextAction,
} from '../../../../../../../../fixtures/macro'

jest.mock('draft-js/lib/generateRandomKey', () => () => '42')

describe('<ActionPreviews />', () => {
    const minProps: ComponentProps<typeof ActionPreviews> = {
        textPreviewMinWidth: 200,
        actions: [],
    }
    it.each([
        ['set text action', [setTextAction]],
        ['other type of action', [setStatusAction]],
        [
            'both set text action and other type of action',
            [setTextAction, setStatusAction],
        ],
    ])('should render %s ', (_, actions) => {
        const {container} = render(
            <ActionPreviews {...minProps} actions={actions} />
        )
        expect(container.firstChild).toMatchSnapshot()
    })
})
