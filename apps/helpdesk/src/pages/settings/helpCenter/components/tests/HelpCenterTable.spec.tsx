import { ComponentProps } from 'react'

import { fireEvent, render, screen } from '@testing-library/react'
import _keyBy from 'lodash/keyBy'

import { useFlag } from 'core/flags'
import { Locale } from 'models/helpCenter/types'
import { IntegrationType } from 'models/integration/constants'

import { getHelpCentersResponseFixture } from '../../fixtures/getHelpCentersResponse.fixture'
import { getLocalesResponseFixture } from '../../fixtures/getLocalesResponse.fixtures'
import { useStoreIntegrationByShopName } from '../../hooks/useStoreIntegrationByShopName'
import { HelpCenterTable } from '../HelpCenterTable'

jest.mock('core/flags')
jest.mock('pages/settings/helpCenter/hooks/useHelpCenterApi', () => ({
    useAbilityChecker: () => ({ isPassingRulesCheck: () => true }),
}))
jest.mock('../../hooks/useStoreIntegrationByShopName')

const mockUseFlag = useFlag as jest.Mock

describe('<HelpCenterTable />', () => {
    const mockedOnClick = jest.fn()
    const mockedDuplicateHelpCenter = jest.fn()
    const mockedUseStoreIntegrationByShopName = jest.mocked(
        useStoreIntegrationByShopName,
    )

    const props: ComponentProps<typeof HelpCenterTable> = {
        isLoading: false,
        list: getHelpCentersResponseFixture.data,
        locales: _keyBy<Locale>(getLocalesResponseFixture, 'code'),
        onClick: mockedOnClick,
        duplicateHelpCenter: mockedDuplicateHelpCenter,
    }

    beforeEach(() => {
        jest.resetAllMocks()
        mockedUseStoreIntegrationByShopName.mockReturnValue({
            id: 1,
            name: 'My Shop',
            type: IntegrationType.Shopify,
        } as unknown as ReturnType<typeof useStoreIntegrationByShopName>)
        mockUseFlag.mockReturnValue(false)
    })
    it('should display the table correctly when loading', () => {
        const { container } = render(
            <HelpCenterTable {...props} isLoading={true} />,
        )
        expect(container).toMatchSnapshot()
    })

    it('should display the table correctly when not loading', () => {
        const { container } = render(<HelpCenterTable {...props} />)
        expect(container).toMatchSnapshot()
    })

    it('should call the onClick callback when clicking on a row', () => {
        const { getByRole } = render(<HelpCenterTable {...props} />)
        const tableRow = getByRole('row', { name: /ACME Help Center 2/i })
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
        mockUseFlag.mockReturnValue(true)

        const firstHelpCenter = props.list[0]

        render(<HelpCenterTable {...props} list={[firstHelpCenter]} />)

        const wizardSetup = screen.getByTitle(/Start Setup/)

        fireEvent.click(wizardSetup)

        expect(mockedOnClick).toHaveBeenCalledWith(props.list[0], true)
    })
})
