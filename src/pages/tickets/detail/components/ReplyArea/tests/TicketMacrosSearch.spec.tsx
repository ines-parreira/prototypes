import {mockFlags, resetLDMocks} from 'jest-launchdarkly-mock'
import React from 'react'
import {render} from '@testing-library/react'

import {FeatureFlagKey} from 'config/featureFlags'
import TicketMacrosSearch from '../TicketMacrosSearch'

jest.mock('pages/common/components/MacroFilters/MacroFilters', () => () => (
    <div>MacroFilters</div>
))
jest.mock(
    'pages/tickets/common/macros/components/OnbordingMacroPopover',
    () => () => <div>OnbordingMacroPopover</div>
)

describe('<TicketMacrosSearch />', () => {
    const minProps = {
        setFocus: jest.fn(),
        searchParams: {},
        macrosVisible: false,
        searchMacros: jest.fn(),
        showMacros: jest.fn(),
        handleSearchKeyDown: jest.fn(),
        requireCustomerSelection: false,
        onClearMacro: jest.fn(),
    }

    beforeEach(() => {
        resetLDMocks()
        mockFlags({
            [FeatureFlagKey.DefaultMacroToSearch]: false,
        })
    })

    it('should render TicketMacrosSearch unfocused', () => {
        const {container} = render(<TicketMacrosSearch {...minProps} />)
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render TicketMacrosSearch focused', () => {
        const {container} = render(
            <TicketMacrosSearch {...minProps} macrosVisible={true} />
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render the onboarding popover when DefaultMacroToSearch feature flag is truthy', () => {
        mockFlags({
            [FeatureFlagKey.DefaultMacroToSearch]: true,
        })
        const {getByText} = render(
            <TicketMacrosSearch {...minProps} macrosVisible={true} />
        )

        expect(getByText(/OnbordingMacroPopover/)).toBeTruthy()
    })
})
