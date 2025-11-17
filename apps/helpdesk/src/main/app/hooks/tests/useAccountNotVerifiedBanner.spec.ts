import { assumeMock, renderHook } from '@repo/testing'
import { fromJS } from 'immutable'

import type { ContextBanner } from 'AlertBanners'
import { AlertBannerTypes, BannerCategories } from 'AlertBanners'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import { resendVerificationEmail } from 'state/currentAccount/actions'

import { useAccountNotVerifiedBanner } from '../useAccountNotVerifiedBanner'

const mockedAddBanner = jest.fn<unknown, [ContextBanner]>()
jest.mock(
    'AlertBanners',
    () =>
        ({
            ...jest.requireActual('AlertBanners'),
            useBanners: () => {
                return { addBanner: mockedAddBanner }
            },
        }) as Record<string, unknown>,
)
jest.mock('hooks/useAppSelector', () => jest.fn())
jest.mock('hooks/useAppDispatch', () => jest.fn())
jest.mock('state/currentAccount/actions', () => ({
    resendVerificationEmail: jest.fn(),
}))

const useAppDispatchMock = assumeMock(useAppDispatch)
const useAppSelectorMock = assumeMock(useAppSelector)
const resendVerificationEmailMock = assumeMock(resendVerificationEmail)

describe('useAccountNotVerifiedBanner', () => {
    const dispatchMock = jest.fn()
    beforeEach(() => {
        useAppSelectorMock.mockReturnValue(
            fromJS({
                meta: {
                    verified: false,
                },
            }),
        )
        useAppDispatchMock.mockReturnValue(dispatchMock)
    })
    it('should not call addBanner if user email is verified', () => {
        useAppSelectorMock.mockReturnValue(
            fromJS({
                meta: {
                    verified: true,
                },
            }),
        )
        renderHook(useAccountNotVerifiedBanner)

        expect(mockedAddBanner).not.toHaveBeenCalled()
    })

    it('should call addBanner with proper data if user email is not verified', () => {
        renderHook(useAccountNotVerifiedBanner)

        expect(mockedAddBanner).toHaveBeenCalledWith({
            preventDismiss: true,
            category: BannerCategories.ACCOUNT_NOT_VERIFIED,
            instanceId: BannerCategories.ACCOUNT_NOT_VERIFIED,
            type: AlertBannerTypes.Warning,
            message: 'Your account is not verified. Please check your email.',
            CTA: expect.objectContaining({
                type: 'action',
                text: 'Resend verification email',
                onClick: expect.any(Function),
            }),
        })
    })

    it('should call resendVerificationEmail on CTA click', () => {
        const resendEmailAction = 'faker' as unknown as ReturnType<
            typeof resendVerificationEmail
        >
        resendVerificationEmailMock.mockReturnValue(resendEmailAction)
        renderHook(useAccountNotVerifiedBanner)

        mockedAddBanner.mock.calls[0][0].CTA!.onClick!()

        expect(dispatchMock).toHaveBeenCalledWith(resendEmailAction)
    })
})
