export enum CustomNotifications {
    UPGRADE_MESSAGE = 'UPGRADE_MESSAGE',
}

export const UPGRADE_MESSAGE_NOTIFICATION_SETTINGS = {
    message: `
        <div>
            If you're on a Trial or Starter plan, upgrade your
            account
            <a href='/app/settings/billing/plans'>here</a>. If
            you have a Basic+ plan, select an Add-on plan to use
            the integration
            <a
                href='https://gorgias.typeform.com/to/gH7HYEHu?utm_source=in_product&utm_campaign=phone_vetting#email=xxxxx&domain=xxxxx&plan=xxxxx'
                target="_blank"
                rel="noopener noreferrer"
            >here</a>.
        </div>
    `,
    allowHTML: true,
}
