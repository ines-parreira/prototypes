import type { ComponentProps } from 'react'
import React from 'react'

import { render, screen } from '@testing-library/react'

import { RuleTemplateRecipeSlugs } from '../../../constants'
import { DefaultModal } from '../DefaultModal'

describe('<DefaultModal/>', () => {
    const minProps: ComponentProps<typeof DefaultModal> = {
        recipeSlug: RuleTemplateRecipeSlugs.ReopenLowCSATAiAgent,
        triggeredCount: 10,
        viewCreationCheckbox: () => <>view creation checkbox</>,
    }

    it('should render the low csat ai agent template description', () => {
        render(<DefaultModal {...minProps} />)

        expect(
            screen.getByText(/re-opens closed tickets handled by ai agent/i),
        ).toBeInTheDocument()
        expect(
            screen.getByText(/route poor ai agent experiences/i),
        ).toBeInTheDocument()
    })
})
