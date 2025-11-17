import { assumeMock, flushPromises } from '@repo/testing'
import type { RenderResult } from '@testing-library/react'
import { act, fireEvent, screen, waitFor } from '@testing-library/react'
import type { Map } from 'immutable'
import { fromJS } from 'immutable'
import { mockFlags } from 'jest-launchdarkly-mock'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'

import { AttachmentEnum } from 'common/types'
import type { User } from 'config/types/user'
import { UserRole } from 'config/types/user'
import { useConvertGeneralSettings } from 'domains/reporting/pages/convert/hooks/useConvertGeneralSettings'
import {
    campaign as campaignFixture,
    campaignProductRecommendationAttachment,
    campaignSchedule as campaignScheduleFixture,
} from 'fixtures/campaign'
import { channelConnection } from 'fixtures/channelConnection'
import { integrationsState } from 'fixtures/integrations'
import { utmConfiguration } from 'fixtures/utmConfiguration'
import { useSuggestCampaignCopy } from 'models/convert/campaign/queries'
import * as isConvertSubscriberHook from 'pages/common/hooks/useIsConvertSubscriber'
import { useGetPreviewProducts } from 'pages/convert/campaigns/hooks/useGetPreviewProducts'
import { useUtm } from 'pages/convert/campaigns/hooks/useUtm'
import { CampaignScheduleModeEnum } from 'pages/convert/campaigns/types/enums/CampaignScheduleSettingsValues.enum'
import { useGetOrCreateChannelConnection } from 'pages/convert/common/hooks/useGetOrCreateChannelConnection'
import { getNewMessageAttachments } from 'state/newMessage/selectors'
import type { RootState, StoreDispatch } from 'state/types'
import { toJS } from 'utils'
import { getLDClient } from 'utils/launchDarkly'
import { renderWithRouter } from 'utils/testing'

import type { Campaign } from '../../../types/Campaign'
import { CampaignDetailsForm } from '../CampaignDetailsForm'

jest.mock('utils/launchDarkly')
jest.mock('pages/common/forms/RichField/RichFieldEditor')
jest.mock('pages/convert/common/hooks/useGetConvertStatus')
jest.mock('pages/convert/common/components/ConvertSubscriptionModal', () => {
    return jest.fn(() => {
        return <div data-testid="mock-convert-subscription-modal" />
    })
})
jest.mock('pages/convert/campaigns/components/ConvertSetupBanner', () => {
    return jest.fn(() => {
        return <div data-testid="mock-convert-setup-banner" />
    })
})
jest.mock('pages/convert/campaigns/hooks/useGetPreviewProducts')
jest.mock('pages/convert/common/hooks/useGetOrCreateChannelConnection')
jest.mock('pages/convert/campaigns/hooks/useUtm.ts')
jest.mock('domains/reporting/pages/convert/hooks/useConvertGeneralSettings')
jest.mock('models/convert/campaign/queries')
const useGetOrCreateChannelConnectionMock = assumeMock(
    useGetOrCreateChannelConnection,
)

const useUtmMock = assumeMock(useUtm)
const useGetPreviewProductsMock = assumeMock(useGetPreviewProducts)
const mockStore = configureMockStore<RootState, StoreDispatch>()
const defaultState = { integrations: fromJS(integrationsState) } as RootState
const mockUseConvertGeneralSettings = assumeMock(useConvertGeneralSettings)
const mockGenerateSuggestions = jest.fn()

jest.mock('state/newMessage/selectors')
const getNewMessageAttachmentsMock = assumeMock(getNewMessageAttachments)

const agents = [
    {
        id: 1,
        name: 'Acme Support',
        email: 'hello@acme.gorgias.io',
        meta: {
            profile_picture_url:
                'https://config.gorgi.us/development/Zr1WE86rb6J4Mvgl/profile/Zr1WE86rb6J4Mvgl/0d18d2f5-97c0-44b5-b192-8c58367c60be.jpeg',
        },
        role: {
            name: UserRole.Agent,
        },
    },
    {
        id: 2,
        meta: {},
        name: 'Alex Plugaru',
        email: 'alex@gorgias.io',
        role: {
            name: UserRole.Agent,
        },
    },
    {
        id: 3,
        name: 'Bob Smith',
        email: 'agent-smith@gorgias.io',
        meta: {},
        role: {
            name: UserRole.Agent,
        },
    },
]

