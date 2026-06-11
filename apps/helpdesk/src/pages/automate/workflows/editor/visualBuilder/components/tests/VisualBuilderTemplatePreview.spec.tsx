import React from 'react'

import { render } from '@repo/testing'
import { screen } from '@testing-library/react'

import { visualBuilderGraphSimpleChoicesFixture } from 'pages/automate/workflows/tests/visualBuilderGraph.fixtures'

import { DefaultExportVisualBuilderTemplatePreview as VisualBuilderTemplatePreview } from '../VisualBuilderTemplatePreview'

describe('<VisualBuilderTemplatePreview />', () => {
    it('should render template preview', () => {
        render(
            <VisualBuilderTemplatePreview
                visualBuilderGraph={visualBuilderGraphSimpleChoicesFixture}
            />,
        )

        expect(screen.getByText('entrypoint')).toBeInTheDocument()
    })
})
