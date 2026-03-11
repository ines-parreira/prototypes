import { useMemo } from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import type { Map as ImmutableMap } from 'immutable'

import useAppSelector from 'hooks/useAppSelector'
import type {
    InstructionTab,
    InstructionTabs,
} from 'pages/common/components/InstructionsCard'
import { getShopifyIntegrationByShopName } from 'state/integrations/selectors'
import { isNotEmptyArray } from 'utils'

enum InstructionsCardStateKeyEnum {
    ANY_OTHER_WEBSITE = 'any-other-website',
    SHOPIFY_WEBSITE = 'shopify-website',
    BOTH = 'both',
}
type InstructionsCardState = {
    isOpen: boolean
    tabs: InstructionTabs
}

export const ANY_OTHER_WEBSITE_TAB: InstructionTab = {
    id: 'any-other-website',
    title: 'Any Other Website',
    instructionAlert: `Make sure to insert the code on <b>all pages</b> you wish to display the contact form.`,
    instructions: [
        'Edit the source code of your website',
        'Add the code snippet anywhere between &lt;body&gt; and &lt;/body&gt; where you want your Contact Form to be displayed on the page',
        'Save the file and commit changes',
    ],
}

const CHEVRON_SPAN_WRAPPER_INLINE_STYLE: string[] = [
    'position: relative',
    'display: inline-block',
    'background-color:var(--neutral-grey-2)',
    'border-radius:4px',
    'border: 1px solid var(--neutral-grey-3)',
    'width: 24px',
    'height: 24px',
    'transform: translateY(7px)',
    'margin-right: 2px',
    'margin-left: 2px',
]

const CHEVRON_SVG_INLINE_STYLE: string[] = [
    'position: absolute',
    'top: 50%',
    'left: 50%',
    'transform: translate(-50%, -50%)',
]

export const SHOPIFY_WEBSITE_TAB: InstructionTab = {
    id: 'shopify-website',
    title: 'Shopify Website',
    instructionAlert: `Make sure to insert the code on <b>all pages</b> you wish to display the contact form.`,
    instructions: [
        `Go to your store's admin panel and under <b>Online Store</b>, select <b>Pages</b>.`,
        'Select the page where you want to embed the contact form',
        `Under the <b>Content</b> section, click <span style="${CHEVRON_SPAN_WRAPPER_INLINE_STYLE.join(
            ';',
        )}">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style="${CHEVRON_SVG_INLINE_STYLE.join(
            ';',
        )}">
        <path d="M5.79966 10.5999L3.19966 7.99994L5.79966 5.39994C6.05966 5.13994 6.05966 4.72661 5.79966 4.46661C5.53966 4.20661 5.12633 4.20661 4.86633 4.46661L1.80633 7.52661C1.54633 7.78661 1.54633 8.20661 1.80633 8.46661L4.86633 11.5333C5.12633 11.7933 5.53966 11.7933 5.79966 11.5333C6.05966 11.2733 6.05966 10.8599 5.79966 10.5999ZM10.1997 10.5999L12.7997 7.99994L10.1997 5.39994C9.93966 5.13994 9.93966 4.72661 10.1997 4.46661C10.4597 4.20661 10.873 4.20661 11.133 4.46661L14.193 7.52661C14.453 7.78661 14.453 8.20661 14.193 8.46661L11.133 11.5333C10.873 11.7933 10.4597 11.7933 10.1997 11.5333C9.93966 11.2733 9.93966 10.8599 10.1997 10.5999Z" fill="#1D365C"/>
        </svg>
        </span> <b>Show HTML</b>`,
        'Copy and paste the code snippet below into the container',
        'Save changes',
    ],
}

export const CARD_STATES_MAP: Record<
    InstructionsCardStateKeyEnum,
    InstructionsCardState
> = {
    [InstructionsCardStateKeyEnum.ANY_OTHER_WEBSITE]: {
        isOpen: true,
        tabs: [ANY_OTHER_WEBSITE_TAB],
    },
    [InstructionsCardStateKeyEnum.SHOPIFY_WEBSITE]: {
        isOpen: false,
        tabs: [SHOPIFY_WEBSITE_TAB],
    },
    [InstructionsCardStateKeyEnum.BOTH]: {
        isOpen: false,
        tabs: [SHOPIFY_WEBSITE_TAB, ANY_OTHER_WEBSITE_TAB],
    },
}

/**
 * // TODO: remove this case when the contact-form-auto-embed flag is removed
 * WHEN Contact-form-auto-embed flag is inactive
 * Cases:
 * - any cases
 * --> STATE A: show manual embed card with the "Any Other Website" tab only, open by default
 *
 * WHEN Contact-form-auto-embed flag is active
 * Cases:
 * - contact form is connected to a non-Shopify store
 * --> STATE A: show manual embed card with the "Any Other Website" tab only, open by default
 * - contact form is connected to a Shopify store
 * --> STATE B: show manual embed card with the "Shopify Website" tab only, open by default
 * - contact form is not connected to any store
 * --> STATE C: show manual embed card with both "Shopify Website" & "Any Other Website" , closed by default, the "Shopify Website" tab is the first tab
 */
export function getCardState(
    isAutoEmbedFlagActive: boolean,
    shopName: string | null,
    shopifyIntegration: ImmutableMap<any, any>,
) {
    // flag is not active, we show the "Any Other Website" tab only
    if (!isAutoEmbedFlagActive) {
        return InstructionsCardStateKeyEnum.ANY_OTHER_WEBSITE
    }

    // flag is active, we compute the state
    if (!shopName) {
        // contact form is not connected to any store
        return InstructionsCardStateKeyEnum.BOTH
    }

    if (!shopifyIntegration.isEmpty()) {
        // contact form is connected to a Shopify store
        return InstructionsCardStateKeyEnum.SHOPIFY_WEBSITE
    }

    // contact form is connected to a non-shopify store
    return InstructionsCardStateKeyEnum.ANY_OTHER_WEBSITE
}

export const useContactFormManualEmbedInstructionsCardState = (
    code: string,
    shopName: string | null,
): InstructionsCardState => {
    const isAutoEmbedFlagActive = useFlag(FeatureFlagKey.ContactFormAutoEmbed)

    const shopifyIntegration = useAppSelector(
        getShopifyIntegrationByShopName(shopName ?? ''),
    )

    const result = useMemo(() => {
        const selectedState = getCardState(
            Boolean(isAutoEmbedFlagActive),
            shopName,
            shopifyIntegration,
        )

        const modifiedTabs = CARD_STATES_MAP[selectedState].tabs.map((tab) => {
            tab.code = code
            return tab
        })

        return {
            ...CARD_STATES_MAP[selectedState],
            tabs: isNotEmptyArray(modifiedTabs)
                ? modifiedTabs
                : CARD_STATES_MAP[selectedState].tabs,
        }
    }, [code, isAutoEmbedFlagActive, shopName, shopifyIntegration])

    return result
}
