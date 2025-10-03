import { Button, Text } from '@gorgias/axiom'

import NewToggleField from 'pages/common/forms/NewToggleField'

import css from './SetupTaskBodies.less'

export const VerifyEmailDomainBody = () => (
    <div className={css.setupTaskBodies}>
        <div className={css.setupTaskDescription}>
            <Text size="sm">
                Ensure customers receive emails from the AI Agent by verifying
                your domain.
            </Text>
        </div>
        <Button size="small">Verify</Button>
    </div>
)

export const UpdateShopifyPermissionsBody = () => (
    <div className={css.setupTaskBodies}>
        <div className={css.setupTaskDescription}>
            <Text size="sm">
                Update Shopify permissions to give AI Agent to information about
                your customers, orders and products.
            </Text>
        </div>
        <Button size="small">Update</Button>
    </div>
)

export const CreateAnActionBody = () => (
    <div className={css.setupTaskBodies}>
        <div className={css.setupTaskDescription}>
            <Text size="sm">
                Allow AI Agent to perform support tasks with your third-party
                apps, such as canceling orders, editing shipping addresses, and
                more.
            </Text>
        </div>
        <Button size="small">Create</Button>
    </div>
)

export const MonitorAiAgentBody = () => (
    <div className={css.setupTaskBodies}>
        <div className={css.setupTaskDescription}>
            <Text size="sm">
                Give feedback on AI Agent interactions to improve its accuracy
                and response quality for future customer requests.
            </Text>
        </div>
        <Button size="small">Review</Button>
    </div>
)

export const EnableTriggerOnSearchBody = () => (
    <div className={css.setupTaskBodies}>
        <div className={css.setupTaskDescription}>
            <Text size="sm">
                Guide shoppers to right products by having AI Agent start a
                conversation after they use search.
            </Text>
        </div>
        <NewToggleField
            value={false}
            onChange={() => {}}
            className={css.toggleButton}
        />
    </div>
)

export const EnableSuggestedProductsBody = () => (
    <div className={css.setupTaskBodies}>
        <div className={css.setupTaskDescription}>
            <Text size="sm">
                Show dynamic, AI-generated questions on product pages to address
                common shopper questions. Brands that enable this feature see a
                significant lift in conversions.
            </Text>
        </div>
        <NewToggleField
            value={false}
            onChange={() => {}}
            className={css.toggleButton}
        />
    </div>
)

export const EnableAskAnythingBody = () => (
    <div className={css.setupTaskBodies}>
        <div className={css.setupTaskDescription}>
            <Text size="sm">
                Transform your chat bubble into a persistent input bar that
                invites shoppers to ask questions anytime. Encourage engagement
                by keeping support top-of-mind while shoppers browse.
            </Text>
        </div>
        <NewToggleField
            value={false}
            onChange={() => {}}
            className={css.toggleButton}
        />
    </div>
)

export const EnableAIAgentOnChatBody = () => (
    <div className={css.setupTaskBodies}>
        <div className={css.setupTaskDescription}>
            <Text size="sm">
                Start automating conversations on email to save time and provide
                faster, more personalized responses to your customers.
            </Text>
        </div>
        <NewToggleField
            value={false}
            onChange={() => {}}
            className={css.toggleButton}
        />
    </div>
)

export const EnableAIAgentOnEmailBody = () => (
    <div className={css.setupTaskBodies}>
        <div className={css.setupTaskDescription}>
            <Text size="sm">
                Start automating conversations on chat to save time and provide
                faster, more personalized responses to your customers.
            </Text>
        </div>
        <NewToggleField
            value={false}
            onChange={() => {}}
            className={css.toggleButton}
        />
    </div>
)
