import {shouldHidePhoneIntegration} from '../config'

describe('config', () => {
    describe('shouldHidePhoneIntegration()', () => {
        const allowedHostnames = [
            // local
            'acme.gorgias.docker',
            'acme-samy.ngrok.io',

            // staging
            'samy.gorgias.xyz',

            // prod
            'test-samy.gorgias.com',
        ]

        const deniedHostnames = ['foo.gorgias.io', 'bar.gorgias.com']

        it.each(allowedHostnames)(
            'should not hide phone integration on allowed hostname',
            (hostname) => {
                location.hostname = hostname
                expect(shouldHidePhoneIntegration()).toBe(false)
            }
        )

        it.each(deniedHostnames)(
            'should hide phone integration on denied hostname',
            (hostname) => {
                location.hostname = hostname
                expect(shouldHidePhoneIntegration()).toBe(true)
            }
        )
    })
})
