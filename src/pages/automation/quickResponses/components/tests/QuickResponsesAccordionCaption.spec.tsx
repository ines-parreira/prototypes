import React from 'react'
import {render} from '@testing-library/react'

import QuickResponsesAccordionCaption from '../QuickResponsesAccordionCaption'

describe('<QuickResponsesAccordionCaption />', () => {
    it('should render the caption component', () => {
        const {container} = render(<QuickResponsesAccordionCaption />)

        expect(container).toMatchSnapshot()
    })
})
