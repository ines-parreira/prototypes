import {renderHook} from '@testing-library/react-hooks'
import {fromJS} from 'immutable'
import LD from 'launchdarkly-react-client-sdk'

import useAppSelector from 'hooks/useAppSelector'

import {FeatureFlagKey} from '../../../../../../config/featureFlags'
import {useContactFormManualEmbedInstructionsCardState} from '../useContactFormManualEmbedTabs'

jest.mock('hooks/useAppSelector')

jest.mock('state/integrations/selectors', () => ({
    getShopifyIntegrationByShopName: jest.fn(),
}))

const mockedUseAppSelector = useAppSelector as jest.MockedFunction<
    typeof useAppSelector
>

describe('useContactFormManualEmbedInstructionsCardState', () => {
    const code = '<Code snippet>'
    const shopName = 'the-store-name'

    describe('Contact auto embed flag is INACTIVE', () => {
        beforeEach(() => {
            jest.spyOn(LD, 'useFlags').mockImplementation(() => ({
                [FeatureFlagKey.ContactFormAutoEmbed]: false,
            }))
        })

        it('should return the "any other website" instructions card state - ', () => {
            mockedUseAppSelector.mockReturnValueOnce(fromJS({}))

            const {result} = renderHook(() =>
                useContactFormManualEmbedInstructionsCardState(code, shopName)
            )

            expect(result.current).toMatchSnapshot()
        })
    })

    describe('Contact auto embed flag is ACTIVE', () => {
        beforeEach(() => {
            jest.spyOn(LD, 'useFlags').mockImplementation(() => ({
                [FeatureFlagKey.ContactFormAutoEmbed]: true,
            }))
        })

        it('should return "both" instructions card state when not connected to any store', () => {
            mockedUseAppSelector.mockReturnValueOnce(fromJS({}))

            const {result} = renderHook(() =>
                useContactFormManualEmbedInstructionsCardState(code, '')
            )

            expect(result.current).toMatchSnapshot({
                isOpen: false,
            })
        })

        it('should return the "any other website" instructions card state when connected to a non-Shopify store', () => {
            mockedUseAppSelector.mockReturnValueOnce(fromJS({}))

            const {result} = renderHook(() =>
                useContactFormManualEmbedInstructionsCardState(code, shopName)
            )

            expect(result.current).toMatchSnapshot()
        })

        it('should return the "shopify website" instructions card state when connected to Shopify store', () => {
            mockedUseAppSelector.mockReturnValueOnce(
                fromJS({
                    type: 'shopify',
                    name: 'My Shopify Store',
                })
            )

            const {result} = renderHook(() =>
                useContactFormManualEmbedInstructionsCardState(code, shopName)
            )

            expect(result.current).toMatchSnapshot()
        })
    })
})
