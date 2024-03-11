import React from 'react'
import {fireEvent, render} from '@testing-library/react'
import * as useLocalStorageNewHome from 'hooks/useLocalStorage'
import ConvertCampaignsNewHomeInfobar from '../ConvertCampaignsNewHomeInfobar'

const useLocalStorageSpy = jest.spyOn(
    useLocalStorageNewHome,
    'default'
) as jest.Mock

describe('<ConvertCampaignsNewHomeInfobar/>', () => {
    const integrationId = '123'

    beforeEach(() => {
        useLocalStorageSpy.mockReturnValue([false, jest.fn()])
    })

    it('should render the component', () => {
        const {getByText} = render(
            <ConvertCampaignsNewHomeInfobar integrationId={integrationId} />
        )

        expect(getByText('Campaigns have a new home!')).toBeInTheDocument()
    })

    it('should render the component with the infobar closed', () => {
        useLocalStorageSpy.mockReturnValue([true, jest.fn()])

        const {queryByText} = render(
            <ConvertCampaignsNewHomeInfobar integrationId={integrationId} />
        )

        expect(
            queryByText('Campaigns have a new home!')
        ).not.toBeInTheDocument()
    })

    it('should render the component with the infobar opened and the close button should work', () => {
        const setClosedFn = jest.fn()
        useLocalStorageSpy.mockReturnValue([false, setClosedFn])

        const {getByText, getByTestId} = render(
            <ConvertCampaignsNewHomeInfobar integrationId={integrationId} />
        )

        expect(getByText('Campaigns have a new home!')).toBeInTheDocument()

        fireEvent.click(getByTestId('dismiss-campaigns-new-home-infobar'))

        expect(setClosedFn).toHaveBeenCalled()
    })
})
