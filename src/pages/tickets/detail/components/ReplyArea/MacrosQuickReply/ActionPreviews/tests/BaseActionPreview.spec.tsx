import React, {ComponentProps} from 'react'
import {render} from '@testing-library/react'

import {BaseActionPreview} from '../BaseActionPreview'

describe('<BaseActionPreview />', () => {
    const minProps: ComponentProps<typeof BaseActionPreview> = {
        actionName: 'test action',
        children: <div>foo</div>,
    }
    it('should render the component', () => {
        const {container} = render(<BaseActionPreview {...minProps} />)

        expect(container.firstChild).toMatchSnapshot()
    })
})
