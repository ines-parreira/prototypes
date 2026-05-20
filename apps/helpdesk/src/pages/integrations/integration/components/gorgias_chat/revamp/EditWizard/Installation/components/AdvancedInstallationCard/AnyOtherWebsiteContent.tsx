import { Heading, HeadingSize, Skeleton, Text } from '@gorgias/axiom'

import CodeSnippet from 'pages/integrations/integration/components/gorgias_chat/legacy/components/revamp/CodeSnippet'

import css from './AdvancedInstallationSidePanel.less'

type Props = {
    installationCode?: string
    isLoadingInstallationCode: boolean
}

const AnyOtherWebsiteContent = ({
    installationCode,
    isLoadingInstallationCode,
}: Props) => {
    return (
        <div className={css.sidePanelContent}>
            <div className={css.description}>
                <Text>
                    By inserting this snippet on your webpage, it will load the
                    chat on that specific webpage only. Make sure to insert the
                    snippet on all the pages for which you wish to display the
                    chat widget.
                </Text>
            </div>
            <div className={css.content}>
                <div className={css.instruction}>
                    <Heading size={HeadingSize.Sm}>
                        1. Edit the source code of your website and find the
                        closing HTML tag <code>&lt;/body&gt;</code>
                    </Heading>
                </div>
                <div className={css.instruction}>
                    <Heading size={HeadingSize.Sm}>
                        2. Above the <code>&lt;/body&gt;</code> tag, paste the
                        code snippet below and save changes.
                    </Heading>
                    {isLoadingInstallationCode ? (
                        <Skeleton width={452} height={250} />
                    ) : (
                        installationCode && (
                            <CodeSnippet
                                codeSnippet={installationCode.trim()}
                                withCopyButton={true}
                            ></CodeSnippet>
                        )
                    )}
                </div>
            </div>
        </div>
    )
}

export default AnyOtherWebsiteContent
