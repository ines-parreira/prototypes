import React from 'react'

export const buildReportIssueCustomerMessage = (
    reason: string,
    sspTexts: {[key: string]: string}
) => (
    <>
        <b>{sspTexts[reason]}</b>
        <br />
        <br />
        {sspTexts['orderNumber']}: <b>#3087</b>
        <br />
        {sspTexts['fulfillment']}: <b>#3087-F1</b>
        <br />
        {sspTexts['itemNames']}: <b>item name</b>
        <br />
        {sspTexts['trackingUrl']}: <b>jsjsj.tracking.com</b>
        <br />
        {sspTexts['orderPlaced']}: <b>06/07/2020 17:20</b>
        <br />
        {sspTexts['shippingAddress']}: <b>52 Washburn, SF, CA, 94027</b>
    </>
)
