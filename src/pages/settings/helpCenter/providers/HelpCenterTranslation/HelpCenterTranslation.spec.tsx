import React, { ComponentType } from 'react'

import { act } from '@testing-library/react-hooks'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { HelpCenter } from 'models/helpCenter/types'
import { getContactFormForHelpCenterFixture } from 'pages/settings/contactForm/fixtures/contacForm'
import { getSingleHelpCenterResponseFixtureWithTranslation } from 'pages/settings/helpCenter/fixtures/getHelpCentersResponse.fixture'
import useCurrentHelpCenter from 'pages/settings/helpCenter/hooks/useCurrentHelpCenter'
import {
    HelpCenterTranslationProvider,
    useHelpCenterTranslation,
} from 'pages/settings/helpCenter/providers/HelpCenterTranslation/HelpCenterTranslation'
import { initialState as articlesState } from 'state/entities/helpCenter/articles'
import { initialState as categoriesState } from 'state/entities/helpCenter/categories'
import { RootState, StoreDispatch } from 'state/types'
import { initialState as uiState } from 'state/ui/helpCenter'
import { flushPromises } from 'utils/testing'
import { renderHook } from 'utils/testing/renderHook'

const mockedStore = configureMockStore<Partial<RootState>, StoreDispatch>([
    thunk,
])

const contactForm = getContactFormForHelpCenterFixture({
    id: 111,
    help_center_id: 333,
})
const helpCenter = {
    ...getSingleHelpCenterResponseFixtureWithTranslation,
    id: 333,
    email_integration: {
        email: 'new-help-center@test.email',
        id: 444,
    },
    translations:
        getSingleHelpCenterResponseFixtureWithTranslation.translations?.map(
            (t) => ({
                ...t,
                help_center_id: 333,
                id: 555,
                contact_form_id: 111,
            }),
        ),
}

const defaultState: Partial<RootState> = {
    entities: {
        contactForm: {
            contactForms: {
                contactFormById: {
                    [contactForm.id]: contactForm,
                },
            },
        },
        helpCenter: {
            helpCenters: {
                helpCentersById: {
                    [helpCenter.id]: helpCenter,
                },
            },
            articles: articlesState,
            categories: categoriesState,
        },
    } as any,
    integrations: fromJS({
        integrations: [],
    }),
    ui: { helpCenter: { ...uiState } } as any,
}

jest.mock('pages/settings/helpCenter/hooks/useCurrentHelpCenter')

const mockedUpdateHelpCenterTranslation = jest.fn()
const mockedUpdateHelpCenter = jest.fn()
const mockedListHelpCenterTranslations = jest.fn()
const mockedGetHelpCenter = jest.fn()
jest.mock('pages/settings/helpCenter/hooks/useHelpCenterApi', () => {
    return {
        useHelpCenterApi: () => ({
            isReady: true,
            client: {
                updateHelpCenter: mockedUpdateHelpCenter,
                updateHelpCenterTranslation: mockedUpdateHelpCenterTranslation,
                listHelpCenterTranslations: mockedListHelpCenterTranslations,
                getHelpCenter: mockedGetHelpCenter,
            },
        }),
    }
})

const mockGetContactFormById = jest.fn()
const mockUpdateContactForm = jest.fn()
jest.mock('pages/settings/contactForm/hooks/useContactFormApi', () => {
    return {
        useContactFormApi: () => ({
            isReady: true,
            isLoading: false,
            getContactFormById: mockGetContactFormById,
            updateContactForm: mockUpdateContactForm,
        }),
    }
})

function renderTestHook({
    state = defaultState,
    currentHelpCenter,
}: {
    currentHelpCenter: HelpCenter
    state?: Partial<RootState>
}) {
    return renderHook(() => useHelpCenterTranslation(), {
        wrapper: ({ children }: { children: ComponentType }) => (
            <Provider
                store={mockedStore({
                    ...defaultState,
                    ...state,
                })}
            >
                <HelpCenterTranslationProvider helpCenter={currentHelpCenter}>
                    {children}
                </HelpCenterTranslationProvider>
            </Provider>
        ),
    })
}

