import React from 'react'

import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import type { DeepPartial } from 'redux'
import configureMockStore from 'redux-mock-store'

import { getSingleHelpCenterResponseFixture } from 'pages/settings/helpCenter/fixtures/getHelpCentersResponse.fixture'
import useCurrentHelpCenter from 'pages/settings/helpCenter/hooks/useCurrentHelpCenter'
import { useHelpCenterIdParam } from 'pages/settings/helpCenter/hooks/useHelpCenterIdParam'
import { initialState as helpCenterState } from 'state/entities/helpCenter/reducer'
import type { RootState, StoreDispatch } from 'state/types'
import { initialState as uiState } from 'state/ui/helpCenter/reducer'

import { getSingleArticleEnglish } from '../../../fixtures/getArticlesResponse.fixture'
import HelpCenterEditAdvancedArticleForm from '../HelpCenterEditAdvancedArticleForm'

const mockedStore = configureMockStore<DeepPartial<RootState>, StoreDispatch>()

const mockedOnChange = jest.fn()
const mockedOnCategoryChange = jest.fn()

jest.mock('pages/settings/helpCenter/hooks/useCurrentHelpCenter')
;(useCurrentHelpCenter as jest.Mock).mockReturnValue(
    getSingleHelpCenterResponseFixture,
)

jest.mock('pages/settings/helpCenter/hooks/useHelpCenterIdParam')
;(useHelpCenterIdParam as jest.Mock).mockReturnValue(
    getSingleHelpCenterResponseFixture.id,
)

const mockFetchCategories = jest.fn().mockResolvedValue(null)

jest.mock('../../../hooks/useCategoriesActions', () => {
    return {
        useCategoriesActions: () => ({
            fetchCategories: mockFetchCategories,
        }),
    }
})

const mockedUseEditionManager = {
    selectedVisibility: 'PUBLIC',
    setSelectedVisibility: jest.fn(),
}

jest.mock('../HelpCenterArticleAIAgentBanner', () => ({
    HelpCenterArticleAIAgentBanner: () => null,
}))

jest.mock('../../../providers/EditionManagerContext', () => {
    const module: Record<string, unknown> = jest.requireActual(
        '../../../providers/EditionManagerContext',
    )

    return {
        ...module,
        useEditionManager: () => mockedUseEditionManager,
    }
})

describe('<HelpCenterEditAdvancedArticleForm/>', () => {
    const { translation } = getSingleArticleEnglish
    const props = {
        articleId: 1,
        categoryId: 1,
        translation,
        domain: 'acme.gorgias.rehab',
        shopName: 'test-shop',
        onChange: mockedOnChange,
        onCategoryChange: mockedOnCategoryChange,
    }

    const defaultState: DeepPartial<RootState> = {
        entities: {
            helpCenter: helpCenterState,
        },
        ui: { helpCenter: uiState },
    }

    beforeEach(() => {
        jest.resetAllMocks()
        ;(useCurrentHelpCenter as jest.Mock).mockReturnValue(
            getSingleHelpCenterResponseFixture,
        )
        ;(useHelpCenterIdParam as jest.Mock).mockReturnValue(
            getSingleHelpCenterResponseFixture.id,
        )
    })

    it('should display the component correctly', () => {
        const { container } = render(
            <Provider store={mockedStore(defaultState)}>
                <HelpCenterEditAdvancedArticleForm {...props} />
            </Provider>,
        )
        expect(container).toMatchSnapshot()
    })

    it('should trigger the onChange callback when updating form inputs', () => {
        const { getByRole } = render(
            <Provider store={mockedStore(defaultState)}>
                <HelpCenterEditAdvancedArticleForm {...props} />
            </Provider>,
        )
        const slugInput = getByRole('textbox', { name: /slug/i })
        fireEvent.change(slugInput, { target: { value: 'new slug' } })
        expect(mockedOnChange).toHaveBeenCalledWith({
            ...translation,
            slug: 'new-slug',
        })
    })

    it('should call onChange with customer_visibility when visibility selection changes', async () => {
        const user = userEvent.setup()

        render(
            <Provider store={mockedStore(defaultState)}>
                <HelpCenterEditAdvancedArticleForm {...props} />
            </Provider>,
        )

        const visibilityTrigger = screen.getAllByDisplayValue('Public')[0]
        await user.click(visibilityTrigger)

        const unlistedOption = screen.getByRole('option', {
            name: /unlisted/i,
        })
        await user.click(unlistedOption)

        expect(mockedOnChange).toHaveBeenCalledWith(
            expect.objectContaining({
                customer_visibility: 'UNLISTED',
            }),
        )
    })
})
