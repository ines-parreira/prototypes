import React, {ComponentProps} from 'react'
import {render} from '@testing-library/react'
import _noop from 'lodash/noop'

import {IntentsFeedbackDropdown} from '../IntentsFeedbackDropdown'

const minProps: ComponentProps<typeof IntentsFeedbackDropdown> = {
    label: 'no intent detected',
    messageId: 1,
    availableIntentsNames: [],
    activeIntentsNames: [],
    onToggle: _noop,
    renderAvailableIntent: (intent: string) => {
        return <div key={intent}>{intent}</div>
    },
    renderActiveIntent: (intent: string) => {
        return <div key={intent}>{intent}</div>
    },
}

describe('<IntentsFeedbackDropdown/>', () => {
    beforeEach(() => {
        minProps.availableIntentsNames = []
        minProps.activeIntentsNames = []
    })

    it('should display all the intents available without active intents', () => {
        minProps.availableIntentsNames = ['foo/bar', 'foo/baz']
        const {container} = render(<IntentsFeedbackDropdown {...minProps} />)
        expect(container.firstChild).toMatchSnapshot()
    })
    it('should display all the intents available with active intents', () => {
        minProps.availableIntentsNames = ['foo/bar']
        minProps.activeIntentsNames = ['foo/baz']
        const {container} = render(<IntentsFeedbackDropdown {...minProps} />)
        expect(container.firstChild).toMatchSnapshot()
    })
})
