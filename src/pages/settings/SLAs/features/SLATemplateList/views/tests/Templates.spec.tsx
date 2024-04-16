import React from 'react'
import {render} from '@testing-library/react'

import {TEMPLATES_LIST} from '../config'
import Templates from '../Templates'

describe('<Templates />', () => {
    it('should display the templates', () => {
        const {getByText} = render(<Templates templates={TEMPLATES_LIST} />)

        expect(getByText(TEMPLATES_LIST[0].name)).toBeInTheDocument()
        expect(getByText(TEMPLATES_LIST[1].name)).toBeInTheDocument()
        expect(getByText(/Create SLA/i)).toBeInTheDocument()
    })

    it('should display a `See All Templates` button link', () => {
        const {getByText} = render(
            <Templates templates={TEMPLATES_LIST} showSeeAllTemplates />
        )

        expect(getByText(/See All Templates/i)).toBeInTheDocument()
    })
})
