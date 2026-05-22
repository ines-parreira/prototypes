import { useState } from 'react'

import { Banner, Box, Button, Link, Text } from '@gorgias/axiom'

import type { RcsTestSendResponse } from 'AIJourney/queries/useRcsTestSend/useRcsTestSend'
import { useRcsTestSend } from 'AIJourney/queries/useRcsTestSend/useRcsTestSend'

import type { BoundaryTestCase } from './boundaryTests.fixture'
import { BOUNDARY_TESTS } from './boundaryTests.fixture'

type RunResult =
    | { status: 'idle' }
    | { status: 'running' }
    | { status: 'ok'; response: RcsTestSendResponse }
    | { status: 'error'; error: unknown }

type RcsBoundaryTestsProps = {
    integrationId: number | undefined
    recipientPhone: string
}

// Twilio's messages.create() returns 200 + queued for nearly every input
// that passes structural validation. Per-variable length limits (e.g.
// 21658) are enforced at carrier handoff, AFTER our backend returns 200
// to the harness. We have no status_callback wired up
// (use_cases.py:261 sets it to unset), so we cannot synchronously
// observe async carrier failures. The only sync-observable error is one
// our backend raises before reaching Twilio.
//
// Verdict semantics:
// - twilio_ok       → "API queued — verify delivery in Console"
// - twilio_error    → "API queued — should fail at carrier; verify in Console"
//                     (sync error here ALSO counts as "expected fail" since
//                     either way the carrier won't deliver)
// - render_check    → "API queued — check device for rendering"
// - any sync error on a case expecting OK is unexpected and FAILs.
const evaluatePass = (test: BoundaryTestCase, result: RunResult): string => {
    if (result.status !== 'ok' && result.status !== 'error') return '—'

    if (test.expected.kind === 'twilio_ok') {
        return result.status === 'ok'
            ? 'API queued — verify delivery in Twilio Console'
            : 'FAIL — expected queued, our backend rejected'
    }
    if (test.expected.kind === 'twilio_error') {
        return result.status === 'ok'
            ? `API queued — should fail at carrier with ${test.expected.code}; verify in Console`
            : `Backend rejected synchronously — verify error matches expected ${test.expected.code}`
    }
    return result.status === 'ok'
        ? 'API queued — check device for rendering'
        : 'send rejected by our backend'
}

const twilioConsoleUrl = (messageSid: string | null): string | null =>
    messageSid
        ? `https://console.twilio.com/us1/develop/sms/logs/${messageSid}`
        : null

const extractTwilioErrorCode = (error: unknown): number | undefined => {
    if (typeof error !== 'object' || error === null) return undefined
    const maybe = error as {
        response?: { data?: { code?: number; error?: { code?: number } } }
    }
    return maybe.response?.data?.code ?? maybe.response?.data?.error?.code
}

const formatErrorMessage = (error: unknown): string => {
    if (error instanceof Error) return error.message
    return 'Unknown error'
}

const exportResultsAsMarkdown = (
    results: Record<string, RunResult>,
    observations: Record<string, string>,
): string => {
    const lines: string[] = []
    lines.push('# RCS boundary test findings\n')

    const apiCases = BOUNDARY_TESTS.filter((t) => t.batch === 'api')
    const visualCases = BOUNDARY_TESTS.filter((t) => t.batch === 'visual')

    lines.push('## Batch A — API limits\n')
    lines.push('| # | Case | Expected | Actual | Verdict |')
    lines.push('|---|---|---|---|---|')
    for (const test of apiCases) {
        const result = results[test.id] ?? { status: 'idle' }
        const expected =
            test.expected.kind === 'twilio_ok'
                ? '200 OK'
                : test.expected.kind === 'twilio_error'
                  ? `Twilio ${test.expected.code}`
                  : '—'
        let actual = 'not run'
        if (result.status === 'ok') {
            actual = `OK (template=${result.response.template_name ?? '—'}, sid=${result.response.twilio_message_sid ?? '—'})`
        } else if (result.status === 'error') {
            const code = extractTwilioErrorCode(result.error)
            actual = code != null ? `Twilio ${code}` : 'error'
        }
        lines.push(
            `| ${test.id} | ${test.name} | ${expected} | ${actual} | ${evaluatePass(test, result)} |`,
        )
    }

    lines.push('\n## Batch B — iOS 26 rendering\n')
    for (const test of visualCases) {
        const result = results[test.id] ?? { status: 'idle' }
        const obs = observations[test.id] ?? ''
        lines.push(`### ${test.id}: ${test.name}`)
        lines.push(`- Description: ${test.description}`)
        if (test.expected.kind === 'render_check') {
            lines.push(`- Observe: ${test.expected.observe.join('; ')}`)
        }
        if (result.status === 'ok') {
            lines.push(
                `- Sent: template=${result.response.template_name ?? '—'}, sid=${result.response.twilio_message_sid ?? '—'}`,
            )
        } else if (result.status === 'error') {
            lines.push(`- Send failed: ${formatErrorMessage(result.error)}`)
        } else {
            lines.push('- Send: not run')
        }
        lines.push(`- Observation: ${obs || '(not recorded)'}`)
        lines.push('')
    }

    return lines.join('\n')
}

