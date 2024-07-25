import React from 'react'
import {render} from '@testing-library/react'
import useAppDispatch from 'hooks/useAppDispatch'
import {InferredCampaignStatus} from 'models/convert/campaign/types'
import {CampaignStatusMultiSelect} from '../CampaignStatusMultiSelect'

jest.mock('hooks/useAppDispatch', () => jest.fn())
const useAppDispatchMock = useAppDispatch as jest.Mock
useAppDispatchMock.mockReturnValue(jest.fn())

describe('CampaignStatusMultiSelect', () => {
    const defaultProps = {
        selected: [],
        onChangeItem: jest.fn(),
    }

    it('should render', () => {
        const {getByText} = render(
            <CampaignStatusMultiSelect {...defaultProps} />
        )

        expect(getByText('All statuses')).toBeInTheDocument()
        expect(getByText('Active')).toBeInTheDocument()
        expect(getByText('Inactive')).toBeInTheDocument()
        expect(getByText('Deleted')).toBeInTheDocument()
    })

    it('should call onChangeItem with correct value', () => {
        const {getByText} = render(
            <CampaignStatusMultiSelect {...defaultProps} />
        )

        getByText('Active').click()

        expect(defaultProps.onChangeItem).toHaveBeenCalledWith([
            InferredCampaignStatus.Active,
        ])
    })
})
