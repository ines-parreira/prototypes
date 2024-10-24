import {render} from '@testing-library/react'
import React from 'react'

import SummaryHeader from '../SummaryHeader'

describe('SummaryHeader', () => {
    it('renders with no selected reason', () => {
        const {container} = render(
            <SummaryHeader periodEnd={'February 14, 2024'} />
        )

        expect(container).toHaveTextContent(
            "Once you confirm cancellation, you'll continue to have full access" +
                ' until the end of your billing cycle on February 14, 2024.'
        )

        const periodEndElement = container.querySelector('.body-semibold')
        expect(periodEndElement).toHaveTextContent('February 14, 2024')
    })
})
