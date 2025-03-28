import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { fromJS } from 'immutable'

import { campaignWithABGroup } from 'fixtures/abGroup'
import { campaign } from 'fixtures/campaign'
import * as useLocalStorage from 'hooks/useLocalStorage'
import useSearch from 'hooks/useSearch'
import * as isConvertSubscriberHook from 'pages/common/hooks/useIsConvertSubscriber'
import { ACTIVE_CAMPAIGNS_LIMIT } from 'pages/convert/campaigns/constants/lightCampaigns'
import { ABGroupStatus } from 'pages/convert/campaigns/types/enums/ABGroupStatus.enum'
import { CampaignScheduleRuleValueEnum } from 'pages/convert/campaigns/types/enums/CampaignScheduleSettingsValues.enum'
import { CampaignStatus } from 'pages/convert/campaigns/types/enums/CampaignStatus.enum'

import { Campaign } from '../../../types/Campaign'
import { CampaignTriggerType } from '../../../types/enums/CampaignTriggerType.enum'
import { createTrigger } from '../../../utils/createTrigger'
import { CampaignsTable } from '../CampaignsTable'

jest.mock('hooks/useSearch')
const useLocalStorageSpy = jest.spyOn(useLocalStorage, 'default') as jest.Mock

const CAMPAIGNS_COUNT = 19
const ACTIVE_CAMPAIGNS_COUNT = ACTIVE_CAMPAIGNS_LIMIT + 1

const data = Array.from({ length: CAMPAIGNS_COUNT }, (_, i) => ({
    id: i,
    name: `campaign ${i}`,
    language: 'en-US',
    triggers: [createTrigger(CampaignTriggerType.BusinessHours)],
    message_text: `campaign message ${i}`,
    message_html: `campaign message ${i}`,
    status:
        i < ACTIVE_CAMPAIGNS_COUNT // to be over the limit
            ? CampaignStatus.Active
            : CampaignStatus.Inactive,
})) as unknown[] as Campaign[]

const campaignListWithABGroup = [
    campaignWithABGroup,
    ...data,
] as unknown[] as Campaign[]

const integration = fromJS({
    id: '1',
    meta: {
        languages: [{ language: 'en-US', primary: true }],
        shop_type: 'shopify',
    },
})

const useIsConvertSubscriberSpy = jest.spyOn(
    isConvertSubscriberHook,
    'useIsConvertSubscriber',
)

const campaignWithSchedule = [
    {
        ...campaign,
        id: 'campaign-with-schedule',
        name: 'campaign with schedule',
        message_text: 'Campaign message 1',
        message_html: 'Campaign message 1',
        status: CampaignStatus.Inactive,
        schedule: {
            start_datetime: '2023-08-04T07:25:02.983Z',
            end_datetime: '2023-08-04T07:25:02.983Z',
            schedule_rule: CampaignScheduleRuleValueEnum.AllDay,
            custom_schedule: null,
        },
    },
] as unknown[] as Campaign[]

