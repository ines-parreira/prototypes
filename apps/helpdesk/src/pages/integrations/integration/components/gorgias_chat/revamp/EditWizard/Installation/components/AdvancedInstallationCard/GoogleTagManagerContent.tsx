import { Heading, HeadingSize, Skeleton, Text } from '@gorgias/axiom'

import CopyButton from 'pages/integrations/integration/components/gorgias_chat/legacy/components/revamp/CopyButton'

import css from './AdvancedInstallationSidePanel.less'

type Props = {
    applicationKey?: string
    isLoadingApplicationKey: boolean
}

const GoogleTagManagerContent = ({
    applicationKey,
    isLoadingApplicationKey,
}: Props) => {
    return (
        <div className={css.sidePanelContent}>
            <div className={css.description}>
                <Text>
                    Google Tag Manager lets you modify libraries/snippets
                    without touching the source code of your website or Shopify
                    Theme.
                </Text>
            </div>
            <div className={css.content}>
                <div className={css.instruction}>
                    <Heading size={HeadingSize.Sm}>
                        1. In Google Tag Manager, click Tags in the menu.
                    </Heading>
                </div>
                <div className={css.instruction}>
                    <Heading size={HeadingSize.Sm}>
                        2. Click New to create a new tag.
                    </Heading>
                </div>
                <div className={css.instruction}>
                    <Heading size={HeadingSize.Sm}>
                        3. Search for Gorgias Chat and select it
                    </Heading>
                </div>
                <div className={css.instruction}>
                    <div className={css.integrationId}>
                        <Heading size={HeadingSize.Sm}>
                            4. Enter your Gorgias Chat App ID:{' '}
                            {isLoadingApplicationKey ? (
                                <Skeleton width={260} />
                            ) : applicationKey ? (
                                <>
                                    <br />
                                    <span className={css.gtmApplicationKey}>
                                        {applicationKey}
                                    </span>
                                </>
                            ) : (
                                'Could not retrieve ID, please retry later'
                            )}
                        </Heading>
                        <div>
                            {applicationKey && (
                                <CopyButton
                                    value={applicationKey}
                                    displayText="Copy ID"
                                />
                            )}
                        </div>
                    </div>
                </div>
                <div className={css.instruction}>
                    <Heading size={HeadingSize.Sm}>
                        5. Select All Pages - Page view in the Trigger section
                    </Heading>
                </div>
                <div className={css.instruction}>
                    <Heading size={HeadingSize.Sm}>6. Save and publish</Heading>
                </div>
            </div>
        </div>
    )
}

export default GoogleTagManagerContent
