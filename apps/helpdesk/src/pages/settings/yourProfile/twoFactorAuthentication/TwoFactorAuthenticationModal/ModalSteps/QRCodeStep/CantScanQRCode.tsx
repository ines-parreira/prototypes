import { useState } from 'react'

import { Box, LegacyButton as Button } from '@gorgias/axiom'

import { CopyableTextField } from 'core/ui'
import type { AuthenticatorData } from 'models/twoFactorAuthentication/types'

type OwnProps = {
    authenticatorData: AuthenticatorData
}

const authenticatorDataKeyLabelMapper: Record<keyof AuthenticatorData, string> =
    {
        secret_key: 'Secret Key',
        account_name: 'Account Name',
        uri: 'URL',
    }

export default function CantScanQRCode({ authenticatorData }: OwnProps) {
    const [displayAuthenticatorData, setDisplayAuthenticatorData] =
        useState(false)

    return (
        <Box flexDirection="column" alignItems="center">
            <Button
                fillStyle="ghost"
                intent="primary"
                onClick={() =>
                    setDisplayAuthenticatorData(!displayAuthenticatorData)
                }
            >
                {`Can't scan the QR code?`}
            </Button>
            {displayAuthenticatorData && (
                <>
                    <Box mt="14px" mb="14px">
                        Manually enter the information below into your
                        authenticator app
                    </Box>
                    {Object.entries(authenticatorDataKeyLabelMapper).map(
                        ([key, label], index) => (
                            <Box
                                mb="14px"
                                w="100%"
                                maxWidth="370px"
                                key={index}
                            >
                                <CopyableTextField
                                    label={label}
                                    value={
                                        authenticatorData[
                                            key as keyof AuthenticatorData
                                        ]
                                    }
                                />
                            </Box>
                        ),
                    )}
                </>
            )}
        </Box>
    )
}
