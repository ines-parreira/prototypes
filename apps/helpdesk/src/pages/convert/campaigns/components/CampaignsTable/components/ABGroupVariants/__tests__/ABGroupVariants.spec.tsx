import { variants as variantFixture } from 'fixtures/abGroup'
import { renderWithRouter } from 'utils/testing'

import ABGroupVariants from '../ABGroupVariants'

describe('<ABGroupVariants />', () => {
    it('renders', () => {
        const { getByText } = renderWithRouter(
            <ABGroupVariants
                variants={variantFixture}
                integrationId="3"
                campaignId="23346ZZ6BTW3EMDE8BF6ACH2A1"
            />,
        )

        expect(getByText('Control Variant')).toBeInTheDocument()
        expect(getByText('Variant A')).toBeInTheDocument()
        expect(getByText('Variant B')).toBeInTheDocument()
    })
})