const shopifyChatIntegration: Map<any, any> = fromJS({
    type: 'gorgias_chat',
    id: '174',
    meta: {
        shop_type: 'shopify',
    },
})

const shopifyIntegration = fromJS({
    type: 'shopify',
    id: '1',
    meta: { shop_domain: 'shop-domain.com' },
})

const campaign = fromJS(campaignFixture)

const isConvertSubscriberSpy = jest.spyOn(
    isConvertSubscriberHook,
    'useIsConvertSubscriber',
)

describe('<CampaignDetailsForm />', () => {
    const onUpdateCampaign = jest.fn()

    beforeAll(() => {
        useGetOrCreateChannelConnectionMock.mockReturnValue({
            channelConnection: channelConnection,
        } as any)
        useUtmMock.mockReturnValue(utmConfiguration)
        mockUseConvertGeneralSettings.mockReturnValue({
            emailDisclaimer: {
                enabled: true,
                disclaimer: { en: 'foo' },
                disclaimer_default_accepted: true,
            },
            isLoading: false,
        })
        ;(useSuggestCampaignCopy as jest.Mock).mockReturnValue({
            mutateAsync: mockGenerateSuggestions,
        })
    })

    beforeEach(() => {
        mockFlags({})

        const allFlagsMock = getLDClient().allFlags as jest.Mock
        allFlagsMock.mockReturnValue({})

        isConvertSubscriberSpy.mockImplementation(() => false)

        useGetPreviewProductsMock.mockReturnValue([])
        getNewMessageAttachmentsMock.mockReturnValue(fromJS([]))

        onUpdateCampaign.mockReset()
    })

    const defaultProps = {
        agents: agents as User[],
        campaign: {} as Campaign,
        integration: shopifyChatIntegration,
        shopifyIntegration: shopifyIntegration,
        isLoading: false,
        createCampaign: jest.fn(),
        duplicateCampaign: jest.fn(),
        updateCampaign: onUpdateCampaign,
        deleteCampaign: jest.fn(),
        backUrl: '/back',
    }

    const renderComponent = (props: any) => {
        return renderWithRouter(
            <Provider store={mockStore(defaultState)}>
                <CampaignDetailsForm {...props} />
            </Provider>,
        )
    }

    describe('Create campaign', () => {
        let result: RenderResult
        beforeEach(() => {
            result = renderComponent(defaultProps)
        })

        it('renders all 3 steps', () => {
            expect(screen.getByText('Set up the basics')).toBeInTheDocument()
            expect(screen.getByText('Choose your audience')).toBeInTheDocument()
            expect(screen.getByText('Write your message')).toBeInTheDocument()
        })

        it('opens the Basics step by default', () => {
            expect(screen.getByText('Campaign name')).toBeInTheDocument()
        })

        it('disables the button until the form is valid', async () => {
            expect(
                screen.getByRole('button', { name: 'Create' }),
            ).toBeAriaDisabled()

            result.rerender(
                <Provider store={mockStore(defaultState)}>
                    <CampaignDetailsForm
                        {...defaultProps}
                        campaign={toJS(campaign)}
                    />
                </Provider>,
            )

            act(() => {
                fireEvent.click(screen.getByText(/Publish your campaign/))
            })

            await waitFor(() => {
                expect(
                    screen.getByRole('button', { name: 'Create' }),
                ).toBeAriaEnabled()
            })
        })

        it('console.error when createCampaign is not defined', async () => {
            const consoleErrorMock = jest.spyOn(console, 'error')

            result.rerender(
                <Provider store={mockStore(defaultState)}>
                    <CampaignDetailsForm
                        {...defaultProps}
                        campaign={toJS(campaign)}
                        isEditMode={false}
                        createCampaign={undefined}
                    />
                </Provider>,
            )

            act(() => {
                fireEvent.click(screen.getByText(/Publish your campaign/))
            })

            await waitFor(() => {
                expect(
                    screen.getByRole('button', { name: 'Create' }),
                ).toBeAriaEnabled()
            })

            fireEvent.click(screen.getByRole('button', { name: 'Create' }))

            await waitFor(() => {
                const activateButton = screen.getByText('Create')
                activateButton.click()

                expect(consoleErrorMock).toBeCalledWith(
                    'Cannot create campaign!',
                )
            })
        })
    })

    describe('Edit campaign', () => {
        let result: RenderResult

        beforeEach(() => {
            result = renderComponent(defaultProps)
        })

        it('renders all 3 steps', () => {
            expect(screen.getByText('Set up the basics')).toBeInTheDocument()
            expect(screen.getByText('Choose your audience')).toBeInTheDocument()
            expect(screen.getByText('Write your message')).toBeInTheDocument()
        })

        it('opens the Basics step by default', () => {
            expect(screen.getByText('Add condition')).toBeInTheDocument()
        })

        it('populate schedule data correctly', () => {
            const campaignWithSchedule = {
                ...campaignFixture,
                schedule: campaignScheduleFixture,
            } as Campaign

            const props = {
                ...defaultProps,
                campaign: campaignWithSchedule,
                displayScheduleSection: true,
            }

            result.rerender(
                <Provider store={mockStore(defaultState)}>
                    <CampaignDetailsForm {...props} />
                </Provider>,
            )

            act(() => {
                fireEvent.click(screen.getByText(/Publish your campaign/))
            })

            const scheduleOption = result.container.querySelector(
                `#${CampaignScheduleModeEnum.Schedule}`,
            )
            expect(scheduleOption).toBeChecked()
        })

        it('updates state on schedule rule change', () => {
            const campaignWithSchedule = {
                ...campaignFixture,
                schedule: campaignScheduleFixture,
            } as Campaign

            const props = {
                ...defaultProps,
                isEditMode: true,
                campaign: campaignWithSchedule,
                displayScheduleSection: true,
            }

            result.rerender(
                <Provider store={mockStore(defaultState)}>
                    <CampaignDetailsForm {...props} />
                </Provider>,
            )

            act(() => {
                fireEvent.click(screen.getByText(/Publish your campaign/))
            })

            const scheduleOption = result.container.querySelector(
                `#${CampaignScheduleModeEnum.Schedule}`,
            ) as Element

            act(() => {
                fireEvent.click(scheduleOption)
            })

            fireEvent.click(
                screen.getByRole('button', { name: 'Update Campaign' }),
            )

            expect(onUpdateCampaign).toHaveBeenCalledTimes(1)
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            expect(toJS(onUpdateCampaign.mock.calls[0][0])).toEqual(
                expect.objectContaining({
                    schedule: {
                        custom_schedule: [],
                        end_datetime: null,
                        schedule_rule: 'anytime',
                        start_datetime: expect.any(String),
                    },
                }),
            )
        })

        it('updates state on suggestion apply', async () => {
            isConvertSubscriberSpy.mockImplementation(() => true)
            mockGenerateSuggestions.mockResolvedValue({
                data: { suggestions: ['Suggestion 1', 'Suggestion 2'] },
            })

            const props = {
                ...defaultProps,
                isEditMode: true,
            }

            result.rerender(
                <Provider store={mockStore(defaultState)}>
                    <CampaignDetailsForm {...props} />
                </Provider>,
            )

            await act(async () => {
                fireEvent.click(screen.getByText(/Generate/))
            })

            await flushPromises()

            await act(async () => {
                fireEvent.click(screen.getByText(/Apply/))
            })

            await act(async () => {
                fireEvent.click(screen.getByText(/Update Campaign/))
            })

            expect(onUpdateCampaign).toHaveBeenCalledTimes(1)

            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            expect(toJS(onUpdateCampaign.mock.calls[0][0])).toEqual(
                expect.objectContaining({
                    meta: {
                        copySuggestion: 'Suggestion 1',
                        delay: 0,
                    },
                }),
            )
        })

        it('updates state on suggestion apply when campaign had meta', async () => {
            isConvertSubscriberSpy.mockImplementation(() => true)
            mockGenerateSuggestions.mockResolvedValue({
                data: { suggestions: ['Suggestion 1', 'Suggestion 2'] },
            })

            const props = {
                ...defaultProps,
                isEditMode: true,
                campaign: campaignFixture as Campaign,
            }

            result.rerender(
                <Provider store={mockStore(defaultState)}>
                    <CampaignDetailsForm {...props} />
                </Provider>,
            )

            await act(async () => {
                fireEvent.click(screen.getByText(/Generate/))
            })

            await flushPromises()

            await act(async () => {
                fireEvent.click(screen.getByText(/Apply/))
            })

            act(() => {
                fireEvent.click(screen.getByText(/Update Campaign/))
            })

            expect(onUpdateCampaign).toHaveBeenCalledTimes(1)

            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            expect(toJS(onUpdateCampaign.mock.calls[0][0])).toEqual(
                expect.objectContaining({
                    meta: expect.objectContaining({
                        copySuggestion: 'Suggestion 1',
                    }),
                }),
            )
        })
    })

    describe('Light campaign banner', () => {
        const bannerText = "Light campaigns don't allow advanced triggers"
        const lightCampaign = {
            name: 'Light campaign',
            is_light: true,
        } as Campaign

        it('renders the banner when campaign is light, is subscriber, is shopify', () => {
            isConvertSubscriberSpy.mockImplementation(() => true)

            const { queryByText } = renderComponent({
                ...defaultProps,
                isShopifyStore: true,
                campaign: lightCampaign,
            })

            expect(
                queryByText(bannerText, {
                    exact: false,
                }),
            ).toBeInTheDocument()
        })

        it('does not render the banner when is not a Convert subscriber', () => {
            isConvertSubscriberSpy.mockImplementation(() => false)

            const { queryByText } = renderComponent({
                ...defaultProps,
                campaign: lightCampaign,
            })

            expect(
                queryByText(bannerText, {
                    exact: false,
                }),
            ).not.toBeInTheDocument()
        })

        it('does not render the banner when campaign is not light', () => {
            isConvertSubscriberSpy.mockImplementation(() => true)

            const { queryByText } = renderComponent(defaultProps)

            expect(
                queryByText(bannerText, {
                    exact: false,
                }),
            ).not.toBeInTheDocument()
        })

        it('does not render the banner when integration is not shopify', () => {
            isConvertSubscriberSpy.mockImplementation(() => true)

            const integration = fromJS({
                ...shopifyChatIntegration.toJS(),
                meta: {
                    shop_type: 'magento',
                },
            })

            const { queryByText } = renderComponent({
                ...defaultProps,
                integration: integration,
                campaign: lightCampaign,
            })

            expect(
                queryByText(bannerText, {
                    exact: false,
                }),
            ).not.toBeInTheDocument()
        })
    })

    describe('Product recommendation banner', () => {
        it('renders the banner when product recommendation is in attachments', async () => {
            isConvertSubscriberSpy.mockImplementation(() => true)
            getNewMessageAttachmentsMock.mockReturnValue(
                fromJS([
                    {
                        ...campaignProductRecommendationAttachment,
                        content_type: AttachmentEnum.ProductRecommendation,
                    },
                ]),
            )

            const { queryByText } = renderComponent(defaultProps)

            await waitFor(() => {
                expect(
                    queryByText(
                        'Product recommendations will be personalized for each product page',
                        {
                            exact: false,
                        },
                    ),
                ).toBeInTheDocument()
            })
        })
    })

    describe('Campaign prioritization feature flag is enabled', () => {
        beforeEach(() => {
            isConvertSubscriberSpy.mockImplementation(() => true)
        })

        it('renders campaign frequency section', () => {
            const { getByText } = renderComponent(defaultProps)

            expect(
                getByText('Time between campaign displays'),
            ).toBeInTheDocument()

            expect(getByText('Maximum campaign displays')).toBeInTheDocument()
        })

        it('user can enable features', async () => {
            const props = {
                ...defaultProps,
                isEditMode: true,
                campaign: {
                    ...campaignFixture,
                } as Campaign,
                displayScheduleSection: true,
            }

            const { container } = renderComponent(props)

            act(() => {
                fireEvent.click(
                    container.querySelector(
                        '#maximum-displayed-campaigns',
                    ) as Element,
                )
                fireEvent.click(
                    container.querySelector(
                        '#time-between-campaigns',
                    ) as Element,
                )
            })

            fireEvent.click(
                screen.getByRole('button', { name: 'Update Campaign' }),
            )
            await waitFor(() => {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                expect(toJS(onUpdateCampaign.mock.calls[0][0])).toEqual(
                    expect.objectContaining({
                        meta: expect.objectContaining({
                            maxCampaignDisplaysInSession: { value: 8 },
                            minimumTimeBetweenCampaigns: {
                                value: 30,
                                unit: 'seconds',
                            },
                        }),
                    }),
                )
            })
        })
    })
})
