import {useMemo} from 'react'
import {GuidanceTemplateKey, GuidanceTemplate} from '../types'

export const GuidanceTemplatesData: Record<
    GuidanceTemplateKey,
    GuidanceTemplate
> = {
    [GuidanceTemplateKey.OrderStatus]: {
        id: GuidanceTemplateKey.OrderStatus,
        name: 'Order status/tracking info',
        content: `<p>When a shopper asks for an order status or tracking:</p>
<p>Compute the difference in days between order date and ticket creation date to determine which scenario you should follow.</p>
<p><strong>Scenario 1: Shopper is asking for tracking or order status information less than 2 business days after the order was placed, and there is no tracking number available yet</strong></p>
<ul>
<li>If the order was created less than 2 business days ago:
<ul>
<li>Inform the shopper that tracking information will be available within 2 business days of the order date and may not be immediately available due to processing time.</li>
<li>Advise the shopper to be patient and check back later for updates.</li>
</ul>
</li>
<li>If the order has been created since more than 2 business days, escalate to an agent.</li>
<li>Share the tracking information that you have available, if any.</li>
</ul>
<p><strong>Scenario 2: Shopper is asking for a tracking or order status information about an order that already has a tracking number but the order status is not delivered</strong></p>
<p>When a shopper ask for delivery times:</p>
<ul>
<li>Standard Delivery: Typically arrives within 3-7 business days.</li>
<li>Express Delivery: Typically arrives within 5 business days.</li>
<li>Premium Delivery: Typically arrives within 2 business days.</li>
</ul>
<p>Note that for international shipments the delivery time might be longer.</p>
<ul>
<li>If we are passed the delivery time (delivery time - order date) by less than 2 days: Advise the customer to wait an additional 2 days for potential delivery delays.</li>
<li>If we are passed the delivery time (delivery time - order date) by more than 2 days: Escalate the issue to the appropriate team for further assistance.</li>
</ul>
<p>Share the tracking information that you have available.</p>
<p><strong>Scenario 3: Shopper is sharing that the order is marked as delivered but has not been received by them</strong></p>
<ul>
<li>Ask the customer to follow the steps below:
<ul>
<li>Check if a neighbor, roommate, or doorman accepted the package on behalf of the customer.</li>
<li>Double-check the shipping address.</li>
<li>Ask whether the shopper has contacted the carrier for additional delivery details.</li>
<li>Check for the postal carrier leaving the package in a discreet location.</li>
</ul>
</li>
<li>Ask the shopper to wait for 2 days after the posted delivery date before taking further action. Share the tracking information that you have available.</li>
<li>If the shopper has completed the steps above and it&rsquo;s been more than 2 days since the order was marked as delivered, escalate the case to a human agent for further assistance.</li>
</ul>
<p><strong>Scenario 4: Shopper is asking for a tracking or order status information and the order with Shipment Address is in a different country from the base of operations</strong></p>
<ul>
<li>Determine if the shipment address is in a different country from [your base location - example US]. Proceed with the following steps</li>
<li>Calculate the difference in days between the order date and the current date.</li>
<li>If the shipment address is in another country:
<ul>
<li>If the difference is less than 7 days, advise the shopper to wait an additional 2 days for potential delivery delays, considering international shipping times and customs clearance procedures.</li>
<li>If the difference is 7 days or more, escalate the issue to the appropriate team for further assistance, taking into account potential international shipping challenges and customs clearance delays.</li>
</ul>
</li>
<li>Share any available tracking information with the shopper.</li>
<li>Ask the customer to verify certain information and potential reasons for non-receipt:
<ul>
<li>Neighbor, roommate, or doorman accepting the package on behalf of the customer.</li>
<li>Double-check the shipping address.</li>
<li>Whether the shopper has contacted the carrier for additional delivery details.</li>
<li>Postal carrier leaving the package in a discreet location.</li>
</ul>
</li>
<li>If the issue continues to persist, escalate the case to a human agent for further investigation and assistance.</li>
</ul>
<p>Do not explain the above computation and logic to the customer. Don't mention ticket creation dates to the customer.</p>`,
        excerpt:
            'When a shopper asks for an order status or tracking: Compute the difference in days between order date and ticket creation date to determine which scenario you should follow.',
        tag: 'Shipping',
        style: {color: '#242F8C', background: '#EAF1FF'},
    },
    [GuidanceTemplateKey.Cancellation]: {
        id: GuidanceTemplateKey.Cancellation,
        name: 'Cancellation',
        content: `
<p>If a shopper asks to cancel an order, inform the shopper that we usually process orders as soon as they are placed.</p>
<p>Compute the difference in number of hours between order date and ticket creation date to determine if the order can be cancelled. Do not share this logic with the shopper.</p>
<p>If the order was placed in less than 2 hours, you will write that we'll do our best to cancel the order and you will handover to the relevant team.</p>
<p>You will ask them if they received a confirmation email.</p>
<ul>
<li>If the shopper has already received a confirmation email, changing or canceling the order may not be possible. Yet, suggest to the shopper that they can always return your order once the order has reached the shopper.</li>
<li>If they confirm that they did not receive a confirmation email yet, you will write that you are handing over this request to the relevant team.</li>
</ul>
`,
        excerpt:
            'If a shopper asks to cancel an order, inform the shopper that we usually process orders as soon as they are placed. Compute the difference in number of hours between order date and ticket creation date to determine if the order can be cancelled. Do not share this logic with the shopper.',
        tag: 'Shipping',
        style: {color: '#242F8C', background: '#EAF1FF'},
    },
    [GuidanceTemplateKey.DeliveryTime]: {
        id: GuidanceTemplateKey.DeliveryTime,
        name: 'Delivery time',
        content: `
<p>When a shopper ask for delivery times:</p>
<ul>
<li>Standard Delivery: Typically arrives within 3-7 business days.</li>
<li>Express Delivery: Typically arrives within 5 business days.</li>
<li>Premium Delivery: Typically arrives within 2 business days.</li>
</ul>
<p>Note that for international shipments the delivery time might be longer.</p>
`,
        excerpt:
            'When a shopper ask for delivery times: Standard Delivery: Typically arrives within 3-7 business days. Express Delivery: Typically arrives within 5 business days.',
        tag: 'Shipping',
        style: {color: '#242F8C', background: '#EAF1FF'},
    },
    [GuidanceTemplateKey.ReturnsAndExchanges]: {
        id: GuidanceTemplateKey.ReturnsAndExchanges,
        name: 'Returns & Exchanges',
        content: `
<p>When a shopper asks for a return or for an exchange:</p>
<ol>
<li>
<p><strong>Determine Return Eligibility:</strong></p>
<p>Compute the difference in days between order date and ticket creation date to determine.</p>
<p>If the order was placed less than 30 days ago, the return / exchange is eligible, and you should confirm to the shopper that their return / exchange is accepted.</p>
<ul>
<li>Provide them with either instructions or a direct link to access the return / exchange portal.</li>
<li>Inform the shopper that they will receive a prepaid return shipping label via email once their return is authorized.</li>
<li>Explain the importance of using the provided company-issued return label for efficient tracking and processing.</li>
</ul>
<p>If the order placed exceeds 30 days, communicate to the shopper that the exchange cannot be processed because it is outside the 30-day window.</p>
</li>
<li>
<p><strong>Clarification on Non-Returnable Items:</strong></p>
<ul>
<li>These items: [perishable] are not eligible for return. If there is an attempt to return these types of items, communicate to the shopper that the return cannot be processed because the item is non-returnable.</li>
<li>If it is uncertain what type of product the shopper is trying to return, inform them that some items may be excluded from returns per company policy.</li>
</ul>
</li>
<li>
<p><strong>Inform on Return Processing Times:</strong></p>
<ul>
<li>Notify the shopper that returns are generally processed within 10 business days upon receipt by the returns department.</li>
</ul>
</li>
</ol>
<p>If the customer has already initiated the return, tell them that their refund will be processes once the items have been received.</p>
`,
        excerpt:
            'When a shopper asks for a return or for an exchange: Determine Return Eligibility: Compute the difference in days between order date and ticket creation date to determine.',
        tag: 'Returns',
        style: {color: '#883100', background: '#FFE8DB'},
    },
    [GuidanceTemplateKey.DiscountsAndPromos]: {
        id: GuidanceTemplateKey.DiscountsAndPromos,
        name: 'Discounts & Promos',
        content: `
<p>If the shopper is unable to see a promo or discounted pricing</p>
<ul>
<li>You will recommend clearing the cache or trying on a desktop browser.</li>
<li>If that doesn't help, you will recommend using an incognito browser window and copying and pasting the promo link into the new browser.</li>
</ul>
<p>For inquiries about the [XXXX] promo code not working you will respond that we apologize for the inconvenience caused by the promo code error and you will tell them to try entering the offer code at checkout again.</p>
`,
        excerpt:
            'If the shopper is unable to see a promo or discounted pricing. You will recommend clearing the cache or trying on a desktop browser.',
        tag: 'Payments & Rewards',
        style: {color: '#605708', background: '#FFFDEA'},
    },
}

// This is a custom hook that returns the GuidanceTemplatesData object.
// In feature probably we want to fetch this data from the server.
export const useGuidanceTemplates = () => {
    const guidanceTemplates = useMemo(
        () => Object.values(GuidanceTemplatesData),
        []
    )

    return {guidanceTemplates}
}
