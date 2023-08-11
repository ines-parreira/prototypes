import {saveSocialLinks} from '../navigationLinks'
import {HelpCenterClient} from '../../../../../rest_api/help_center_api'
import {LocalSocialNavigationLink} from '../../../../../models/helpCenter/types'

const mockedHelpCenterClient = {
    createNavigationLink: jest.fn(),
    updateNavigationLink: jest.fn(),
    deleteNavigationLink: jest.fn(),
}

const defaultContext = {helpCenterId: 1, locale: 'en-US'} as const
const createSocialLink = (
    id: number,
    props: Partial<LocalSocialNavigationLink>
): LocalSocialNavigationLink => ({
    id,
    label: `label ${id}`,
    group: 'footer',
    value: `value ${id}`,
    meta: {
        network: 'facebook',
    },
    created_datetime: '',
    updated_datetime: '',
    ...props,
})

describe('navigationLinks', () => {
    describe('saveSocialLinks', () => {
        beforeEach(() => {
            mockedHelpCenterClient.createNavigationLink.mockReset()
            mockedHelpCenterClient.updateNavigationLink.mockReset()
            mockedHelpCenterClient.deleteNavigationLink.mockReset()
        })

        it('should call createNavigationLink when new link provided', async () => {
            await saveSocialLinks(
                mockedHelpCenterClient as unknown as HelpCenterClient,
                [
                    createSocialLink(-1, {
                        updated_datetime: 'now',
                        value: 'https://facebook.com',
                    }),
                ],
                defaultContext
            )

            expect(mockedHelpCenterClient.createNavigationLink).toBeCalledWith(
                {help_center_id: 1},
                {
                    group: 'footer',
                    label: 'label -1',
                    locale: 'en-US',
                    meta: {network: 'facebook'},
                    value: 'https://facebook.com',
                }
            )
        })

        it('should not call createNavigationLink when new link provided without value', async () => {
            await saveSocialLinks(
                mockedHelpCenterClient as unknown as HelpCenterClient,
                [
                    createSocialLink(-1, {
                        updated_datetime: 'now',
                        value: '',
                    }),
                ],
                defaultContext
            )

            expect(mockedHelpCenterClient.createNavigationLink).not.toBeCalled()
            expect(mockedHelpCenterClient.updateNavigationLink).not.toBeCalled()
            expect(mockedHelpCenterClient.deleteNavigationLink).not.toBeCalled()
        })

        it('should call deleteNavigationLink when existing link is with empty value', async () => {
            await saveSocialLinks(
                mockedHelpCenterClient as unknown as HelpCenterClient,
                [
                    createSocialLink(12, {
                        updated_datetime: 'now',
                        value: '',
                    }),
                ],
                defaultContext
            )

            expect(
                mockedHelpCenterClient.deleteNavigationLink
            ).toHaveBeenCalledWith({help_center_id: 1, id: 12})
        })
    })
})
