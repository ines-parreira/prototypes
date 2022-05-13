import React from 'react'
import {render} from '@testing-library/react'

import Wizard from '../Wizard'
import WizardStep from '../WizardStep'

describe('<WizardStep />', () => {
    it('should render', () => {
        const {container} = render(
            <Wizard startAt="bar" steps={['foo', 'bar']}>
                <WizardStep name="foo">Foo</WizardStep>

                <WizardStep name="bar">Bar</WizardStep>
            </Wizard>
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should throw an error if not used inside a WizardContextProvider', () => {
        expect(() => render(<WizardStep name="foo" />)).toThrow()
    })
})