const ApiCaseRow = ({
    test,
    result,
    onRun,
    canRun,
}: {
    test: BoundaryTestCase
    result: RunResult
    onRun: () => void
    canRun: boolean
}) => (
    <Box flexDirection="column" gap="xs" padding="sm">
        <Text>
            <strong>{test.id}:</strong> {test.name}
        </Text>
        <Text>{test.description}</Text>
        <Text>
            Expected:{' '}
            {test.expected.kind === 'twilio_ok'
                ? '200 OK'
                : test.expected.kind === 'twilio_error'
                  ? `Twilio error ${test.expected.code}`
                  : '—'}
        </Text>
        <Box flexDirection="row" gap="sm" alignItems="center">
            <Button
                onClick={onRun}
                isDisabled={!canRun || result.status === 'running'}
                size="sm"
            >
                {result.status === 'running' ? 'Running…' : 'Run case'}
            </Button>
            <Text>Verdict: {evaluatePass(test, result)}</Text>
        </Box>
        {result.status === 'ok' && (
            <Box flexDirection="column" gap="xxs">
                <Text>
                    Template: {result.response.template_name ?? '—'} · SID:{' '}
                    {result.response.twilio_message_sid ?? '—'}
                </Text>
                {twilioConsoleUrl(result.response.twilio_message_sid) && (
                    <Link
                        href={
                            twilioConsoleUrl(
                                result.response.twilio_message_sid,
                            )!
                        }
                        trailingSlot="external-link"
                    >
                        Check delivery status in Twilio Console
                    </Link>
                )}
            </Box>
        )}
        {result.status === 'error' && (
            <Text>
                Error: {formatErrorMessage(result.error)} (code:{' '}
                {extractTwilioErrorCode(result.error) ?? 'unknown'})
            </Text>
        )}
    </Box>
)

const VisualCaseRow = ({
    test,
    result,
    observation,
    onRun,
    onObservationChange,
    canRun,
}: {
    test: BoundaryTestCase
    result: RunResult
    observation: string
    onRun: () => void
    onObservationChange: (value: string) => void
    canRun: boolean
}) => (
    <Box flexDirection="column" gap="xs" padding="sm">
        <Text>
            <strong>{test.id}:</strong> {test.name}
        </Text>
        <Text>{test.description}</Text>
        {test.expected.kind === 'render_check' && (
            <Text>Observe: {test.expected.observe.join('; ')}</Text>
        )}
        <Box flexDirection="row" gap="sm" alignItems="center">
            <Button
                onClick={onRun}
                isDisabled={!canRun || result.status === 'running'}
                size="sm"
            >
                {result.status === 'running' ? 'Sending…' : 'Send case'}
            </Button>
            <Text>{evaluatePass(test, result)}</Text>
        </Box>
        {result.status === 'ok' && (
            <Box flexDirection="column" gap="xxs">
                <Text>
                    Template: {result.response.template_name ?? '—'} · SID:{' '}
                    {result.response.twilio_message_sid ?? '—'}
                </Text>
                {twilioConsoleUrl(result.response.twilio_message_sid) && (
                    <Link
                        href={
                            twilioConsoleUrl(
                                result.response.twilio_message_sid,
                            )!
                        }
                        trailingSlot="external-link"
                    >
                        Check delivery status in Twilio Console
                    </Link>
                )}
            </Box>
        )}
        {result.status === 'error' && (
            <Text>Send failed: {formatErrorMessage(result.error)}</Text>
        )}
        <textarea
            aria-label={`Observation for ${test.id}`}
            value={observation}
            onChange={(e) => onObservationChange(e.target.value)}
            placeholder="What did you see on iOS 26?"
            rows={2}
        />
    </Box>
)

