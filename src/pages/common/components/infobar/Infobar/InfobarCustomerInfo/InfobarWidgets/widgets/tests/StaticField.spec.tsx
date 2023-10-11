import {render} from '@testing-library/react'
import React from 'react'

import {StaticField} from '../StaticField'

describe('<StaticField/>', () => {
    describe('render()', () => {
        it('should render with label', () => {
            const {container} = render(
                <StaticField label="Label">foo</StaticField>
            )

            expect(container.firstChild).toMatchSnapshot()
        })

        it('should render without label', () => {
            const {container} = render(<StaticField>foo</StaticField>)

            expect(container.firstChild).toMatchSnapshot()
        })
    })
})
