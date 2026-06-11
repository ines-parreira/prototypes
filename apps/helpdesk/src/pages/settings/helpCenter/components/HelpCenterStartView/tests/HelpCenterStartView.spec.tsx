import { assumeMock, render } from '@repo/testing'
import { fireEvent, screen } from '@testing-library/react'
import { fromJS } from 'immutable'
import { useLocation } from 'react-router-dom'

import { account } from 'fixtures/account'
import { IntegrationType } from 'models/integration/constants'
import { HELP_CENTER_BASE_PATH } from 'pages/settings/helpCenter/constants'
import { getHelpCentersResponseFixture } from 'pages/settings/helpCenter/fixtures/getHelpCentersResponse.fixture'
import { getLocalesResponseFixture } from 'pages/settings/helpCenter/fixtures/getLocalesResponse.fixtures'
import { useSupportedLocales } from 'pages/settings/helpCenter/providers/SupportedLocales'
import type { RootState } from 'state/types'

import { useHelpCenterList } from '../../../hooks/useHelpCenterList'
import { HelpCenterStartView } from '../HelpCenterStartView'

jest.mock('pages/settings/helpCenter/hooks/useHelpCenterApi', () => {
    return {
        useHelpCenterApi: () => ({
            isReady: true,
            client: {
                listArticles: jest.fn().mockResolvedValue({
                    data: { data: [], meta: { item_count: 0 } },
                }),
                listArticleTranslations: jest.fn().mockResolvedValue({
                    data: { data: [], meta: { item_count: 0 } },
                }),
            },
            agentAbility: [
                {
                    action: 'manage',
                    subject: 'all',
                },
            ],
        }),
        useAbilityChecker: () => ({ isPassingRulesCheck: () => true }),
    }
})
jest.mock('pages/settings/helpCenter/providers/SupportedLocales')
const mockedUseSupportedLocales = assumeMock(useSupportedLocales)
mockedUseSupportedLocales.mockReturnValue(getLocalesResponseFixture)
const helpCenters = getHelpCentersResponseFixture.data
jest.mock('../../../hooks/useHelpCenterList')
const mockedUseHelpCenterList = assumeMock(useHelpCenterList)
mockedUseHelpCenterList.mockReturnValue({
    isLoading: false,
    hasMore: false,
    fetchMore: jest.fn(),
    helpCenters: [],
})
const LocationPath = () => {
    const location = useLocation()

    return <output aria-label="Current path">{location.pathname}</output>
}
describe('<HelpCenterStartView />', () => {
    const defaultState: Partial<RootState> = {
        entities: {
            helpCenter: {
                helpCenters: {
                    helpCentersById: {
                        '1': getHelpCentersResponseFixture.data[0],
                        '2': getHelpCentersResponseFixture.data[1],
                        '3': getHelpCentersResponseFixture.data[2],
                    },
                },
            },
        } as any,
        currentAccount: fromJS(account),
        integrations: fromJS({
            integrations: [
                { id: 1, type: IntegrationType.Shopify, name: 'My Shop' },
                { id: 2, type: IntegrationType.BigCommerce, name: 'Test Shop' },
            ],
        }),
    }
    const props = {}
    it('should render the About component', () => {
        const { container } = render(<HelpCenterStartView {...props} />, {
            initialEntries: [`${HELP_CENTER_BASE_PATH}`],
            storeState: defaultState,
        })
        screen.getByText(
            /Set up a free Help Center\/FAQ site and let your customers find answers./i,
        )
        expect(container).toMatchSnapshot()
    })
    it('should render the Manage component', () => {
        mockedUseHelpCenterList.mockReturnValue({
            isLoading: false,
            hasMore: false,
            fetchMore: jest.fn(),
            helpCenters,
        })
        const { container } = render(<HelpCenterStartView {...props} />, {
            initialEntries: [`${HELP_CENTER_BASE_PATH}`],
            storeState: defaultState,
        })
        screen.getByText(/Help Center Name/i)
        expect(container).toMatchSnapshot()
    })
    it('should navigate to the creation page when clicking on the new button in the Manage tab', () => {
        render(
            <>
                <HelpCenterStartView {...props} />
                <LocationPath />
            </>,
            {
                initialEntries: [`${HELP_CENTER_BASE_PATH}/manage`],
                storeState: defaultState,
            },
        )
        const newBtn = screen.getByText(/create help center/i)
        fireEvent.click(newBtn)
        expect(screen.getByLabelText('Current path')).toHaveTextContent(
            `${HELP_CENTER_BASE_PATH}/new`,
        )
    })
})
