# Stepper

Multi-step workflow component with two modes: tab-like panel switching for interactive flows, and standalone progress indicators for visualizing step status.

## Import

```typescript
// Tab-like behavior with panels
import {
    Stepper,
    StepperTabItem,
    StepperTabList,
    StepperTabNumber,
    StepperTabPanel,
} from '@gorgias/axiom'
// Standalone progress indicator
import { StepperItem, StepperList, StepperNumber } from '@gorgias/axiom'
```

## Props

### StepperProps (Tab-like behavior with panels)

```typescript
type StepperProps = {
    // Required
    children: ReactNode // StepperTabList and StepperTabPanel components

    // Selection (controlled/uncontrolled)
    defaultSelectedItem?: string // Initial selected step (uncontrolled)
    selectedItem?: string // Controlled selected step
    onSelectionChange?: (item: Key) => void // Selection change callback

    // Layout
    orientation?: Orientation // 'horizontal' | 'vertical' (default: 'horizontal')
}
```

### StepperTabItemProps

```typescript
type StepperTabItemProps = {
    // Required
    id: string // Unique identifier matching TabPanel id
    stepNumber: number // Step number to display

    // Content
    label?: string // Step label (if not provided, renders as StepperTabNumber)

    // State
    isDisabled?: boolean // Whether step is disabled
}
```

### StepperTabNumberProps

```typescript
type StepperTabNumberProps = {
    // Required
    id: string // Unique identifier matching TabPanel id
    stepNumber: number // Step number to display

    // State
    isDisabled?: boolean // Whether step is disabled
}
```

### StepperTabPanelProps

```typescript
type StepperTabPanelProps = {
    // Required
    id: string // Must match StepperTabItem id
    children: ReactNode // Panel content
}
```

### StepperListProps (Standalone progress indicator)

```typescript
type StepperListProps = {
    // Required
    children: ReactNode // StepperNumber or StepperItem components

    // Layout
    orientation?: Orientation // 'horizontal' | 'vertical' (default: 'horizontal')
    gap?: Gap // Spacing between items (default: 'xs')
}
```

### StepperNumberProps

```typescript
type StepperNumberProps = {
    // Required
    stepNumber: number // Step number to display

    // State
    state?: StepperItemState // Visual state (default: 'default')
    isDisabled?: boolean // Whether step is disabled

    // Interaction
    onClick?: () => void // Makes step interactive (renders as button)
}

type StepperItemState = 'default' | 'current' | 'done' | 'error'
```

### StepperItemProps

```typescript
type StepperItemProps = {
    // Required
    stepNumber: number // Step number to display

    // Content
    label?: string // Step label (if not provided, renders as StepperNumber)

    // State
    state?: StepperItemState // Visual state
    isDisabled?: boolean // Whether step is disabled

    // Interaction
    onClick?: () => void // Makes step interactive (renders as button)
}
```

## Usage

### Tab-like Stepper with Labels (Uncontrolled)

```typescript
<Stepper defaultSelectedItem="step1">
  <StepperTabList>
    <StepperTabItem id="step1" stepNumber={1} label="Personal Info" />
    <StepperTabItem id="step2" stepNumber={2} label="Address" />
    <StepperTabItem id="step3" stepNumber={3} label="Review" />
  </StepperTabList>

  <StepperTabPanel id="step1">
    <PersonalInfoForm />
  </StepperTabPanel>
  <StepperTabPanel id="step2">
    <AddressForm />
  </StepperTabPanel>
  <StepperTabPanel id="step3">
    <ReviewContent />
  </StepperTabPanel>
</Stepper>
```

### Tab-like Stepper with Numbers Only

```typescript
<Stepper defaultSelectedItem="step1">
  <StepperTabList>
    <StepperTabNumber id="step1" stepNumber={1} />
    <StepperTabNumber id="step2" stepNumber={2} />
    <StepperTabNumber id="step3" stepNumber={3} />
  </StepperTabList>

  <StepperTabPanel id="step1">
    <Text>Step 1 content</Text>
  </StepperTabPanel>
  <StepperTabPanel id="step2">
    <Text>Step 2 content</Text>
  </StepperTabPanel>
  <StepperTabPanel id="step3">
    <Text>Step 3 content</Text>
  </StepperTabPanel>
</Stepper>
```

