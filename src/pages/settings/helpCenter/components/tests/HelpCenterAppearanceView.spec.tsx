import React, { FC } from 'react'

import { fireEvent, waitFor } from '@testing-library/react'
import { fromJS } from 'immutable'
import _keyBy from 'lodash/keyBy'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { billingState } from 'fixtures/billing'
import { FontCatalogueModal } from 'pages/settings/common/FontSelectField/components/FontCatalogueModal/FontCatalogueModal'
import { ContactFormFixture } from 'pages/settings/contactForm/fixtures/contacForm'
import { getSingleHelpCenterResponseFixture } from 'pages/settings/helpCenter/fixtures/getHelpCentersResponse.fixture'
import { getLocalesResponseFixture } from 'pages/settings/helpCenter/fixtures/getLocalesResponse.fixtures'
import useCurrentHelpCenter from 'pages/settings/helpCenter/hooks/useCurrentHelpCenter'
import { useSupportedLocales } from 'pages/settings/helpCenter/providers/SupportedLocales'
import { initialState as articlesState } from 'state/entities/helpCenter/articles/reducer'
import { initialState as categoriesState } from 'state/entities/helpCenter/categories/reducer'
import { RootState, StoreDispatch } from 'state/types'
import { initialState as uiState } from 'state/ui/helpCenter/reducer'
import { renderWithRouter } from 'utils/testing'

import { getHelpCenterTranslationsResponseFixture } from '../../fixtures/getHelpCenterTranslationsResponse.fixture'
import { HelpCenterTranslationProvider } from '../../providers/HelpCenterTranslation'
import { useHasAccessToAILibrary } from '../AIArticlesLibraryView/hooks/useHasAccessToAILibrary'
import { HelpCenterAppearanceView } from '../HelpCenterAppearanceView/HelpCenterAppearanceView'

const mockedStore = configureMockStore<Partial<RootState>, StoreDispatch>([
    thunk,
])

jest.mock('../AIArticlesLibraryView/hooks/useHasAccessToAILibrary')
;(useHasAccessToAILibrary as jest.Mock).mockReturnValue(true)

jest.mock('pages/settings/contactForm/hooks/useContactFormApi', () => {
    return {
        useContactFormApi: () => ({
            isReady: true,
            isLoading: false,
            getContactFormById: jest.fn(),
        }),
    }
})

const defaultState: Partial<RootState> = {
    entities: {
        contactForm: {
            contactForms: {
                contactFormById: _keyBy([ContactFormFixture], 'id'),
            },
        },
        helpCenter: {
            helpCenters: {
                helpCentersById: {
                    '1': getSingleHelpCenterResponseFixture,
                },
            },
            articles: articlesState,
            categories: categoriesState,
        },
    } as any,
    ui: { helpCenter: { ...uiState, currentId: 1 } } as any,
    billing: fromJS(billingState),
}

const mockedUpdateHelpCenter = jest
    .fn()
    .mockResolvedValue({ data: getSingleHelpCenterResponseFixture })

const mockedGetHelpCenter = jest
    .fn()
    .mockResolvedValue({ data: getSingleHelpCenterResponseFixture })

const mockedUpdateHelpCenterTranslation = jest.fn()
const mockedListHelpCenterTranslations = jest
    .fn()
    .mockResolvedValue(getHelpCenterTranslationsResponseFixture)
const mockedListGoogleFonts = jest.fn().mockResolvedValue({
    data: [
        { family: 'Roboto', category: 'serif' },
        { family: 'Adriana', category: 'serif' },
        { family: 'Tambourin', category: 'serif' },
    ],
})

jest.mock('pages/settings/helpCenter/hooks/useHelpCenterApi', () => {
    return {
        useHelpCenterApi: () => ({
            isReady: true,
            client: {
                updateHelpCenter: mockedUpdateHelpCenter,
                updateHelpCenterTranslation: mockedUpdateHelpCenterTranslation,
                listHelpCenterTranslations: mockedListHelpCenterTranslations,
                getHelpCenter: mockedGetHelpCenter,
                listGoogleFonts: mockedListGoogleFonts,
            },
        }),
        useAbilityChecker: () => ({ isPassingRulesCheck: () => true }),
    }
})

jest.mock('pages/settings/helpCenter/hooks/useCurrentHelpCenter')
const mockedUseCurrentHelpCenter = (
    useCurrentHelpCenter as jest.Mock
).mockReturnValue(getSingleHelpCenterResponseFixture)