describe('useHelpCenterTranslation', () => {
    let state: Partial<RootState>

    describe('help center with contact forms linked to every translation', () => {
        beforeEach(() => {
            state = {
                ui: {
                    helpCenter: {
                        currentId: helpCenter.id,
                        currentLanguage: helpCenter.default_locale,
                    },
                } as any,
            }
            jest.mocked(useCurrentHelpCenter).mockReturnValue(helpCenter)
            mockedGetHelpCenter.mockResolvedValue({ data: helpCenter })
        })

        it('should return valid contact form related fields', async () => {
            const {
                result: { current },
            } = renderTestHook({ state, currentHelpCenter: helpCenter })

            await flushPromises()

            expect(current.contactForm.subject_lines).toEqual(
                contactForm.subject_lines,
            )

            expect(current.contactForm.card_enabled).toEqual(
                !contactForm.deactivated_datetime,
            )

            expect(current.emailIntegration.email).toEqual(
                helpCenter.email_integration?.email,
            )

            expect(current.emailIntegration.id).toEqual(
                helpCenter.email_integration?.id,
            )
        })

        it('updates help center correctly after changes', async () => {
            const { result } = renderTestHook({
                state,
                currentHelpCenter: helpCenter,
            })

            await act(async () => {
                result.current.updateEmailIntegration({
                    id: 1001,
                    email: 'XXXX@YYYY.ZZZZ',
                })

                result.current.updateContactForm({
                    ...result.current.contactForm,
                    card_enabled: false,
                    subject_lines: {
                        options: ['XXX'],
                        allow_other: false,
                    },
                })

                result.current.updateTranslation({
                    contactInfo: {
                        chat: {
                            enabled: true,
                            description: 'AAA',
                        },
                        email: {
                            enabled: false,
                            email: 'PTN@PNH.COM',
                            description: 'BBB',
                        },
                        phone: {
                            enabled: true,
                            phone_numbers: [
                                {
                                    phone_number: 'XXXXX',
                                    reference: 'YYYY',
                                },
                            ],
                            description: 'CCC',
                        },
                    },
                })
                await flushPromises()

                await result.current.updateHelpCenter()
                await flushPromises()
            })

            expect(mockGetContactFormById).toHaveBeenCalledTimes(0)
            expect(mockUpdateContactForm).toHaveBeenCalledTimes(1)
            expect(mockedUpdateHelpCenter).toHaveBeenCalledTimes(1)
            expect(mockedUpdateHelpCenterTranslation).toHaveBeenCalledTimes(1)

            expect(mockUpdateContactForm.mock.calls[0]).toStrictEqual(
                expect.arrayContaining([
                    111,
                    {
                        deactivated_datetime: expect.any(String),
                        subject_lines: {
                            allow_other: false,
                            options: ['XXX'],
                        },
                    },
                ]),
            )
            expect(mockedUpdateHelpCenter.mock.calls[0]).toMatchInlineSnapshot(`
                [
                  {
                    "help_center_id": 333,
                  },
                  {
                    "email_integration": {
                      "email": "XXXX@YYYY.ZZZZ",
                      "id": 1001,
                    },
                  },
                ]
            `)
            expect(mockedUpdateHelpCenterTranslation.mock.calls[0])
                .toMatchInlineSnapshot(`
                [
                  {
                    "help_center_id": 333,
                    "locale": "en-US",
                  },
                  {
                    "chat_app_key": "",
                    "contact_info": {
                      "chat": {
                        "description": "AAA",
                        "enabled": true,
                      },
                      "email": {
                        "description": "BBB",
                        "email": "PTN@PNH.COM",
                        "enabled": false,
                      },
                      "phone": {
                        "description": "CCC",
                        "enabled": true,
                        "phone_numbers": [
                          {
                            "phone_number": "XXXXX",
                            "reference": "YYYY",
                          },
                        ],
                      },
                    },
                  },
                ]
            `)
        })
    })
})
