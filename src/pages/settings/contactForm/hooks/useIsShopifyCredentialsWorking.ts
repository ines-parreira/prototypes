import useAppSelector from 'hooks/useAppSelector'
import {useCurrentContactForm} from 'pages/settings/contactForm/hooks/useCurrentContactForm'
import {useGetShopifyPages} from 'pages/settings/contactForm/queries'
import {getShopifyIntegrationByShopName} from 'state/integrations/selectors'

// It's used to be type safe when contact form is missing the shop name
const SHOP_NAME_PLACEHOLDER = 'no shop'

// TODO: this is a temporary solution, we should use the same logic as in the API
// https://gorgias.slack.com/archives/C01JDUKLEEQ/p1696523140686499
export function useIsShopifyCredentialsWorking() {
    const contactForm = useCurrentContactForm()
    const shopifyIntegration = useAppSelector(
        getShopifyIntegrationByShopName(
            contactForm?.shop_name || SHOP_NAME_PLACEHOLDER
        )
    )

    const needScopeUpdate = !shopifyIntegration.isEmpty()
        ? Boolean(
              shopifyIntegration.getIn(['meta', 'need_scope_update'], false)
          )
        : false

    const getShopifyPages = useGetShopifyPages(contactForm.id, {
        enabled: !needScopeUpdate && Boolean(contactForm.shop_name),
    })

    return {
        isLoading: getShopifyPages.isLoading,
        isWorking: !getShopifyPages.isError,
    }
}
