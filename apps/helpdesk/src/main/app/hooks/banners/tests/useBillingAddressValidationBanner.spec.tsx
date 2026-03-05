import { assumeMock, renderHook } from '@repo/testing'
import { isAdmin } from '@repo/utils'
import { fromJS } from 'immutable'

import { BannerCategories } from 'AlertBanners'
import useAppSelector from 'hooks/useAppSelector'
import { useBillingState } from 'models/billing/queries'
import { BillingAddressValidationStatus } from 'models/billing/types'

import { useBillingAddressValidationBanner } from '../useBillingAddressValidationBanner'

jest.mock('@repo/utils', () => ({
    ...jest.requireActual('@repo/utils'),
    isAdmin: jest.fn(),
}))

const isAdminMock = assumeMock(isAdmin)

jest.mock('hooks/useAppSelector', () => jest.fn())

const useAppSelectorMock = assumeMock(useAppSelector)

jest.mock('models/billing/queries')

const useBillingStateMock = assumeMock(useBillingState)

const mockedAddBanner = jest.fn()
const mockedRemoveBanner = jest.fn()

jest.mock(
    'AlertBanners',
    () =>
        ({
            ...jest.requireActual('AlertBanners'),
            useBanners: () => ({
                addBanner: mockedAddBanner,
                removeBanner: mockedRemoveBanner,
            }),
        }) as Record<string, unknown>,
)

const mockBillingData = (status: BillingAddressValidationStatus) => ({
    data: {
        customer: {
            billing_address_validation_status: status,
            payment_term_days: null,
        },
    },
})

describe('useBillingAddressValidationBanner', () => {
    beforeEach(() => {
        mockedAddBanner.mockReset()
        mockedRemoveBanner.mockReset()
        isAdminMock.mockReset()
        useAppSelectorMock.mockReturnValue(fromJS({ role: { name: 'admin' } }))
    })

    it('should add banner when user is admin and billing address is invalid', () => {
        isAdminMock.mockReturnValue(true)
        useBillingStateMock.mockReturnValue(
            mockBillingData(BillingAddressValidationStatus.Invalid) as any,
        )

        renderHook(useBillingAddressValidationBanner)

        expect(mockedAddBanner).toHaveBeenCalledWith(
            expect.objectContaining({
                category: BannerCategories.BILLING_ADDRESS_VALIDATION,
                instanceId: 'billing-address-validation',
            }),
        )
    })

    it('should remove banner when user is not admin', () => {
        isAdminMock.mockReturnValue(false)
        useBillingStateMock.mockReturnValue(
            mockBillingData(BillingAddressValidationStatus.Invalid) as any,
        )

        renderHook(useBillingAddressValidationBanner)

        expect(mockedAddBanner).not.toHaveBeenCalled()
        expect(mockedRemoveBanner).toHaveBeenCalledWith(
            BannerCategories.BILLING_ADDRESS_VALIDATION,
            'billing-address-validation',
        )
    })

    it.each([
        BillingAddressValidationStatus.Valid,
        BillingAddressValidationStatus.PartiallyValid,
        BillingAddressValidationStatus.NotValidated,
    ])('should remove banner when billing address status is %s', (status) => {
        isAdminMock.mockReturnValue(true)
        useBillingStateMock.mockReturnValue(mockBillingData(status) as any)

        renderHook(useBillingAddressValidationBanner)

        expect(mockedAddBanner).not.toHaveBeenCalled()
        expect(mockedRemoveBanner).toHaveBeenCalledWith(
            BannerCategories.BILLING_ADDRESS_VALIDATION,
            'billing-address-validation',
        )
    })

    it('should remove banner when billing state is not loaded yet', () => {
        isAdminMock.mockReturnValue(true)
        useBillingStateMock.mockReturnValue({ data: undefined } as any)

        renderHook(useBillingAddressValidationBanner)

        expect(mockedAddBanner).not.toHaveBeenCalled()
        expect(mockedRemoveBanner).toHaveBeenCalled()
    })
})