export const RcsBoundaryTests = ({
    integrationId,
    recipientPhone,
}: RcsBoundaryTestsProps) => {
    const { mutateAsync } = useRcsTestSend()
    const [results, setResults] = useState<Record<string, RunResult>>({})
    const [observations, setObservations] = useState<Record<string, string>>({})

    const canRun = integrationId != null && recipientPhone.trim().length > 0

    const runCase = async (test: BoundaryTestCase) => {
        if (!canRun || integrationId == null) return
        setResults((prev) => ({ ...prev, [test.id]: { status: 'running' } }))
        try {
            const response = await mutateAsync({
                integration_id: integrationId,
                recipient_phone: recipientPhone.trim(),
                dry_run: false,
                rcs_context: test.rcs_context,
            })
            setResults((prev) => ({
                ...prev,
                [test.id]: { status: 'ok', response },
            }))
        } catch (error) {
            setResults((prev) => ({
                ...prev,
                [test.id]: { status: 'error', error },
            }))
        }
    }

    const copyMarkdown = async () => {
        const markdown = exportResultsAsMarkdown(results, observations)
        await navigator.clipboard.writeText(markdown)
    }

    const apiCases = BOUNDARY_TESTS.filter((t) => t.batch === 'api')
    const visualCases = BOUNDARY_TESTS.filter((t) => t.batch === 'visual')

    return (
        <Box flexDirection="column" gap="md">
            <Banner
                intent="warning"
                icon="warning-triangle"
                isClosable={false}
                title="Each case sends a real Twilio message"
                size="md"
            />
            {!canRun && (
                <Banner
                    intent="info"
                    icon="info"
                    isClosable={false}
                    title="Please select account & sub-account"
                    description="Pick a sending phone number and enter a recipient on the Test send tab before running boundary cases."
                    size="md"
                />
            )}
            <Text>
                These tests bypass the dry-run toggle on the Test send tab and
                always invoke Twilio. Use deliberately during investigation
                only.
            </Text>
            <Text>
                Twilio&apos;s API returns &quot;queued&quot; for nearly every
                send; per-variable length errors (e.g. 21658) fire
                asynchronously at carrier handoff and are not visible from this
                UI. The runner can only confirm that our backend accepted the
                request — for the actual carrier outcome, click through the
                Twilio Console link on each result.
            </Text>

            <Text>
                <strong>Batch A — API limits.</strong> Probes Twilio Content API
                rejection boundaries.
            </Text>
            <Box flexDirection="column" gap="sm">
                {apiCases.map((test) => (
                    <ApiCaseRow
                        key={test.id}
                        test={test}
                        result={results[test.id] ?? { status: 'idle' }}
                        onRun={() => runCase(test)}
                        canRun={canRun}
                    />
                ))}
            </Box>

            <Text>
                <strong>Batch B — iOS 26 rendering.</strong> Real sends; record
                what you see on your device.
            </Text>
            <Box flexDirection="column" gap="sm">
                {visualCases.map((test) => (
                    <VisualCaseRow
                        key={test.id}
                        test={test}
                        result={results[test.id] ?? { status: 'idle' }}
                        observation={observations[test.id] ?? ''}
                        onRun={() => runCase(test)}
                        onObservationChange={(value) =>
                            setObservations((prev) => ({
                                ...prev,
                                [test.id]: value,
                            }))
                        }
                        canRun={canRun}
                    />
                ))}
            </Box>

            <Box flexDirection="row" gap="sm">
                <Button onClick={copyMarkdown} variant="secondary">
                    Copy findings as markdown
                </Button>
            </Box>
        </Box>
    )
}
