import {
    Box,
    Disclosure,
    DisclosureHeader,
    DisclosurePanel,
    Link,
    Text,
} from '@gorgias/axiom'

const NOTION_DOC_URL =
    'https://www.notion.so/gorgias/RCS-Template-Resolution-Contract-3601ae2178f58168830de4e7c2ad68c4'

export const RcsTemplateReference = () => (
    <Disclosure>
        <DisclosureHeader title="What you can send" />
        <DisclosurePanel>
            <Box flexDirection="column" gap="sm">
                <Text>
                    This harness picks a Twilio Content Template by counting the
                    products, buttons, and image you provide. Combinations
                    outside the supported shapes either degrade to a plain text
                    message or silently drop content, so the Send button stays
                    disabled until the inputs match a template.
                </Text>

                <Text>
                    <strong>Carousel (2–3 products):</strong> 2 or 3 products
                    plus either 1 URL button or 2 Quick Reply buttons. The same
                    button is replicated on every card; each card&apos;s URL
                    payload comes from that product&apos;s URL field.
                </Text>

                <Text>
                    <strong>Single product card (1 product):</strong> 1 URL
                    button, 1 Quick Reply, or 2 Quick Replies.
                </Text>

                <Text>
                    <strong>Text or text + image (no products):</strong> Plain
                    text alone, or with an image and any of: 1 URL button, 1–4
                    Quick Replies. Without an image, you can still send 1 URL
                    button or 2–4 Quick Replies.
                </Text>

                <Text>
                    Full template inventory, matcher rules, and the degradation
                    matrix are in Notion:{' '}
                    <Link href={NOTION_DOC_URL} trailingSlot="external-link">
                        RCS Template Resolution Contract
                    </Link>
                    .
                </Text>
            </Box>
        </DisclosurePanel>
    </Disclosure>
)
