import { useHelpdeskV2MS2Flag } from '@repo/feature-flags'
import * as repoNavigation from '@repo/navigation'
import { shortcutManager } from '@repo/utils'
import { act, screen, waitFor } from '@testing-library/react'
import type { Mock, MockInstance } from 'vitest'

import { render } from '../../../tests/render.utils'
import { TicketInfobarNavigation } from '../TicketInfobarNavigation'

vi.mock('@repo/feature-flags', async (importOriginal) => ({
    ...(await importOriginal()),
    useHelpdeskV2MS2Flag: vi.fn(),
}))

const mockPush = vi.fn()

const { useHistory } = vi.hoisted(() => ({
    useHistory: vi.fn(),
}))

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom')
    return {
        ...actual,
        useHistory,
    }
})

const mockUseHelpdeskV2MS2Flag = vi.mocked(useHelpdeskV2MS2Flag)

const { TicketInfobarTab, EditFieldsType } = repoNavigation

describe('TicketInfobarNavigation', () => {
    let useTicketInfobarNavigationMock: MockInstance
    let onChangeTab: Mock
    let onToggle: Mock

    beforeEach(() => {
        onChangeTab = vi.fn()
        onToggle = vi.fn()
        mockPush.mockClear()
        useHistory.mockReturnValue({ push: mockPush })
        mockUseHelpdeskV2MS2Flag.mockReturnValue(false)

        useTicketInfobarNavigationMock = vi.spyOn(
            repoNavigation,
            'useTicketInfobarNavigation',
        )
        useTicketInfobarNavigationMock.mockReturnValue({
            activeTab: TicketInfobarTab.Customer,
            isExpanded: true,
            onChangeTab,
            onToggle,
            onSetEditingWidgetType: vi.fn(),
        })
    })

    it('should render the infobar navigation', async () => {
        render(<TicketInfobarNavigation />)

        await waitFor(() => {
            expect(
                screen.getByLabelText('system-bar-collapse'),
            ).toBeInTheDocument()
        })
    })

    it('should render the "AI Feedback" tab when the `hasAIFeedback` prop is true', async () => {
        render(<TicketInfobarNavigation hasAIFeedback />)

        await waitFor(() => {
            expect(
                screen.getByLabelText('ai-agent-feedback'),
            ).toBeInTheDocument()
        })
    })

    it('should change to the "Customer" tab when that icon is clicked', async () => {
        const { user } = render(<TicketInfobarNavigation />)

        const button = screen.getByLabelText('customer-info').closest('button')

        await user.click(button!)

        expect(onChangeTab).toHaveBeenCalledWith(TicketInfobarTab.Customer)
    })

    it('should change to the "AI Feedback" tab when that icon is clicked', async () => {
        const { user } = render(<TicketInfobarNavigation hasAIFeedback />)

        const button = screen
            .getByLabelText('ai-agent-feedback')
            .closest('button')

        await user.click(button!)

        expect(onChangeTab).toHaveBeenCalledWith(TicketInfobarTab.AIFeedback)
    })

    it('should change to the "Customer" tab when that icon is clicked', async () => {
        const { user } = render(<TicketInfobarNavigation />)

        const button = screen.getByLabelText('star').closest('button')
        await user.click(button!)

        expect(onChangeTab).toHaveBeenCalledWith(TicketInfobarTab.AutoQA)
    })

    it('should render the "Shopify" tab when `useHelpdeskV2MS2Flag` returns true', async () => {
        mockUseHelpdeskV2MS2Flag.mockReturnValue(true)
        render(<TicketInfobarNavigation hasShopify />)

        await waitFor(() => {
            expect(screen.getByLabelText('app-shopify')).toBeInTheDocument()
        })
    })

    it('should not render the "Shopify" tab when `useHelpdeskV2MS2Flag` returns false', async () => {
        mockUseHelpdeskV2MS2Flag.mockReturnValue(false)
        render(<TicketInfobarNavigation />)

        await waitFor(() => {
            expect(
                screen.queryByLabelText('app-shopify'),
            ).not.toBeInTheDocument()
        })
    })

    it('should change to the "Shopify" tab when that icon is clicked', async () => {
        mockUseHelpdeskV2MS2Flag.mockReturnValue(true)
        const { user } = render(<TicketInfobarNavigation hasShopify />)

        const button = screen.getByLabelText('app-shopify').closest('button')

        await user.click(button!)

        expect(onChangeTab).toHaveBeenCalledWith(TicketInfobarTab.Shopify)
    })

    it('should render the "Timeline" tab when the `hasTimeline` prop is true', async () => {
        render(<TicketInfobarNavigation hasTimeline />)

        await waitFor(() => {
            expect(screen.getByLabelText('history')).toBeInTheDocument()
        })
    })

    it('should not render the "Timeline" tab when `hasTimeline` is false', async () => {
        render(<TicketInfobarNavigation />)

        await waitFor(() => {
            expect(screen.queryByLabelText('history')).not.toBeInTheDocument()
        })
    })

    it('should change to the "Timeline" tab when that icon is clicked', async () => {
        const { user } = render(<TicketInfobarNavigation hasTimeline />)

        const button = screen.getByLabelText('history').closest('button')

        await user.click(button!)

        expect(onChangeTab).toHaveBeenCalledWith(TicketInfobarTab.Timeline)
    })

    describe('Recharge tab', () => {
        it('should render the "Recharge" tab when useHelpdeskV2MS2Flag is true and hasRecharge is true', async () => {
            mockUseHelpdeskV2MS2Flag.mockReturnValue(true)
            render(<TicketInfobarNavigation hasRecharge />)

            await waitFor(() => {
                expect(
                    screen.getByLabelText('app-recharge'),
                ).toBeInTheDocument()
            })
        })

        it('should not render the "Recharge" tab when useHelpdeskV2MS2Flag is true but hasRecharge is false', async () => {
            mockUseHelpdeskV2MS2Flag.mockReturnValue(true)
            render(<TicketInfobarNavigation />)

            await waitFor(() => {
                expect(
                    screen.queryByLabelText('app-recharge'),
                ).not.toBeInTheDocument()
            })
        })

        it('should not render the "Recharge" tab when useHelpdeskV2MS2Flag is false even if hasRecharge is true', async () => {
            mockUseHelpdeskV2MS2Flag.mockReturnValue(false)
            render(<TicketInfobarNavigation hasRecharge />)

            await waitFor(() => {
                expect(
                    screen.queryByLabelText('app-recharge'),
                ).not.toBeInTheDocument()
            })
        })

        it('should change to the "Recharge" tab when the icon is clicked', async () => {
            mockUseHelpdeskV2MS2Flag.mockReturnValue(true)
            const { user } = render(<TicketInfobarNavigation hasRecharge />)

            const button = screen
                .getByLabelText('app-recharge')
                .closest('button')

            await user.click(button!)

            expect(onChangeTab).toHaveBeenCalledWith(TicketInfobarTab.Recharge)
        })
    })

    describe('BigCommerce tab', () => {
        it('should render the "BigCommerce" tab when useHelpdeskV2MS2Flag is true and hasBigCommerce is true', async () => {
            mockUseHelpdeskV2MS2Flag.mockReturnValue(true)
            render(<TicketInfobarNavigation hasBigCommerce />)

            await waitFor(() => {
                expect(
                    screen.getByLabelText('app-bicommerce'),
                ).toBeInTheDocument()
            })
        })

        it('should not render the "BigCommerce" tab when useHelpdeskV2MS2Flag is false', async () => {
            mockUseHelpdeskV2MS2Flag.mockReturnValue(false)
            render(<TicketInfobarNavigation hasBigCommerce />)

            await waitFor(() => {
                expect(
                    screen.queryByLabelText('app-bicommerce'),
                ).not.toBeInTheDocument()
            })
        })

        it('should change to the "BigCommerce" tab when the icon is clicked', async () => {
            mockUseHelpdeskV2MS2Flag.mockReturnValue(true)
            const { user } = render(<TicketInfobarNavigation hasBigCommerce />)

            const button = screen
                .getByLabelText('app-bicommerce')
                .closest('button')

            await user.click(button!)

            expect(onChangeTab).toHaveBeenCalledWith(
                TicketInfobarTab.BigCommerce,
            )
        })
    })

    describe('Magento tab', () => {
        it('should render the "Magento" tab when useHelpdeskV2MS2Flag is true and hasMagento is true', async () => {
            mockUseHelpdeskV2MS2Flag.mockReturnValue(true)
            render(<TicketInfobarNavigation hasMagento />)

            await waitFor(() => {
                expect(screen.getByLabelText('app-magento')).toBeInTheDocument()
            })
        })

        it('should not render the "Magento" tab when useHelpdeskV2MS2Flag is false', async () => {
            mockUseHelpdeskV2MS2Flag.mockReturnValue(false)
            render(<TicketInfobarNavigation hasMagento />)

            await waitFor(() => {
                expect(
                    screen.queryByLabelText('app-magento'),
                ).not.toBeInTheDocument()
            })
        })

        it('should change to the "Magento" tab when the icon is clicked', async () => {
            mockUseHelpdeskV2MS2Flag.mockReturnValue(true)
            const { user } = render(<TicketInfobarNavigation hasMagento />)

            const button = screen
                .getByLabelText('app-magento')
                .closest('button')

            await user.click(button!)

            expect(onChangeTab).toHaveBeenCalledWith(TicketInfobarTab.Magento)
        })
    })

    describe('WooCommerce tab', () => {
        it('should render the "WooCommerce" tab when useHelpdeskV2MS2Flag is true and hasWooCommerce is true', async () => {
            mockUseHelpdeskV2MS2Flag.mockReturnValue(true)
            render(<TicketInfobarNavigation hasWooCommerce />)

            await waitFor(() => {
                expect(screen.getByLabelText('app-woo')).toBeInTheDocument()
            })
        })

        it('should not render the "WooCommerce" tab when useHelpdeskV2MS2Flag is false', async () => {
            mockUseHelpdeskV2MS2Flag.mockReturnValue(false)
            render(<TicketInfobarNavigation hasWooCommerce />)

            await waitFor(() => {
                expect(
                    screen.queryByLabelText('app-woo'),
                ).not.toBeInTheDocument()
            })
        })

        it('should change to the "WooCommerce" tab when the icon is clicked', async () => {
            mockUseHelpdeskV2MS2Flag.mockReturnValue(true)
            const { user } = render(<TicketInfobarNavigation hasWooCommerce />)

            const button = screen.getByLabelText('app-woo').closest('button')

            await user.click(button!)

            expect(onChangeTab).toHaveBeenCalledWith(
                TicketInfobarTab.WooCommerce,
            )
        })
    })

    describe('Smile tab', () => {
        it('should render the "Smile" tab when useHelpdeskV2MS2Flag is true and hasSmile is true', async () => {
            mockUseHelpdeskV2MS2Flag.mockReturnValue(true)
            render(<TicketInfobarNavigation hasSmile />)

            await waitFor(() => {
                expect(screen.getByLabelText('emoji-smile')).toBeInTheDocument()
            })
        })

        it('should not render the "Smile" tab when useHelpdeskV2MS2Flag is false', async () => {
            mockUseHelpdeskV2MS2Flag.mockReturnValue(false)
            render(<TicketInfobarNavigation hasSmile />)

            await waitFor(() => {
                expect(
                    screen.queryByLabelText('emoji-smile'),
                ).not.toBeInTheDocument()
            })
        })

        it('should change to the "Smile" tab when the icon is clicked', async () => {
            mockUseHelpdeskV2MS2Flag.mockReturnValue(true)
            const { user } = render(<TicketInfobarNavigation hasSmile />)

            const button = screen
                .getByLabelText('emoji-smile')
                .closest('button')

            await user.click(button!)

            expect(onChangeTab).toHaveBeenCalledWith(TicketInfobarTab.Smile)
        })
    })

    describe('Yotpo tab', () => {
        it('should render the "Yotpo" tab when useHelpdeskV2MS2Flag is true and hasYotpo is true', async () => {
            mockUseHelpdeskV2MS2Flag.mockReturnValue(true)
            render(<TicketInfobarNavigation hasYotpo />)

            await waitFor(() => {
                expect(screen.getByLabelText('app-yotpo')).toBeInTheDocument()
            })
        })

        it('should not render the "Yotpo" tab when useHelpdeskV2MS2Flag is false', async () => {
            mockUseHelpdeskV2MS2Flag.mockReturnValue(false)
            render(<TicketInfobarNavigation hasYotpo />)

            await waitFor(() => {
                expect(
                    screen.queryByLabelText('app-yotpo'),
                ).not.toBeInTheDocument()
            })
        })

        it('should change to the "Yotpo" tab when the icon is clicked', async () => {
            mockUseHelpdeskV2MS2Flag.mockReturnValue(true)
            const { user } = render(<TicketInfobarNavigation hasYotpo />)

            const button = screen.getByLabelText('app-yotpo').closest('button')

            await user.click(button!)

            expect(onChangeTab).toHaveBeenCalledWith(TicketInfobarTab.Yotpo)
        })
    })

    describe('Edit widget data menu', () => {
        const onSetEditingWidgetType = vi.fn()

        beforeEach(() => {
            mockUseHelpdeskV2MS2Flag.mockReturnValue(true)
            useTicketInfobarNavigationMock.mockReturnValue({
                activeTab: TicketInfobarTab.Customer,
                isExpanded: true,
                onChangeTab,
                onToggle,
                onSetEditingWidgetType,
            })
        })

        it.each([
            {
                label: 'Shopify',
                prop: 'hasShopify',
                tab: TicketInfobarTab.Shopify,
                editType: EditFieldsType.Shopify,
            },
            {
                label: 'Recharge',
                prop: 'hasRecharge',
                tab: TicketInfobarTab.Recharge,
                editType: EditFieldsType.Recharge,
            },
            {
                label: 'BigCommerce',
                prop: 'hasBigCommerce',
                tab: TicketInfobarTab.BigCommerce,
                editType: EditFieldsType.Bigcommerce,
            },
            {
                label: 'Magento',
                prop: 'hasMagento',
                tab: TicketInfobarTab.Magento,
                editType: EditFieldsType.Magento,
            },
            {
                label: 'WooCommerce',
                prop: 'hasWooCommerce',
                tab: TicketInfobarTab.WooCommerce,
                editType: EditFieldsType.Woocommerce,
            },
            {
                label: 'Smile',
                prop: 'hasSmile',
                tab: TicketInfobarTab.Smile,
                editType: EditFieldsType.Smile,
            },
            {
                label: 'Yotpo',
                prop: 'hasYotpo',
                tab: TicketInfobarTab.Yotpo,
                editType: EditFieldsType.Yotpo,
            },
        ])(
            'should call onChangeTab and onSetEditingWidgetType when $label menu item is clicked',
            async ({ label, prop, tab, editType }) => {
                const { user } = render(
                    <TicketInfobarNavigation {...{ [prop]: true }} />,
                )

                await user.click(screen.getByLabelText('Edit Widget data'))

                await user.click(
                    screen.getByRole('menuitem', {
                        name: new RegExp(`${label}$`),
                    }),
                )

                expect(onChangeTab).toHaveBeenCalledWith(tab)
                expect(onSetEditingWidgetType).toHaveBeenCalledWith(editType)
            },
        )
    })

    describe('Tab click when collapsed', () => {
        it('should expand the infobar when a tab icon is clicked while collapsed', async () => {
            useTicketInfobarNavigationMock.mockReturnValue({
                activeTab: TicketInfobarTab.Customer,
                isExpanded: false,
                onChangeTab,
                onToggle,
            })
            const { user } = render(<TicketInfobarNavigation />)

            const button = screen
                .getByLabelText('customer-info')
                .closest('button')
            await user.click(button!)

            expect(onChangeTab).toHaveBeenCalledWith(TicketInfobarTab.Customer)
            expect(onToggle).toHaveBeenCalled()
        })

        it('should not call onToggle when a tab icon is clicked while already expanded', async () => {
            const { user } = render(<TicketInfobarNavigation />)

            const button = screen
                .getByLabelText('customer-info')
                .closest('button')
            await user.click(button!)

            expect(onChangeTab).toHaveBeenCalledWith(TicketInfobarTab.Customer)
            expect(onToggle).not.toHaveBeenCalled()
        })
    })

    describe('Edit Widget data menu', () => {
        it('should navigate to integrations settings when "Add new app" is clicked', async () => {
            mockUseHelpdeskV2MS2Flag.mockReturnValue(true)
            const { user } = render(<TicketInfobarNavigation />)

            const settingsButton = screen.getByRole('button', {
                name: 'Edit Widget data',
            })
            await user.click(settingsButton)

            const addNewAppItem = await screen.findByText('Add new app')
            await user.click(addNewAppItem)

            expect(mockPush).toHaveBeenCalledWith('/app/settings/integrations')
        })
    })

    describe('Expand/Collapse button', () => {
        it('should display the expand button when the infobar is collapsed', async () => {
            useTicketInfobarNavigationMock.mockReturnValue({
                activeTab: TicketInfobarTab.Customer,
                isExpanded: false,
                onChangeTab,
                onToggle,
            })
            render(<TicketInfobarNavigation />)

            await waitFor(() => {
                expect(
                    screen.getByLabelText('system-bar-expand'),
                ).toBeInTheDocument()
            })
        })

        it('should call onToggle when the toggle button is pressed', async () => {
            const { user } = render(<TicketInfobarNavigation />)

            const button = screen
                .getByLabelText('system-bar-collapse')
                .closest('button')

            await user.click(button!)

            expect(onToggle).toHaveBeenCalled()
        })

        it('should call onToggle when the "]" shortcut is pressed', async () => {
            render(<TicketInfobarNavigation />)

            await act(() => shortcutManager.trigger(']'))

            expect(onToggle).toHaveBeenCalled()
        })

        it('should display the collapse button when the infobar is expanded', async () => {
            render(<TicketInfobarNavigation />)

            await waitFor(() => {
                expect(
                    screen.getByLabelText('system-bar-collapse'),
                ).toBeInTheDocument()
            })
        })
    })
})
