import React, {ComponentProps} from 'react'
import {fireEvent, render, screen} from '@testing-library/react'
import _keyBy from 'lodash/keyBy'

import {mockFlags} from 'jest-launchdarkly-mock'
import {Locale} from 'models/helpCenter/types'
import {FeatureFlagKey} from 'config/featureFlags'
import {HelpCenterTable} from '../HelpCenterTable'
import {getHelpCentersResponseFixture} from '../../fixtures/getHelpCentersResponse.fixture'
import {getLocalesResponseFixture} from '../../fixtures/getLocalesResponse.fixtures'

jest.mock('pages/settings/helpCenter/hooks/useHelpCenterApi', () => ({
    useAbilityChecker: () => ({isPassingRulesCheck: () => true}),
}))

describe('<HelpCenterTable />', () => {
    const mockedOnClick = jest.fn()
    const mockedDuplicateHelpCenter = jest.fn()

    const props: ComponentProps<typeof HelpCenterTable> = {
        isLoading: false,
        list: getHelpCentersResponseFixture.data,
        locales: _keyBy<Locale>(getLocalesResponseFixture, 'code'),
        onClick: mockedOnClick,
        duplicateHelpCenter: mockedDuplicateHelpCenter,
    }

    it('should display the table correctly when loading', () => {
        const {container} = render(
            <HelpCenterTable {...props} isLoading={true} />
        )
        expect(container).toMatchSnapshot()
    })

    it('should display the table correctly when not loading', () => {
        const {container} = render(<HelpCenterTable {...props} />)
        expect(container).toMatchSnapshot()
    })

    it('should call the onClick callback when clicking on a row', () => {
        const {getByRole} = render(<HelpCenterTable {...props} />)
        const tableRow = getByRole('row', {name: /ACME Help Center 2/i})
        fireEvent.click(tableRow)
        expect(mockedOnClick).toHaveBeenCalledWith(props.list[1], false)
    })

    it('should duplicate a Help Center', () => {
        const firstHelpCenter = props.list[0]

        render(<HelpCenterTable {...props} list={[firstHelpCenter]} />)

        const duplicateButton = screen.getByTitle(/Duplicate Help Center/)

        fireEvent.click(duplicateButton)

        expect(mockedDuplicateHelpCenter).toHaveBeenCalledWith(firstHelpCenter)
    })

    it('should call the onClick callback when clicking on wizard setup button', () => {
        mockFlags({
            [FeatureFlagKey.HelpCenterCreationWizard]: true,
        })

        const firstHelpCenter = props.list[0]

        render(<HelpCenterTable {...props} list={[firstHelpCenter]} />)

        const wizardSetup = screen.getByTitle(/Start Setup/)

        fireEvent.click(wizardSetup)

        expect(mockedOnClick).toHaveBeenCalledWith(props.list[0], true)
    })
})
