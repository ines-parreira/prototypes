import React, {ComponentProps} from 'react'
import {render} from '@testing-library/react'
import _noop from 'lodash/noop'

import IntentsSentimentsSelect from '../IntentsSentimentsSelect'

const minProps: ComponentProps<typeof IntentsSentimentsSelect> = {
    options: ['foo', 'bar'],
    deprecatedOptions: [],
    hiddenOptions: [],
    values: [],
    singular: 'intent',
    plural: 'intents',
    onChange: _noop,
}

describe('<IntentsSentimentsSelect />', () => {
    it('should render component with no selected items', () => {
        const {container} = render(<IntentsSentimentsSelect {...minProps} />)
        expect(container.firstChild).toMatchSnapshot()
    })
    it('should render component with selected item', () => {
        const {container} = render(
            <IntentsSentimentsSelect {...minProps} values={['bar']} />
        )
        expect(container.firstChild).toMatchSnapshot()
    })
    it('should render component with deprecated item', () => {
        const {container} = render(
            <IntentsSentimentsSelect
                {...minProps}
                deprecatedOptions={['foo']}
            />
        )
        expect(container.firstChild).toMatchSnapshot()
    })
    it('should render component with deprecated item selected', () => {
        const {container} = render(
            <IntentsSentimentsSelect
                {...minProps}
                deprecatedOptions={['foo']}
                values={['foo']}
            />
        )
        expect(container.firstChild).toMatchSnapshot()
    })
})
