import React from 'react'

import { screen } from '@testing-library/react'

import { visualBuilderGraphSimpleChoicesFixture } from 'pages/automate/workflows/tests/visualBuilderGraph.fixtures'
import { renderWithQueryClientProvider } from 'tests/reactQueryTestingUtils'

import VisualBuilderTemplatePreview from '../VisualBuilderTemplatePreview'

describe('<VisualBuilderTemplatePreview />', () => {
    it('should render template preview', () => {
        renderWithQueryClientProvider(
            <VisualBuilderTemplatePreview
                visualBuilderGraph={visualBuilderGraphSimpleChoicesFixture}
            />,
        )

        expect(screen.getByText('entrypoint')).toBeInTheDocument()
    })
})
