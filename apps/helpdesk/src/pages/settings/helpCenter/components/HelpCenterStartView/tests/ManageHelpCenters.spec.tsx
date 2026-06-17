import { render, userEvent } from '@repo/testing'
import { screen, waitFor } from '@testing-library/react'
import { fromJS } from 'immutable'

import { toast } from '@gorgias/axiom'

import { IntegrationType } from 'models/integration/constants'
import { getHelpCentersResponseFixture } from 'pages/settings/helpCenter/fixtures/getHelpCentersResponse.fixture'
import { getLocalesResponseFixture } from 'pages/settings/helpCenter/fixtures/getLocalesResponse.fixtures'
import { useSupportedLocales } from 'pages/settings/helpCenter/providers/SupportedLocales'
import type { RootState } from 'state/types'

import { useHelpCenterList } from '../../../hooks/useHelpCenterList'
import type { ManageHelpCentersProps } from '../ManageHelpCenters'
import { ManageHelpCenters } from '../ManageHelpCenters'

const mockDuplicateHelpCenter = jest.fn()
let mockHelpCenterClient: unknown = {
    listArticles: jest.fn().mockResolvedValue({
        data: { data: [], meta: { item_count: 0 } },
    }),
    listArticleTranslations: jest.fn().mockResolvedValue({
        data: { data: [], meta: { item_count: 0 } },
    }),
    duplicateHelpCenter: mockDuplicateHelpCenter,
}
jest.mock('pages/settings/helpCenter/hooks/useHelpCenterApi', () => {
    return {
        useHelpCenterApi: () => ({
            isReady: true,
            get client() {
                return mockHelpCenterClient
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
    beforeEach(() => {
        mockDuplicateHelpCenter.mockReset()
        mockHelpCenterClient = {
            listArticles: jest.fn().mockResolvedValue({
                data: { data: [], meta: { item_count: 0 } },
            }),
            listArticleTranslations: jest.fn().mockResolvedValue({
                data: { data: [], meta: { item_count: 0 } },
            }),
            duplicateHelpCenter: mockDuplicateHelpCenter,
        }
    })
    afterEach(() => {
        toast.dismiss()
    })
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
    it('shows loading then success toast when duplicating a help center succeeds', async () => {
        const newHelpCenter = {
            ...getHelpCentersResponseFixture.data[0],
            id: 999,
            name: 'ACME Help Center copy',
        }
        mockDuplicateHelpCenter.mockResolvedValue({ data: newHelpCenter })
        render(<ManageHelpCenters {...props} />, {
            storeState: defaultState,
        })
        const duplicateButtons = screen.getAllByTitle(/Duplicate Help Center/i)
        await userEvent.click(duplicateButtons[0])
        await waitFor(() => {
            expect(
                screen.getByRole('status', {
                    name: /Duplicating ACME Help Center\. It may take up to a minute\./i,
                }),
            ).toHaveAttribute('data-intent', 'info')
        })
        await waitFor(() => {
            expect(
                screen.getByRole('status', {
                    name: /ACME Help Center copy successfully created\./i,
                }),
            ).toHaveAttribute('data-intent', 'success')
        })
    })
    it('shows an error toast when duplicating a help center fails', async () => {
        mockDuplicateHelpCenter.mockRejectedValue(new Error('failed'))
        render(<ManageHelpCenters {...props} />, {
            storeState: defaultState,
        })
        const duplicateButtons = screen.getAllByTitle(/Duplicate Help Center/i)
        await userEvent.click(duplicateButtons[0])
        await waitFor(() => {
            expect(
                screen.getByRole('status', {
                    name: /Something went wrong\. We could not duplicate ACME Help Center\./i,
                }),
            ).toHaveAttribute('data-intent', 'destructive')
        })
    })
    it('shows an error toast when the help center client is unavailable', async () => {
        mockHelpCenterClient = null
        render(<ManageHelpCenters {...props} />, {
            storeState: defaultState,
        })
        const duplicateButtons = screen.getAllByTitle(/Duplicate Help Center/i)
        await userEvent.click(duplicateButtons[0])
        await waitFor(() => {
            expect(
                screen.getByRole('status', {
                    name: /Something went wrong\. We could not duplicate ACME Help Center\./i,
                }),
            ).toHaveAttribute('data-intent', 'destructive')
        })
        expect(mockDuplicateHelpCenter).not.toHaveBeenCalled()
    })
})
