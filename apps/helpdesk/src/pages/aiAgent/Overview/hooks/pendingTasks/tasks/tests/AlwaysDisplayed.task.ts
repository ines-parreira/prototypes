import { Task } from '../Task'

export class AlwaysDisplayedTask extends Task {
    constructor() {
        super(
            'Always Displayed',
            'This task should always be displayed',
            'BASIC',
            {} as any,
            {} as any,
        )
    }

    protected isAvailable(): boolean {
        // This task is always available
        return true
    }

    protected shouldBeDisplayed(): boolean {
        return true
    }

    protected getFeatureUrl(): string {
        return '/'
    }
}
