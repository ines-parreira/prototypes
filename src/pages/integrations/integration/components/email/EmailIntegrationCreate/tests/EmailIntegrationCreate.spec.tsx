import React from 'react'
import {render} from '@testing-library/react'
import {MemoryRouter} from 'react-router-dom'

import useAppSelector from 'hooks/useAppSelector'

import EmailIntegrationCreate from '../EmailIntegrationCreate'

jest.mock('hooks/useAppSelector', () => jest.fn())

const useAppSelectorMock = useAppSelector as jest.Mock

const renderComponent = () =>
    render(
        <MemoryRouter>
            <EmailIntegrationCreate />
        </MemoryRouter>
    )

describe('<EmailIntegrationCreate/>', () => {
    beforeEach(() => {
        useAppSelectorMock
            .mockReturnValueOnce('testGmail')
            .mockReturnValueOnce('testOutlook')
    })

    it('should render', () => {
        const {container} = renderComponent()

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should link to the new onboarding flow', () => {
        const {getByText} = renderComponent()

        expect(
            getByText('Connect other email provider')
                .closest('a')
                ?.getAttribute('to')
        ).toBe('/app/settings/channels/email/new/onboarding')
    })
})
