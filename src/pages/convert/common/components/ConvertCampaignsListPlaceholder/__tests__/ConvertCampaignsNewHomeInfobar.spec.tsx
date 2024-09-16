import React from 'react'
import {fireEvent, render, screen} from '@testing-library/react'

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
        render(<ConvertCampaignsNewHomeInfobar integrationId={integrationId} />)

        expect(
            screen.getByText('Campaigns have a new home!')
        ).toBeInTheDocument()
    })

    it('should render the component with the infobar closed', () => {
        useLocalStorageSpy.mockReturnValue([true, jest.fn()])

        render(<ConvertCampaignsNewHomeInfobar integrationId={integrationId} />)

        expect(
            screen.queryByText('Campaigns have a new home!')
        ).not.toBeInTheDocument()
    })

    it('should render the component with the infobar opened and the close button should work', () => {
        const setClosedFn = jest.fn()
        useLocalStorageSpy.mockReturnValue([false, setClosedFn])

        render(<ConvertCampaignsNewHomeInfobar integrationId={integrationId} />)

        expect(
            screen.getByText('Campaigns have a new home!')
        ).toBeInTheDocument()

        fireEvent.click(screen.getByAltText('dismiss-icon'))

        expect(setClosedFn).toHaveBeenCalled()
    })
})