### Controlled Stepper

```typescript
function ControlledStepper() {
  const [currentStep, setCurrentStep] = useState('step1')

  return (
    <Stepper
      selectedItem={currentStep}
      onSelectionChange={(key) => setCurrentStep(key.toString())}
    >
      <StepperTabList>
        <StepperTabItem id="step1" stepNumber={1} label="Setup" />
        <StepperTabItem id="step2" stepNumber={2} label="Configure" />
        <StepperTabItem id="step3" stepNumber={3} label="Complete" />
      </StepperTabList>

      <StepperTabPanel id="step1">
        <SetupContent />
      </StepperTabPanel>
      <StepperTabPanel id="step2">
        <ConfigureContent />
      </StepperTabPanel>
      <StepperTabPanel id="step3">
        <CompleteContent />
      </StepperTabPanel>
    </Stepper>
  )
}
```

### Stepper with Disabled Steps

```typescript
<Stepper defaultSelectedItem="step1">
  <StepperTabList>
    <StepperTabItem id="step1" stepNumber={1} label="Available" />
    <StepperTabItem id="step2" stepNumber={2} label="Locked" isDisabled />
    <StepperTabItem id="step3" stepNumber={3} label="Coming Soon" isDisabled />
  </StepperTabList>

  <StepperTabPanel id="step1">
    <AvailableContent />
  </StepperTabPanel>
  <StepperTabPanel id="step2">
    <LockedContent />
  </StepperTabPanel>
  <StepperTabPanel id="step3">
    <ComingSoonContent />
  </StepperTabPanel>
</Stepper>
```

### Vertical Orientation

```typescript
<Stepper orientation="vertical" defaultSelectedItem="step1">
  <StepperTabList>
    <StepperTabItem id="step1" stepNumber={1} label="Account" />
    <StepperTabItem id="step2" stepNumber={2} label="Profile" />
    <StepperTabItem id="step3" stepNumber={3} label="Preferences" />
  </StepperTabList>

  <StepperTabPanel id="step1">
    <AccountSettings />
  </StepperTabPanel>
  <StepperTabPanel id="step2">
    <ProfileSettings />
  </StepperTabPanel>
  <StepperTabPanel id="step3">
    <PreferencesSettings />
  </StepperTabPanel>
</Stepper>
```

### Standalone Progress Indicator with Numbers

```typescript
<StepperList>
  <StepperNumber stepNumber={1} state="done" />
  <StepperNumber stepNumber={2} state="current" />
  <StepperNumber stepNumber={3} state="default" />
</StepperList>
```

### Standalone Progress Indicator with Labels

```typescript
<StepperList>
  <StepperItem stepNumber={1} label="Setup" state="done" />
  <StepperItem stepNumber={2} label="Configure" state="current" />
  <StepperItem stepNumber={3} label="Review" state="default" />
</StepperList>
```

### Interactive Progress Indicator

```typescript
function InteractiveStepper() {
  const [currentStep, setCurrentStep] = useState(2)

  return (
    <StepperList>
      <StepperItem
        stepNumber={1}
        label="Setup"
        state={currentStep > 1 ? 'done' : currentStep === 1 ? 'current' : 'default'}
        onClick={() => setCurrentStep(1)}
      />
      <StepperItem
        stepNumber={2}
        label="Configure"
        state={currentStep > 2 ? 'done' : currentStep === 2 ? 'current' : 'default'}
        onClick={() => setCurrentStep(2)}
      />
      <StepperItem
        stepNumber={3}
        label="Review"
        state={currentStep === 3 ? 'current' : 'default'}
        onClick={() => setCurrentStep(3)}
        isDisabled={currentStep < 3}
      />
    </StepperList>
  )
}
```

### Vertical Progress Indicator

```typescript
<StepperList orientation="vertical" gap="md">
  <StepperItem stepNumber={1} label="Order Placed" state="done" />
  <StepperItem stepNumber={2} label="Processing" state="current" />
  <StepperItem stepNumber={3} label="Shipped" state="default" />
  <StepperItem stepNumber={4} label="Delivered" state="default" />
</StepperList>
```

### Error State

```typescript
<StepperList>
  <StepperNumber stepNumber={1} state="done" />
  <StepperNumber stepNumber={2} state="error" />
  <StepperNumber stepNumber={3} state="default" isDisabled />
</StepperList>
```

