import {render} from '@testing-library/react'
import React from 'react'

import RuleSelect from '../RuleSelect'

describe('<RuleSelect/>', () => {
    it('should display the placeholder when no label is passed', () => {
        const {container} = render(
            <RuleSelect valueLabel={null}>
                <RuleSelect.Option onClick={jest.fn()} value="foo">
                    foo
                </RuleSelect.Option>
            </RuleSelect>
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should display the label of the selected value', () => {
        const {container} = render(
            <RuleSelect valueLabel="Foo">
                <RuleSelect.Option onClick={jest.fn()} value="foo">
                    foo
                </RuleSelect.Option>
            </RuleSelect>
        )

        expect(container.firstChild).toMatchSnapshot()
    })
})