jest.mock('pages/settings/helpCenter/providers/SupportedLocales')
;(useSupportedLocales as jest.Mock).mockReturnValue(getLocalesResponseFixture)

jest.mock(
    'pages/settings/common/FontSelectField/components/FontCatalogueModal/FontCatalogueModal',
)
;(FontCatalogueModal as jest.Mock).mockReturnValue(
    <div id="FontCatalogueModal-mocked"></div>,
)

const route = {
    path: '/app/settings/help-center/:helpCenterId/appearance',
    route: '/app/settings/help-center/1/appearance',
}

const DefaultProviders: FC = ({ children }) => (
    <Provider store={mockedStore(defaultState)}>
        <HelpCenterTranslationProvider
            helpCenter={getSingleHelpCenterResponseFixture}
        >
            {children}
        </HelpCenterTranslationProvider>
    </Provider>
)

describe('<HelpCenterAppearanceView />', () => {
    it('should render the component', () => {
        const { container } = renderWithRouter(
            <DefaultProviders>
                <HelpCenterAppearanceView />
            </DefaultProviders>,

            route,
        )

        expect(container).toMatchSnapshot()
    })

    it('disables "Save Changes" button if there are no changes', () => {
        const { getByRole, getByLabelText } = renderWithRouter(
            <DefaultProviders>
                <HelpCenterAppearanceView />
            </DefaultProviders>,
            route,
        )

        const saveBtn = getByRole('button', {
            name: 'Save Changes',
        }) as HTMLButtonElement

        // Initial state is disabled
        expect(saveBtn).toBeAriaDisabled()

        // Change one setting and expect the button to become active
        fireEvent.click(
            getByLabelText('Dark Theme', {
                selector: '[role="radio"]',
            }),
        )
        expect(saveBtn).toBeAriaEnabled()

        // Change back the setting and expect the initial state
        fireEvent.click(
            getByLabelText('Light Theme', {
                selector: '[role="radio"]',
            }),
        )
        expect(saveBtn).toBeAriaDisabled()
    })

    it('restores the default state when "Cancel" is clicked', () => {
        const { getByRole, getByLabelText } = renderWithRouter(
            <DefaultProviders>
                <HelpCenterAppearanceView />
            </DefaultProviders>,
            route,
        )

        const cancelBtn = getByRole('button', {
            name: 'Cancel',
        }) as HTMLButtonElement
        const saveBtn = getByRole('button', {
            name: 'Save Changes',
        }) as HTMLButtonElement

        fireEvent.click(
            getByLabelText('Dark Theme', {
                selector: '[role="radio"]',
            }),
        )
        expect(saveBtn).toBeAriaEnabled()

        fireEvent.click(cancelBtn)
        expect(saveBtn).toBeAriaDisabled()
    })

    it.each(['brand_logo_url', 'favicon_url', 'brand_logo_light_url'])(
        'should update the Help center with the "%s" field set to null after dismissing it',
        async (imageField) => {
            mockedUseCurrentHelpCenter.mockReturnValueOnce({
                ...getSingleHelpCenterResponseFixture,
                [imageField]: 'https://picsum.photos/200',
            })

            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const stateWithImage: Partial<RootState> = {
                ...defaultState,
                entities: {
                    helpCenter: {
                        helpCenters: {
                            helpCentersById: {
                                '1': {
                                    ...getSingleHelpCenterResponseFixture,
                                    [imageField]: 'https://picsum.photos/200',
                                },
                            },
                        },
                        articles: articlesState,
                        categories: categoriesState,
                    },
                } as any,
                ui: { helpCenter: { ...uiState, currentId: 1 } } as any,
            }

            const { getByText, getByRole } = renderWithRouter(
                <Provider store={mockedStore(defaultState)}>
                    <HelpCenterAppearanceView />
                </Provider>,
                route,
            )

            // dismissing the only image set to a URL value
            fireEvent.click(getByText('close'))

            fireEvent.click(
                getByRole('button', {
                    name: 'Save Changes',
                }),
            )

            await waitFor(() => {
                expect(mockedUpdateHelpCenter).toHaveBeenCalledTimes(1)
                expect(mockedUpdateHelpCenter).toHaveBeenCalledWith(
                    {
                        help_center_id: 1,
                    },
                    expect.objectContaining({
                        [imageField]: null,
                    }),
                )
            })
        },
    )
})
