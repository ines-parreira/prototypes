import { screen } from '@testing-library/react'

import {
    nodeHelpers,
    renderVisualBuilder,
} from 'pages/automate/workflows/utils/testVisualBuilderScaffolding'

describe('<FileUploadNode />', () => {
    describe('Basic rendering', () => {
        it('should render a file upload node with content', () => {
            renderVisualBuilder({
                builderType: 'workflow',
                nodes: [
                    nodeHelpers.fileUpload('Please upload your receipt'),
                    nodeHelpers.end(),
                ],
            })

            expect(
                screen.getByText('Please upload your receipt'),
            ).toBeInTheDocument()
        })
    })
})
