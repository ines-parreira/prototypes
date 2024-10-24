import {render, screen} from '@testing-library/react'
import React from 'react'

import {visualBuilderGraphSimpleChoicesFixture} from 'pages/automate/workflows/tests/visualBuilderGraph.fixtures'

import VisualBuilderTemplatePreview from '../VisualBuilderTemplatePreview'

describe('<VisualBuilderTemplatePreview />', () => {
    it('should render template preview', () => {
        render(
            <VisualBuilderTemplatePreview
                visualBuilderGraph={visualBuilderGraphSimpleChoicesFixture}
            />
        )

        expect(screen.getByText('entrypoint')).toBeInTheDocument()
    })
})
