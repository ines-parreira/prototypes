import { Box, Card, CardHeader, Text } from '@gorgias/axiom'

import type { RcsTestSendResponse } from 'AIJourney/queries/useRcsTestSend/useRcsTestSend'

import css from '../../pages/RcsTestSend/RcsTestSend.less'

export const RcsResponseSection = ({
    response,
}: {
    response: RcsTestSendResponse
}) => (
    <Card>
        <CardHeader title="Response" />
        <Box flexDirection="column" gap="sm">
            <div className={css.responseGrid}>
                <Text className={css.responseLabel}>Classification</Text>
                <Text className={css.classificationBadge}>
                    {response.message_classification}
                </Text>

                <Text className={css.responseLabel}>Resolution path</Text>
                <Text className={css.classificationBadge}>
                    {response.resolution_path}
                </Text>

                {response.content_sid && (
                    <>
                        <Text className={css.responseLabel}>Content SID</Text>
                        <Text className={css.responseValue}>
                            {response.content_sid}
                        </Text>
                    </>
                )}

                {response.template_name && (
                    <>
                        <Text className={css.responseLabel}>Template name</Text>
                        <Text className={css.responseValue}>
                            {response.template_name}
                        </Text>
                    </>
                )}

                {response.twilio_message_sid && (
                    <>
                        <Text className={css.responseLabel}>
                            Twilio message SID
                        </Text>
                        <Text className={css.responseValue}>
                            {response.twilio_message_sid}
                        </Text>
                    </>
                )}

                {response.templates_in_pool != null && (
                    <>
                        <Text className={css.responseLabel}>
                            Templates in pool
                        </Text>
                        <Text className={css.responseValue}>
                            {response.templates_in_pool}
                        </Text>
                    </>
                )}

                {response.variables && (
                    <>
                        <Text className={css.responseLabel}>Variables</Text>
                        <pre className={css.codeBlock}>
                            {JSON.stringify(response.variables, null, 2)}
                        </pre>
                    </>
                )}

                {response.warnings.length > 0 && (
                    <>
                        <Text className={css.responseLabel}>Warnings</Text>
                        <Box flexDirection="column" gap="xxxs">
                            {response.warnings.map((w) => (
                                <Text key={w} className={css.warningItem}>
                                    {w}
                                </Text>
                            ))}
                        </Box>
                    </>
                )}
            </div>
        </Box>
    </Card>
)