describe('<CampaignsTable />', () => {
    const onClickDelete = jest.fn()
    const onClickDuplicate = jest.fn()
    const onToggleCampaign = jest.fn()
    const onChangePage = jest.fn()
    const props = {
        data: data,
        page: 1,
        perPage: 10,
        integration: integration,
        isUpdatingCampaign: false,
        isDeletingCampaign: false,
        onClickDelete: onClickDelete,
        onClickDuplicate: onClickDuplicate,
        onToggleCampaign: onToggleCampaign,
        onChangePage: onChangePage,
    }

    describe('A/B Variants LD flag is disabled', () => {
        beforeEach(() => {
            Object.defineProperty(window, 'location', {
                value: {
                    search: '',
                },
            })
            ;(useSearch as jest.Mock).mockImplementation(() => ({}))
            useIsConvertSubscriberSpy.mockImplementation(() => true)
            useLocalStorageSpy.mockReturnValue([])
        })

        it('renders the `perPage` items', () => {
            const { container } = render(<CampaignsTable {...props} />)

            const rows = container.querySelectorAll('tr')

            expect(rows.length).toEqual(11) // 10 campaign rows + header row
        })

        it('renders the `perPage` items with offset', () => {
            const { container, rerender } = render(
                <CampaignsTable {...props} />,
            )

            const firstPage = container.querySelectorAll('tr')
            expect(firstPage.length).toEqual(11) // 10 campaign rows + header row

            rerender(<CampaignsTable {...props} page={2} />)

            const secondPage = container.querySelectorAll('tr')
            expect(secondPage.length).toEqual(10) // 9 campaign rows + header row
        })

        it('shows the preview tooltip', async () => {
            render(<CampaignsTable {...props} data={[data[0]]} />)

            fireEvent.mouseOver(screen.getByText('campaign 0'))

            await waitFor(() => {
                expect(
                    screen.getByText(data[0].message_text),
                ).toBeInTheDocument()
                expect(screen.getByText('Business hours')).toBeInTheDocument()
            })
        })

        it('does not show the pagination if there is only one page', () => {
            render(<CampaignsTable {...props} perPage={25} />)

            expect(() => screen.getByLabelText(/next/)).toThrow()
            expect(() => screen.getByLabelText(/previous/)).toThrow()
        })

        it('resets the page when the data changes', () => {
            const { rerender } = render(
                <CampaignsTable {...props} page={3} perPage={5} />,
            )

            expect(screen.getByLabelText('page-3')).toHaveAttribute(
                'aria-current',
                'true',
            )

            rerender(
                <CampaignsTable
                    {...props}
                    data={data.slice(0, 15)}
                    perPage={5}
                />,
            )

            expect(screen.getByLabelText('page-1')).toHaveAttribute(
                'aria-current',
                'true',
            )
        })

        it('blocks toggle activation when campaign has schedule and it is in past', () => {
            const newProps = {
                ...props,
                data: campaignWithSchedule,
            }

            const { container } = render(
                <CampaignsTable {...newProps} perPage={CAMPAIGNS_COUNT} />,
            )

            const disabledToggles = container.querySelectorAll(
                'label[class*="isdisabled"]',
            )
            expect(disabledToggles.length).toEqual(1)
        })

        it('blocks toggle activation when over the limit', () => {
            useIsConvertSubscriberSpy.mockImplementation(() => false)

            const { container } = render(
                <CampaignsTable {...props} perPage={CAMPAIGNS_COUNT} />,
            )

            const disabledToggles = container.querySelectorAll(
                'label[class*="isdisabled"]',
            )

            expect(disabledToggles.length).toEqual(
                CAMPAIGNS_COUNT - ACTIVE_CAMPAIGNS_COUNT,
            )
        })

        it('displays light campaign modal when toggling active campaign', () => {
            useIsConvertSubscriberSpy.mockImplementation(() => false)

            const { container, getByRole } = render(
                <CampaignsTable {...props} perPage={CAMPAIGNS_COUNT} />,
            )

            const toggles = Array.from(
                container.querySelectorAll('label[class*="label"]'),
            ).filter(
                (el) =>
                    !Array.from(el.classList).some((cn) =>
                        cn.includes('isdisabled'),
                    ),
            )

            expect(toggles.length).toEqual(ACTIVE_CAMPAIGNS_COUNT)

            const name = toggles[0].getAttribute('aria-label') || ''

            const toggle = getByRole('switch', {
                name,
            })

            fireEvent.click(toggle)

            expect(screen.getByText('Learn About Convert')).toBeInTheDocument()
        })
    })

    describe('A/B Variants LD flag is enabled', () => {
        const propsWithABGroup = {
            ...props,
            data: campaignListWithABGroup,
        }

        beforeEach(() => {
            Object.defineProperty(window, 'location', {
                value: {
                    search: '',
                },
            })
            ;(useSearch as jest.Mock).mockImplementation(() => ({}))
            useIsConvertSubscriberSpy.mockImplementation(() => true)
            useLocalStorageSpy.mockReturnValue([])
        })

        it('renders a/b test with other', () => {
            const { container, getByText } = render(
                <CampaignsTable {...propsWithABGroup} />,
            )

            const rows = container.querySelectorAll('tr')

            expect(rows.length).toEqual(11) // 10 campaign rows + header row

            expect(getByText('A/B Test')).toBeInTheDocument()
        })

        it('can toggle show/hide variants', async () => {
            const componentProps = {
                ...props,
                data: [campaignWithABGroup] as unknown[] as Campaign[],
            }

            const { container, getByText, queryByText } = render(
                <CampaignsTable {...componentProps} />,
            )

            expect(queryByText('Control Variant')).not.toBeInTheDocument()

            const toggleButton = container.querySelectorAll(
                'button[class*="toggleBtn"]',
            )
            expect(toggleButton.length).toEqual(1)

            act(() => {
                fireEvent.click(toggleButton[0])
            })

            await waitFor(() => {
                expect(getByText('Control Variant')).toBeInTheDocument()
            })
        })

        it('blocks toggle activation when A/B Group is completed', () => {
            const campaign = {
                campaignWithABGroup,
                ab_group: {
                    ...campaignWithABGroup,
                    status: ABGroupStatus.Completed,
                },
            }
            const componentProps = {
                ...props,
                data: [campaign] as unknown[] as Campaign[],
            }

            const { container } = render(<CampaignsTable {...componentProps} />)

            const disabledToggles = container.querySelectorAll(
                'label[class*="isdisabled"]',
            )

            expect(disabledToggles.length).toEqual(1)
        })
    })
})
