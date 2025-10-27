import { render } from '@testing-library/react'

import { CampaignPreferences } from '../CampaignPreferences'

describe('CampaignPreferences', () => {
    it('should render correctly', () => {
        const { getByText } = render(
            <CampaignPreferences
                isNoReply={false}
                triggers={{}}
                onChangeNoReply={jest.fn()}
                onChangeIncognitoVisitor={jest.fn()}
            />,
        )

        expect(
            getByText('Customers can reply to this campaign'),
        ).toBeInTheDocument()
    })
})
