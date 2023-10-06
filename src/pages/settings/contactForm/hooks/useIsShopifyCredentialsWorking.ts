import {useCurrentContactForm} from 'pages/settings/contactForm/hooks/useCurrentContactForm'
import {useGetShopifyPages} from 'pages/settings/contactForm/queries'

// TODO: this is a temporary solution, we should use the same logic as in the API
// https://gorgias.slack.com/archives/C01JDUKLEEQ/p1696523140686499
export function useIsShopifyCredentialsWorking() {
    const contactForm = useCurrentContactForm()
    const getShopifyPages = useGetShopifyPages(contactForm.id)

    return {
        isLoading: getShopifyPages.isLoading,
        isWorking: !getShopifyPages.isError,
    }
}
