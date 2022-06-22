import React, {ComponentProps} from 'react'
import {fireEvent, render} from '@testing-library/react'
import _noop from 'lodash/noop'

import {IntentsFeedbackDropdown} from '../IntentsFeedbackDropdown'

const minProps: ComponentProps<typeof IntentsFeedbackDropdown> = {
    label: 'no intent detected',
    activeIntentsNames: [],
    onToggle: _noop,
    renderActiveIntent: (intent: string) => {
        return <div key={intent}>{intent}</div>
    },
}

describe('<IntentsFeedbackDropdown/>', () => {
    beforeEach(() => {
        minProps.activeIntentsNames = []
    })

    it('should display all the intents available without active intents', () => {
        const {container} = render(<IntentsFeedbackDropdown {...minProps} />)
        expect(container.firstChild).toMatchSnapshot()
    })
    it('should display all the intents available with active intents', () => {
        minProps.activeIntentsNames = ['foo/baz']
        const {container} = render(<IntentsFeedbackDropdown {...minProps} />)
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should hide the dropdown on mouse leave', () => {
        const {getByRole, findByRole} = render(
            <IntentsFeedbackDropdown
                {...minProps}
                activeIntentsNames={['foo/baz']}
            />
        )

        fireEvent.click(getByRole('button'))
        fireEvent.mouseLeave(getByRole('button'))

        expect(findByRole('menu', {hidden: true})).not.toBe(null)
    })
})
