import { render } from '@repo/testing'
import { screen } from '@testing-library/react'
import { fromJS } from 'immutable'

import { IntegrationType } from 'models/integration/constants'
import { getHelpCentersResponseFixture } from 'pages/settings/helpCenter/fixtures/getHelpCentersResponse.fixture'
import { getLocalesResponseFixture } from 'pages/settings/helpCenter/fixtures/getLocalesResponse.fixtures'
import { useSupportedLocales } from 'pages/settings/helpCenter/providers/SupportedLocales'
import type { RootState } from 'state/types'

import { useHelpCenterList } from '../../../hooks/useHelpCenterList'
import type { ManageHelpCentersProps } from '../ManageHelpCenters'
import { ManageHelpCenters } from '../ManageHelpCenters'

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
;(useSupportedLocales as jest.Mock).mockReturnValue(getLocalesResponseFixture)
const helpCenters = getHelpCentersResponseFixture.data
jest.mock('pages/settings/helpCenter/hooks/useHelpCenterList')
;(useHelpCenterList as jest.Mock).mockReturnValue({
    isLoading: false,
    hasMore: false,
    fetchMore: jest.fn(),
    helpCenters,
})
const props: ManageHelpCentersProps = {
    helpCenterList: helpCenters,
    standaloneHelpCenters: [],
    isButtonDisabled: false,
    isLoading: false,
    fetchMore: jest.fn(),
    hasMore: false,
}
describe('<ManageHelpCenters />', () => {
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
        integrations: fromJS({
            integrations: [
                { id: 1, type: IntegrationType.Shopify, name: 'My Shop' },
                { id: 2, type: IntegrationType.BigCommerce, name: 'Test Shop' },
            ],
        }),
    }
    it('should render the component', () => {
        const { container } = render(<ManageHelpCenters {...props} />, {
            storeState: defaultState,
        })
        expect(container).toMatchSnapshot()
    })
    it('should not render the "create help center" button while loading in still in progress', () => {
        render(
            <ManageHelpCenters
                {...props}
                isLoading={true}
                helpCenterList={[]}
            />,
            {
                storeState: defaultState,
            },
        )
        expect(screen.queryByText(/create help center/i)).toBeNull()
    })
    it('should render the empty list state when the component is loaded and the help center list is empty', () => {
        render(
            <ManageHelpCenters
                {...props}
                isLoading={false}
                helpCenterList={[]}
            />,
            {
                storeState: defaultState,
            },
        )
        screen.getByText(/You have no Help Centers at the moment./i)
        screen.getByText(/create help center/i)
    })
})
