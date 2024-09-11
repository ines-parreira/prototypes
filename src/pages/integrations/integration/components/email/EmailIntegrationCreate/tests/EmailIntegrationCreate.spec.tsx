import React from 'react'
import {render} from '@testing-library/react'
import {MemoryRouter} from 'react-router-dom'

import useAppSelector from 'hooks/useAppSelector'
import {useFlag} from 'common/flags'

import EmailIntegrationCreate from '../EmailIntegrationCreate'

jest.mock('hooks/useAppSelector', () => jest.fn())
jest.mock('common/flags', () => ({
    useFlag: jest.fn(),
}))

const useAppSelectorMock = useAppSelector as jest.Mock
const mockUseFlag = useFlag as jest.Mock

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
        mockUseFlag.mockReturnValue(false)
    })

    it('should render', () => {
        const {container} = renderComponent()

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should link to the new onboarding flow when the FF is enabled', () => {
        mockUseFlag.mockReturnValue(true)
        const {getByText} = renderComponent()

        expect(
            getByText('Connect other email provider')
                .closest('a')
                ?.getAttribute('to')
        ).toBe('/app/settings/channels/email/new/onboarding')
    })

    it('should link to the legacy flow when the FF is disabled', () => {
        mockUseFlag.mockReturnValue(false)
        const {getByText} = renderComponent()

        expect(
            getByText('Connect other email provider')
                .closest('a')
                ?.getAttribute('to')
        ).toBe('/app/settings/channels/email/new/custom')
    })
})
