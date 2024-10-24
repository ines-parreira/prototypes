import {render} from '@testing-library/react'
import React from 'react'

import useAppDispatch from 'hooks/useAppDispatch'
import {InferredCampaignStatus} from 'models/convert/campaign/types'
import {DEPRECATED_CampaignStatusMultiSelect} from 'pages/stats/convert/components/DEPRECATED_CampaignStatusMultiSelect'

jest.mock('hooks/useAppDispatch', () => jest.fn())
const useAppDispatchMock = useAppDispatch as jest.Mock
useAppDispatchMock.mockReturnValue(jest.fn())

describe('DEPRECATED_CampaignStatusMultiSelect', () => {
    const defaultProps = {
        selected: [],
        onChangeItem: jest.fn(),
    }

    it('should render', () => {
        const {getByText} = render(
            <DEPRECATED_CampaignStatusMultiSelect {...defaultProps} />
        )

        expect(getByText('All statuses')).toBeInTheDocument()
        expect(getByText('Active')).toBeInTheDocument()
        expect(getByText('Inactive')).toBeInTheDocument()
        expect(getByText('Deleted')).toBeInTheDocument()
    })

    it('should call onChangeItem with correct value', () => {
        const {getByText} = render(
            <DEPRECATED_CampaignStatusMultiSelect {...defaultProps} />
        )

        getByText('Active').click()

        expect(defaultProps.onChangeItem).toHaveBeenCalledWith([
            InferredCampaignStatus.Active,
        ])
    })
})