## Common Patterns

### Multi-Step Form

```typescript
function MultiStepForm() {
  const [currentStep, setCurrentStep] = useState('personal')
  const [formData, setFormData] = useState({})

  const steps = [
    { id: 'personal', num: 1, label: 'Personal Info' },
    { id: 'address', num: 2, label: 'Address' },
    { id: 'payment', num: 3, label: 'Payment' },
    { id: 'review', num: 4, label: 'Review' },
  ]

  const handleNext = () => {
    const currentIndex = steps.findIndex((s) => s.id === currentStep)
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1].id)
    }
  }

  const handlePrevious = () => {
    const currentIndex = steps.findIndex((s) => s.id === currentStep)
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1].id)
    }
  }

  return (
    <Box flexDirection="column" gap="lg">
      <Stepper
        selectedItem={currentStep}
        onSelectionChange={(key) => setCurrentStep(key.toString())}
      >
        <StepperTabList>
          {steps.map((step) => (
            <StepperTabItem
              key={step.id}
              id={step.id}
              stepNumber={step.num}
              label={step.label}
            />
          ))}
        </StepperTabList>

        <StepperTabPanel id="personal">
          <PersonalInfoForm data={formData} onChange={setFormData} />
        </StepperTabPanel>
        <StepperTabPanel id="address">
          <AddressForm data={formData} onChange={setFormData} />
        </StepperTabPanel>
        <StepperTabPanel id="payment">
          <PaymentForm data={formData} onChange={setFormData} />
        </StepperTabPanel>
        <StepperTabPanel id="review">
          <ReviewForm data={formData} />
        </StepperTabPanel>
      </Stepper>

      <Box flexDirection="row" gap="sm" justifyContent="space-between">
        <Button
          variant="secondary"
          onClick={handlePrevious}
          isDisabled={currentStep === 'personal'}
        >
          Previous
        </Button>
        <Button
          variant="primary"
          onClick={handleNext}
          isDisabled={currentStep === 'review'}
        >
          Next
        </Button>
      </Box>
    </Box>
  )
}
```

### Order Status Tracker

```typescript
function OrderStatusTracker({ order }) {
  const getState = (step) => {
    if (order.currentStep > step) return 'done'
    if (order.currentStep === step) return 'current'
    if (order.failedStep === step) return 'error'
    return 'default'
  }

  return (
    <Card>
      <CardHeader>
        <Text weight="bold">Order Status</Text>
      </CardHeader>
      <CardContent>
        <StepperList orientation="vertical" gap="lg">
          <StepperItem
            stepNumber={1}
            label="Order Placed"
            state={getState(1)}
          />
          <StepperItem
            stepNumber={2}
            label="Processing"
            state={getState(2)}
          />
          <StepperItem
            stepNumber={3}
            label="Shipped"
            state={getState(3)}
          />
          <StepperItem
            stepNumber={4}
            label="Out for Delivery"
            state={getState(4)}
          />
          <StepperItem
            stepNumber={5}
            label="Delivered"
            state={getState(5)}
          />
        </StepperList>
      </CardContent>
    </Card>
  )
}
```

### Onboarding Flow

```typescript
function OnboardingFlow() {
  const [completedSteps, setCompletedSteps] = useState(new Set())
  const [currentStep, setCurrentStep] = useState('welcome')

  const markComplete = (stepId) => {
    setCompletedSteps((prev) => new Set(prev).add(stepId))
  }

  const getStepState = (stepId) => {
    if (completedSteps.has(stepId)) return 'done'
    if (currentStep === stepId) return 'current'
    return 'default'
  }

  return (
    <Stepper
      selectedItem={currentStep}
      onSelectionChange={(key) => setCurrentStep(key.toString())}
    >
      <StepperTabList>
        <StepperTabItem
          id="welcome"
          stepNumber={1}
          label="Welcome"
        />
        <StepperTabItem
          id="profile"
          stepNumber={2}
          label="Profile"
          isDisabled={!completedSteps.has('welcome')}
        />
        <StepperTabItem
          id="team"
          stepNumber={3}
          label="Team"
          isDisabled={!completedSteps.has('profile')}
        />
        <StepperTabItem
          id="done"
          stepNumber={4}
          label="Done"
          isDisabled={!completedSteps.has('team')}
        />
      </StepperTabList>

      <StepperTabPanel id="welcome">
        <WelcomeStep onComplete={() => {
          markComplete('welcome')
          setCurrentStep('profile')
        }} />
      </StepperTabPanel>
      <StepperTabPanel id="profile">
        <ProfileStep onComplete={() => {
          markComplete('profile')
          setCurrentStep('team')
        }} />
      </StepperTabPanel>
      <StepperTabPanel id="team">
        <TeamStep onComplete={() => {
          markComplete('team')
          setCurrentStep('done')
        }} />
      </StepperTabPanel>
      <StepperTabPanel id="done">
        <CompletionStep />
      </StepperTabPanel>
    </Stepper>
  )
}
```

