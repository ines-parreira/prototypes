import { useMemo } from 'react'

import { GuidanceTemplate } from '../types'

const TAG_STYLES = {
    Shipping: { color: '#242F8C', background: '#EAF1FF' },
    'Order Issues': { color: '#883100', background: '#FFE8DB' },
    Returns: { color: '#084B61', background: '#EAFFFE' },
    'Order Edit': { color: '#8C2424', background: '#FFEAEA' },
    Subscriptions: { color: '#0D3A2A', background: '#E9FFED' },
} as const

export const GuidanceTemplatesData: GuidanceTemplate[] = [
    {
        id: 'when-a-customer-asks-about-order-status-or-tracking',
        name: 'When a customer asks about order status or tracking',
        content:
            '<div>WHEN a customer asks about an update on their order, what&#x27;s the status of their order or when their order will arrive:</div><div><br></div><div><strong>1.  Locate the order if it&#x27;s unclear</strong></div><ul><li>IF the customer doesn’t mention any specific order, THEN assume that they’re referring to the last order.</li><li>IF you don’t find any order information: </li><ul><li>THEN ask for the information below to locate the order: </li><ul><li>Order number</li><li>Email address used to place the order</li><li>Shipping address</li></ul></ul></ul><div><strong>2. IF the </strong>&amp;&amp;&amp;order.fulfillment.gorgias_status&amp;&amp;&amp;<strong> does not contain any fulfillment information:</strong></div><ul><ul><li>IF the &amp;&amp;&amp;order.created_datetime&amp;&amp;&amp; is 3 days ago or less, THEN tell the customer that the order is being fulfilled AND it will be shipped within 3 days after the order was placed. Tell the customer to be patient and check back later for updates.</li><li>If the &amp;&amp;&amp;order.created_datetime&amp;&amp;&amp; is more than 3 days ago, THEN escalate the request.</li></ul></ul><div><strong>3. IF the </strong>&amp;&amp;&amp;order.fulfillment.gorgias_status&amp;&amp;&amp; <strong>indicates the order has been fulfilled:</strong></div><ul><ul><li>IF the order has been fulfilled but is not delivered yet, THEN share tracking details and close the ticket.</li><li>IF the order is already delivered, THEN inform the customer the order was already delivered.</li></ul></ul><div><strong>4. IF the customer claims the order is marked as delivered but they have not received it:</strong></div><ul><ul><li>THEN ask them to verify potential reasons: </li><ul><li>Check with a neighbor, roommate, or doorman accepting the package on their behalf.</li><li>Share the shipping address and ask them to verify if it’s correct.</li></ul><li>IF they claim they’ve done all the above and still can’t find the order, THEN escalate the request.</li></ul></ul><div> </div>',
        tag: 'Shipping',
        style: TAG_STYLES.Shipping,
    },
    {
        id: 'when-a-customer-asks-about-shipping-timelines-and-cost',
        name: 'When a customer asks about shipping timelines and cost',
        content:
            '<div>WHEN a customer asks about order delivery timelines or shipping costs before placing an order: </div><div><br></div><div>1. IF the customer hasn’t provided a shipping destination:<br> THEN ask which city and country they are shipping to, and explain that delivery times vary by location.<br> </div><div>2. IF the destination is confirmed:<br> THEN share standard estimated delivery timeframes and cost:</div><ul><ul><li>IF shipping to the United States and Canada, THEN inform the customer orders arrive within 5 - 7 business days and shipping costs $9.99</li><li>IF shipping elsewhere, THEN inform the customer orders arrive within 10 - 15 business days and shipping costs $19.99</li><li>During the holiday season (November and December), orders may take 2 to 3 extra business days to arrive.<br> </li></ul></ul>',
        tag: 'Shipping',
        style: TAG_STYLES.Shipping,
    },
    {
        id: 'when-a-customer-is-missing-items-on-their-order',
        name: 'When a customer is missing items on their order',
        content:
            '<div>WHEN a customer claims their order arrived incomplete:</div><div><br></div><div><strong>1. Acknowledge the situation</strong></div><ul><ul><li>Apologize for the inconvenience caused.</li><li>Assure them we will find a prompt resolution to this problem.</li><li>Confirm the order number if not already provided.</li></ul></ul><div><strong>2.</strong> <strong>IF the </strong>&amp;&amp;&amp;order.fulfillment.gorgias_status&amp;&amp;&amp;<strong> indicates the order is delivered OR the customer insists that items are missing from their order:</strong></div><ul><ul><li>THEN ask them to provide a photo of the items they received and confirm the missing item(s) if not provided already.</li><li>AND escalate the request for further investigation.</li></ul></ul><div> </div>',
        tag: 'Order Issues',
        style: TAG_STYLES['Order Issues'],
    },
    {
        id: 'when-a-customer-claims-the-order-arrived-damaged',
        name: 'When a customer claims the order arrived damaged',
        content:
            '<div>WHEN a customer claims they received the order but items arrived damaged:</div><div><br></div><div><strong>1. Acknowledge the situation</strong></div><ul><ul><li>Apologize for the inconvenience caused.</li><li>Assure them we will find a prompt resolution to this problem.</li><li>Confirm the order number if not already provided.</li></ul></ul><div><strong>2.</strong> <strong>Assess the situation</strong> </div><ul><ul><li>Request a photo of the damaged items if not received already.</li><li>Confirm which items are damaged if not clear. </li></ul></ul><div><strong>3.</strong> <strong>Escalate the request</strong></div><ul><ul><li>IF the customer has provided photos and confirmed which items are damaged, THEN escalate the request. </li></ul></ul>',
        tag: 'Order Issues',
        style: TAG_STYLES['Order Issues'],
    },
    {
        id: 'when-a-customer-requests-to-return-an-item',
        name: 'When a customer requests to return an item',
        content:
            '<div>WHEN a customer wants to return an item:</div><div><br></div><div><strong>1. Confirm the order and items they would like to return</strong></div><ul><ul><li>IF it’s not clear in the request, THEN confirm which item(s) they would like to return, and the order it’s related to.</li></ul></ul><div><strong>2. Check return eligibility</strong> </div><ul><ul><li>IF the item is unopened, unused, and in original packaging,</li><li>AND it was delivered within the last <strong>30 days</strong>,</li><li>THEN proceed with initiating the return.</li></ul></ul><div><strong> 3.</strong> <strong>IF the item(s) is eligible for a return: </strong></div><ul><li>THEN provide them with the link to our return portal: <strong>[insert link]</strong></li><li>AND inform them about next steps: </li><ul><li>They should follow the steps in the return portal to submit a return request.</li><li>They will receive a return shipping label once the return has been authorized.</li><li>After arrival and inspection of the item, refunds will be processed within 7 business days.</li><li>Original shipping fees are non-refundable, unless the return is due to an error of the store.</li></ul></ul><div> </div>',
        tag: 'Returns',
        style: TAG_STYLES.Returns,
    },
    {
        id: 'when-a-customer-wants-to-cancel-their-order',
        name: 'When a customer wants to cancel their order',
        content:
            '<div>WHEN a customer wants to cancel their order:</div><div><br></div><div><strong>1. Locate the order</strong></div><ul><li>IF the customer doesn’t mention any specific order, THEN assume that they’re referring to the last order.</li><li>IF you don’t find any order information: </li><ul><li>THEN ask for the information below to locate the order: </li><ul><li>Order number</li><li>Email address used to place the order</li><li>Shipping address</li></ul><li>THEN escalate the request.</li></ul></ul><div><strong>2. Check eligibility to cancel the order</strong></div><ul><ul><li>IF the &amp;&amp;&amp;order.fulfillment.gorgias_status&amp;&amp;&amp; does not contain any fulfillment information, THEN the order is unfulfilled is eligible to edit.</li><li>IF the &amp;&amp;&amp;order.fulfillment.gorgias_status&amp;&amp;&amp; indicates the order is &#x27;fulfilled&#x27;, THEN tell the customer that unfortunately it’s too late to make changes to the order, apologize for the inconvenience and close the ticket.</li></ul></ul><div><strong>3. IF the order is eligible:</strong> </div><ul><ul><li>THEN <strong>[insert Gorgias Support Action &#x27;cancel order&#x27;]</strong></li></ul></ul><div> </div>',
        tag: 'Order Edit',
        style: TAG_STYLES['Order Edit'],
    },
    {
        id: 'when-a-customer-wants-to-update-their-shipping-address',
        name: 'When a customer wants to update their shipping address',
        content:
            '<div>WHEN a customer wants to update their order&#x27;s shipping address:</div><div><br></div><div><strong>1. Locate the order</strong></div><ul><li>IF the customer doesn’t mention any specific order, THEN assume that they’re referring to the last order.</li><li>IF you don’t find any order information: </li><ul><li>THEN ask for the information below to locate the order: </li><ul><li>Order number</li><li>Email address used to place the order</li><li>Shipping address</li></ul><li>THEN escalate the request.</li></ul></ul><div><strong>2.</strong> <strong>Check eligibility to edit the order</strong> </div><ul><ul><li>IF the &amp;&amp;&amp;order.fulfillment.gorgias_status&amp;&amp;&amp; does not contain any fulfillment information, THEN the order is unfulfilled is eligible to edit.</li><li>IF the &amp;&amp;&amp;order.fulfillment.gorgias_status&amp;&amp;&amp; indicates the order is &#x27;fulfilled&#x27;, THEN tell the customer that unfortunately it’s too late to make changes to the order, apologize for the inconvenience and close the ticket.</li></ul></ul><div><strong> 3. IF the order is eligible:</strong> </div><ul><ul><li>THEN <strong>[insert Gorgias Support Action &#x27;update shipping address&#x27;]</strong></li></ul></ul><div> </div>',
        tag: 'Order Edit',
        style: TAG_STYLES['Order Edit'],
    },
    {
        id: 'when-a-customer-wants-to-cancel-their-subscription',
        name: 'When a customer wants to cancel their subscription',
        content:
            '<div>WHEN a customer wants to cancel their subscription, </div><div><br></div><div>THEN provide them with instructions on how to cancel via our self-service portal: </div><ul><li>Log into our subscription portal: <strong>[insert link]</strong></li><li>Once logged in, go to ‘Manage Subscriptions,’ select the relevant subscription, and choose ‘Cancel Subscription.’</li></ul><div>Inform them that after cancelling, pending shipments will be delivered and future orders will stop.</div>',
        tag: 'Subscriptions',
        style: TAG_STYLES.Subscriptions,
    },
]

// This is a custom hook that returns the GuidanceTemplatesData object.
// In feature probably we want to fetch this data from the server.
export const useGuidanceTemplates = () => {
    const guidanceTemplates = useMemo(
        () => Object.values(GuidanceTemplatesData),
        [],
    )

    return { guidanceTemplates }
}
