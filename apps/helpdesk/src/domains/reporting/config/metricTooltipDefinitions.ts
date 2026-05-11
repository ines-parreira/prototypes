import type { MetricTooltipConfig } from '@repo/reporting'

const GLOSSARY_LINK = 'https://link.gorgias.com/f7f18e'
const HOW_IS_IT_CALCULATED = 'How is it calculated?'

export const METRIC_TOOLTIPS = {
    overallAutomationRate: {
        title: 'Overall automation rate',
        caption:
            'Percentage of all shopper interactions fully handled by automation, with no human agent involved.',
        link: GLOSSARY_LINK,
        linkText: HOW_IS_IT_CALCULATED,
    },
    automatedInteractionsInOverview: {
        title: 'Automated interactions',
        caption:
            'Interactions automation features resolved from start to finish, with no human agent involved.',
        link: GLOSSARY_LINK,
        linkText: HOW_IS_IT_CALCULATED,
    },
    automatedInteractionsInAiAgent: {
        title: 'Automated interactions',
        caption:
            'Interactions AI Agent resolved from start to finish, with no human agent involved.',
        link: GLOSSARY_LINK,
        linkText: HOW_IS_IT_CALCULATED,
    },
    timeSavedByAgentsInOverview: {
        title: 'Time saved by agents',
        caption:
            'Estimated time your team saves from interactions automation features handled instead of human agents.',
        link: GLOSSARY_LINK,
        linkText: HOW_IS_IT_CALCULATED,
    },
    timeSavedByAgentsInAiAgent: {
        title: 'Time saved by agents',
        caption:
            'Estimated time your team saves from interactions AI Agent handled instead of a human agent.',
        link: GLOSSARY_LINK,
        linkText: HOW_IS_IT_CALCULATED,
    },
    costSaved: {
        title: 'Cost saved',
        caption:
            'Estimated cost savings from interactions AI Agent handled instead of a human agent.',
        link: GLOSSARY_LINK,
        linkText: HOW_IS_IT_CALCULATED,
    },
    handoverInteractionsInOverview: {
        title: 'Handover interactions',
        caption:
            'Interactions that ended with a shopper being connected to a human agent.',
        link: GLOSSARY_LINK,
        linkText: HOW_IS_IT_CALCULATED,
    },
    handoverInteractionsInAiAgent: {
        title: 'Handover interactions',
        caption:
            'Interactions AI Agent transferred to a human agent for further support.',
        link: GLOSSARY_LINK,
        linkText: HOW_IS_IT_CALCULATED,
    },
    decreaseInResolutionTimeInOverview: {
        title: 'Decrease in resolution time',
        caption:
            'How much faster automation features resolve tickets on median, compared to human agents.',
        link: GLOSSARY_LINK,
        linkText: HOW_IS_IT_CALCULATED,
    },
    decreaseInResolutionTimeInAiAgent: {
        title: 'Decrease in resolution time',
        caption:
            'How much faster AI Agent resolves tickets on median, compared to human agents.',
        link: GLOSSARY_LINK,
        linkText: HOW_IS_IT_CALCULATED,
    },
    decreaseInFRTInOverview: {
        title: 'Decrease in first response time',
        caption:
            'How much faster shoppers receive a first reply when an automation feature handles the ticket, compared to a human agent.',
        link: GLOSSARY_LINK,
        linkText: HOW_IS_IT_CALCULATED,
    },
    decreaseInFRTInAiAgent: {
        title: 'Decrease in first response time',
        caption:
            'How much faster shoppers receive a first reply when AI Agent handles the ticket, compared to a human agent.',
        link: GLOSSARY_LINK,
        linkText: HOW_IS_IT_CALCULATED,
    },
    aiAgentAutomationRate: {
        title: 'AI Agent automation rate',
        caption:
            'Percentage of shopper interactions fully handled by AI Agent, with no human agent involved.',
        link: GLOSSARY_LINK,
        linkText: HOW_IS_IT_CALCULATED,
    },
    conversionRate: {
        title: 'Conversion rate',
        caption:
            'Percentage of Shopping Assistant interactions that led to an order within 3 days.',
        link: GLOSSARY_LINK,
        linkText: HOW_IS_IT_CALCULATED,
    },
    totalSales: {
        title: 'Total sales',
        caption:
            'Total revenue from orders placed within 3 days of a Shopping Assistant interaction.',
        link: GLOSSARY_LINK,
        linkText: HOW_IS_IT_CALCULATED,
    },
    zeroTouchTickets: {
        title: 'Zero touch tickets',
        caption: 'Number of tickets closed without any agent reply.',
        link: GLOSSARY_LINK,
        linkText: HOW_IS_IT_CALCULATED,
    },
    averageCsat: {
        title: 'Average CSAT',
        caption:
            'Average satisfaction (CSAT) score for interactions handled during the selected period.',
        link: GLOSSARY_LINK,
        linkText: HOW_IS_IT_CALCULATED,
    },
    coverageRate: {
        title: 'Coverage rate',
        caption:
            'Percentage of tickets from AI Agent-supported channels that AI Agent attempted to handle.',
        link: GLOSSARY_LINK,
        linkText: HOW_IS_IT_CALCULATED,
    },
    closedTickets: {
        title: 'Closed tickets',
        caption:
            'Tickets AI Agent closed in the selected period, including those closed without sending a reply.',
        link: GLOSSARY_LINK,
        linkText: HOW_IS_IT_CALCULATED,
    },
    successRate: {
        title: 'Success rate',
        caption:
            'Percentage of AI Agent interactions fully resolved without escalating to a human agent.',
        link: GLOSSARY_LINK,
        linkText: HOW_IS_IT_CALCULATED,
    },
    ordersInfluenced: {
        title: 'Orders influenced',
        caption:
            'Orders placed within 3 days of a Shopping Assistant interaction where no human handover occurred.',
        link: GLOSSARY_LINK,
        linkText: HOW_IS_IT_CALCULATED,
    },
    revenuePerInteraction: {
        title: 'Revenue per interaction',
        caption:
            'Average revenue generated per Shopping Assistant interaction.',
        link: GLOSSARY_LINK,
        linkText: HOW_IS_IT_CALCULATED,
    },
    averageDiscountAmount: {
        title: 'Average discount amount',
        caption:
            'Average value of discount codes generated by Shopping Assistant and used by shoppers.',
        link: GLOSSARY_LINK,
        linkText: HOW_IS_IT_CALCULATED,
    },
    averageOrderValue: {
        title: 'Average order value',
        caption:
            'Average order value for purchases made within 3 days of a Shopping Assistant interaction.',
        link: GLOSSARY_LINK,
        linkText: HOW_IS_IT_CALCULATED,
    },
    discountUsage: {
        title: 'Discount usage',
        caption:
            'Percentage of Shopping Assistant discount codes that shoppers used.',
        link: GLOSSARY_LINK,
        linkText: HOW_IS_IT_CALCULATED,
    },
    discountCodesApplied: {
        title: 'Discount codes applied',
        caption:
            'Purchases completed using a discount code Shopping Assistant generated and sent.',
        link: GLOSSARY_LINK,
        linkText: HOW_IS_IT_CALCULATED,
    },
    discountsOffered: {
        title: 'Discount offered',
        caption:
            'Interactions where Shopping Assistant generated a discount code for a shopper.',
        link: GLOSSARY_LINK,
        linkText: HOW_IS_IT_CALCULATED,
    },
    medianPurchaseTime: {
        title: 'Median purchase time',
        caption:
            'Median time between a Shopping Assistant interaction and a shopper placing an order.',
        link: GLOSSARY_LINK,
        linkText: HOW_IS_IT_CALCULATED,
    },
    buyThroughRate: {
        title: 'Buy through rate',
        caption:
            'Percentage of Shopping Assistant interactions with product recommendations that led to a purchase.',
        link: GLOSSARY_LINK,
        linkText: HOW_IS_IT_CALCULATED,
    },
    clickThroughRate: {
        title: 'Click through rate',
        caption:
            'Percentage of product recommendations that shoppers clicked on.',
        link: GLOSSARY_LINK,
        linkText: HOW_IS_IT_CALCULATED,
    },
    productRecommendations: {
        title: 'Product recommendations',
        caption:
            'Interactions where Shopping Assistant recommended at least one product to a shopper.',
        link: GLOSSARY_LINK,
        linkText: HOW_IS_IT_CALCULATED,
    },
    timesRecommended: {
        title: 'Times recommended',
        caption:
            'The total number of times a product was recommended to customers by Shopping Assistant.',
        link: GLOSSARY_LINK,
        linkText: HOW_IS_IT_CALCULATED,
    },
} as const satisfies Record<string, MetricTooltipConfig>