### Progress Indicator with Click Navigation

```typescript
function ClickableProgress({ steps, currentStep, onStepClick }) {
  const getCurrentIndex = () => steps.findIndex((s) => s.id === currentStep)

  const getState = (index) => {
    const current = getCurrentIndex()
    if (index < current) return 'done'
    if (index === current) return 'current'
    return 'default'
  }

  return (
    <StepperList>
      {steps.map((step, index) => (
        <StepperNumber
          key={step.id}
          stepNumber={index + 1}
          state={getState(index)}
          onClick={() => index <= getCurrentIndex() && onStepClick(step.id)}
          isDisabled={index > getCurrentIndex()}
        />
      ))}
    </StepperList>
  )
}
```

## Visual Design

Stepper has:

- Horizontal or vertical orientation
- Connecting lines between step numbers
- Step numbers in circles
- Different visual states:
    - **Default**: Gray circle with number
    - **Current**: Highlighted circle (blue/accent)
    - **Done**: Check icon in circle
    - **Error**: X icon in circle
- Labels positioned below numbers (horizontal) or beside (vertical)
- Disabled state with reduced opacity
- Interactive steps have hover states

## Related Components

- **StepperTabList**: Container for tab items
- **StepperTabItem**: Tab with number and label
- **StepperTabNumber**: Tab with just number
- **StepperTabPanel**: Content panel for each step
- **StepperList**: Standalone progress indicator
- **StepperNumber**: Number indicator
- **StepperItem**: Item with number and label
- **Tabs**: Alternative navigation pattern
- **Breadcrumbs**: For hierarchical navigation

## Testing Queries

```typescript
// Query stepper container
const stepper = container.querySelector('[data-name="stepper"]')
expect(stepper).toBeInTheDocument()

// Query tabs (for tab-like behavior)
const tabs = screen.getAllByRole('tab')
expect(tabs).toHaveLength(3)

// Query specific tab
const step1 = screen.getByRole('tab', { name: /Personal Info/i })
expect(step1).toHaveAttribute('aria-selected', 'true')

// Query tabpanel
const panel = screen.getByRole('tabpanel')
expect(panel).toBeInTheDocument()

// Check panel content
screen.getByText('Personal info form')

// Interact with tabs
await user.click(screen.getByRole('tab', { name: /Address/i }))
expect(onSelectionChange).toHaveBeenCalledWith('step2')

// Keyboard navigation
await user.keyboard('{ArrowRight}')
expect(screen.getByRole('tab', { name: /Second/i })).toHaveAttribute(
    'aria-selected',
    'true',
)

// Check disabled state
const disabledTab = screen.getByRole('tab', { name: /Locked/i })
expect(disabledTab).toHaveAttribute('aria-disabled', 'true')

// Query standalone progress indicator
const list = container.querySelector('[data-name="stepper-list"]')
expect(list).toHaveAttribute('data-orientation', 'horizontal')

// Query step numbers
const numbers = container.querySelectorAll('[data-name="stepper-number"]')
expect(numbers).toHaveLength(3)

// Query step labels
screen.getByText('Setup')
screen.getByText('Configure')
screen.getByText('Review')

// Query done icon (check)
const doneIcon = container.querySelector('[data-name="icon"]')
expect(doneIcon).toBeInTheDocument()

// Interactive step number (button)
const button = container.querySelector(
    '[data-name="stepper-number"][type="button"]',
)
await user.click(button)
expect(onClick).toHaveBeenCalledTimes(1)

// Check gap attribute
expect(list).toHaveAttribute('data-gap', 'xs')
```
