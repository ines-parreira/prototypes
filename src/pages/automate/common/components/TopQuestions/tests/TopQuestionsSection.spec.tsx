import React from 'react'

import { act, fireEvent, render, screen } from '@testing-library/react'

import { logEvent, SegmentEvent } from 'common/segment'
import { IntegrationType } from 'models/integration/constants'

import { TopQuestionsSection } from '../TopQuestionsSection'

jest.mock('common/segment')
const logEventMock = logEvent as jest.MockedFunction<typeof logEvent>

describe('<TopQuestionsSection />', () => {
    it('renders top questions', () => {
        const setSelectedHelpCenterId = jest.fn()
        const setSelectedShopIntegrationId = jest.fn()
        const onCreateArticle = jest.fn().mockReturnValue(Promise.resolve())
        const onDismiss = jest.fn().mockReturnValue(Promise.resolve())

        const { container } = render(
            <TopQuestionsSection
                newQuestionsCount={5}
                topQuestions={[
                    {
                        title: 'How can I ensure my apartment number is included on the shipping label?',
                        ticketsCount: 439,
                        templateKey: 'templateKey1',
                    },
                    {
                        title: 'Are new customers eligible for any discounts?',
                        ticketsCount: 392,
                        templateKey: 'templateKey2',
                    },
                    {
                        title: "What should I do if my package is marked as delivered but I haven't received it?",
                        ticketsCount: 201,
                        templateKey: 'templateKey3',
                    },
                    {
                        title: 'Can I cancel my order after placing it?',
                        ticketsCount: 99,
                        templateKey: 'templateKey4',
                    },
                    {
                        title: 'Yet another question, it should not be displayed because it is the 5th',
                        ticketsCount: 50,
                        templateKey: 'templateKey5',
                    },
                ]}
                onCreateArticle={onCreateArticle}
                onDismiss={onDismiss}
                helpCenterFilter={{
                    options: [
                        {
                            name: 'BSB Help Center',
                            helpCenterId: 1,
                        },
                        {
                            name: 'Support Internal Help Center',
                            helpCenterId: 2,
                        },
                    ],
                    setSelectedHelpCenterId,
                }}
                storeFilter={{
                    options: [
                        {
                            shopName: 'Brown Sugar Babe',
                            shopType: IntegrationType.Shopify,
                            integrationId: 1,
                        },
                        {
                            shopName: 'Brown Sugar Babe (CA)',
                            shopType: IntegrationType.Shopify,
                            integrationId: 2,
                        },
                        {
                            shopName: 'Brown Sugar Babe (Int)',
                            shopType: IntegrationType.Magento2,
                            integrationId: 3,
                        },
                        {
                            shopName: 'Store 4',
                            shopType: IntegrationType.Magento2,
                            integrationId: 4,
                        },
                        {
                            shopName: 'Store 5',
                            shopType: IntegrationType.BigCommerce,
                            integrationId: 5,
                        },
                    ],
                    setSelectedStoreIntegrationId: setSelectedShopIntegrationId,
                }}
                storeIntegrationId={1000}
                helpCenterId={100}
            />,
        )

        expect(container).toContainHTML(
            'How can I ensure my apartment number is included on the shipping label?',
        )
        expect(container).toContainHTML(
            'Are new customers eligible for any discounts?',
        )
        expect(container).toContainHTML(
            "What should I do if my package is marked as delivered but I haven't received it?",
        )
        expect(container).toContainHTML(
            'Can I cancel my order after placing it?',
        )

        act(() => {
            fireEvent.click(screen.getAllByText('Create Article')[0])
        })

        expect(onCreateArticle).toHaveBeenCalledWith('templateKey1')

        act(() => {
            fireEvent.click(screen.getAllByText('close')[0])
        })

        expect(onDismiss).toHaveBeenCalledWith('templateKey1')

        expect(screen.getByText('View All')).toHaveAttribute(
            'to',
            '/app/automation/ai-recommendations?help_center_id=100&store_integration_id=1000',
        )
        act(() => {
            fireEvent.click(screen.getByText('View All'))
        })

        expect(logEventMock).toHaveBeenCalledWith(
            SegmentEvent.AutomateTopQuestionsSectionClickViewAll,
        )
    })

    it('renders placeholders if there are less than 4 top questions', () => {
        const { container } = render(
            <TopQuestionsSection
                newQuestionsCount={5}
                topQuestions={[
                    {
                        title: 'How can I ensure my apartment number is included on the shipping label?',
                        ticketsCount: 439,
                        templateKey: 'templateKey1',
                    },
                    {
                        title: 'Are new customers eligible for any discounts?',
                        ticketsCount: 392,
                        templateKey: 'templateKey2',
                    },
                ]}
                onCreateArticle={jest.fn()}
                onDismiss={jest.fn()}
                helpCenterFilter={{
                    options: [
                        {
                            name: 'BSB Help Center',
                            helpCenterId: 1,
                        },
                        {
                            name: 'Support Internal Help Center',
                            helpCenterId: 2,
                        },
                    ],
                    setSelectedHelpCenterId: jest.fn(),
                }}
                storeFilter={{
                    options: [
                        {
                            shopName: 'Brown Sugar Babe',
                            shopType: IntegrationType.Shopify,
                            integrationId: 1,
                        },
                        {
                            shopName: 'Brown Sugar Babe (CA)',
                            shopType: IntegrationType.Shopify,
                            integrationId: 2,
                        },
                    ],
                    setSelectedStoreIntegrationId: jest.fn(),
                }}
                storeIntegrationId={1000}
                helpCenterId={100}
            />,
        )

        expect(container.querySelectorAll('.topQuestions > div')).toHaveLength(
            4,
        )
    })
})
