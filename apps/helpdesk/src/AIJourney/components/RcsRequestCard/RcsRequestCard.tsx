import type { CountryCode } from 'libphonenumber-js'

import {
    Box,
    Card,
    CardHeader,
    FlagIcon,
    ListItem,
    SelectField,
    TextField,
    ToggleField,
} from '@gorgias/axiom'

import { CountryCodeSelect } from 'AIJourney/components/CountryCodeSelect/CountryCodeSelect'

import type { PhoneOption } from '../../types/RcsTestSend'

type RcsRequestCardProps = {
    phoneOptions: PhoneOption[]
    selectedOption: PhoneOption | undefined
    onOptionChange: (option: PhoneOption) => void
    phoneInput: string
    onPhoneChange: (value: string) => void
    selectedCountryCode: CountryCode | undefined
    onCountryChange: (code: CountryCode) => void
    dryRun: boolean
    onDryRunChange: (value: boolean) => void
}

export const RcsRequestCard = ({
    phoneOptions,
    selectedOption,
    onOptionChange,
    phoneInput,
    onPhoneChange,
    selectedCountryCode,
    onCountryChange,
    dryRun,
    onDryRunChange,
}: RcsRequestCardProps) => (
    <Card>
        <Box flexDirection="column" gap="md">
            <CardHeader title="Request" />
            <SelectField
                label="Phone integration"
                placeholder="Select phone integration"
                items={phoneOptions}
                value={selectedOption}
                leadingSlot={
                    selectedOption?.countryCode ? (
                        <FlagIcon code={selectedOption.countryCode} />
                    ) : undefined
                }
                onChange={(option: PhoneOption) => onOptionChange(option)}
            >
                {(option: PhoneOption) => (
                    <ListItem
                        key={`integration-${option.id}`}
                        id={option.id}
                        label={option.label}
                        leadingSlot={
                            option.countryCode ? (
                                <FlagIcon code={option.countryCode} />
                            ) : undefined
                        }
                    />
                )}
            </SelectField>
            <TextField
                label="Recipient phone"
                caption="You'll receive the test message on this number"
                value={phoneInput}
                onChange={onPhoneChange}
                leadingSlot={() => (
                    <CountryCodeSelect
                        selectedCountryCode={selectedCountryCode}
                        onCountryChange={onCountryChange}
                    />
                )}
            />
            <ToggleField
                label="Dry run"
                value={dryRun}
                onChange={onDryRunChange}
            />
        </Box>
    </Card>
)
