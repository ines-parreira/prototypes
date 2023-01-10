import React, {ComponentProps} from 'react'
import {fireEvent, render} from '@testing-library/react'
import _keyBy from 'lodash/keyBy'

import {Locale} from '../../../../../models/helpCenter/types'
import HelpCenterTable from '../HelpCenterTable'
import {getHelpCentersResponseFixture} from '../../fixtures/getHelpCentersResponse.fixture'
import {getLocalesResponseFixture} from '../../fixtures/getLocalesResponse.fixtures'

jest.mock('pages/settings/helpCenter/hooks/useHelpCenterApi', () => ({
    useAbilityChecker: () => ({isPassingRulesCheck: () => true}),
}))

describe('<HelpCenterTable />', () => {
    const mockedOnClick = jest.fn()
    const mockedOnToggle = jest.fn()
    const mockedDuplicateHelpCenter = jest.fn()
    const mockedDeleteHelpCenter = jest.fn()

    const props: ComponentProps<typeof HelpCenterTable> = {
        isLoading: false,
        list: getHelpCentersResponseFixture.data,
        locales: _keyBy<Locale>(getLocalesResponseFixture, 'code'),
        onClick: mockedOnClick,
        onToggle: mockedOnToggle,
        duplicateHelpCenter: mockedDuplicateHelpCenter,
        deleteHelpCenter: mockedDeleteHelpCenter,
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

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
        expect(mockedOnClick).toHaveBeenCalledWith(props.list[1])
    })

    it('should duplicate a Help Center', () => {
        const firstHelpCenter = props.list[0]

        const component = render(
            <HelpCenterTable {...props} list={[firstHelpCenter]} />
        )

        const duplicateButton = component.getByRole('button', {
            name: 'Duplicate Help Center',
        })

        fireEvent.click(duplicateButton)

        expect(mockedDuplicateHelpCenter).toHaveBeenCalledWith(firstHelpCenter)
    })

    it('should delete a Help Center', () => {
        const firstHelpCenter = props.list[0]

        const component = render(
            <HelpCenterTable {...props} list={[firstHelpCenter]} />
        )

        const deleteButton = component.getByRole('button', {
            name: 'Delete Help Center',
        })

        fireEvent.click(deleteButton)

        const deleteConfirmButton = component.getByRole('button', {
            name: 'Confirm',
        })

        fireEvent.click(deleteConfirmButton)

        expect(mockedDeleteHelpCenter).toHaveBeenCalledWith(firstHelpCenter)
    })
})
