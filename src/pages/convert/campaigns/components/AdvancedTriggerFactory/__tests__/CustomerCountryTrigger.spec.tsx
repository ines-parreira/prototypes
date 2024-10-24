import {render, act} from '@testing-library/react'
import React from 'react'

import {CampaignTriggerType} from 'pages/convert/campaigns/types/enums/CampaignTriggerType.enum'
import {createTrigger} from 'pages/convert/campaigns/utils/createTrigger'

import {CustomerCountryTrigger} from '../CustomerCountryTrigger'

describe('<CustomerCountryTrigger>', () => {
    it('should render correctly', () => {
        const trigger = createTrigger(CampaignTriggerType.CountryCode)

        const {getByText} = render(
            <CustomerCountryTrigger
                id={trigger.id}
                trigger={trigger}
                onUpdateTrigger={jest.fn()}
                onDeleteTrigger={jest.fn()}
                onTriggerValidationUpdate={jest.fn()}
            />
        )

        act(() => {
            expect(getByText('Visitor location')).toBeInTheDocument()
            expect(getByText('Value is required')).toBeInTheDocument()
        })
    })
})
