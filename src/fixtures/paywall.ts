import gorgiasLogo from '../assets/img/icons/gorgias-icon-logo-black.png'
import {PaywallConfig} from '../config/paywalls'

export const testimonial: PaywallConfig['testimonial'] = {
    author: {
        name: 'John Doe',
        avatar: gorgiasLogo,
        position: 'Customer Experience Manager',
        company: {
            name: 'Acme Inc.',
            href: 'https://acme.com/',
        },
    },
    text: 'Gorgias best !',
}
