import { IInputs, IOutputs } from "./generated/ManifestTypes";
import * as React from "react";
import GanttSOGEApp from "./GanttSOGE";

export class GanttSOGE implements ComponentFramework.ReactControl<IInputs, IOutputs> {
    private notifyOutputChanged!: () => void;
    private currentJson = "";
    private currentSelectedTask = "";

    public init(
        context: ComponentFramework.Context<IInputs>,
        notifyOutputChanged: () => void,
        state: ComponentFramework.Dictionary
    ): void {
        void state;
        this.notifyOutputChanged = notifyOutputChanged;
        context.mode.trackContainerResize(true);
    }

    public updateView(context: ComponentFramework.Context<IInputs>): React.ReactElement {
        const parameters = context.parameters as unknown as {
            jsonSchemaData?: { raw?: string | null };
        };

        const rawJson = parameters.jsonSchemaData?.raw ?? "[]";
        this.currentJson = rawJson;

        const width = context.mode.allocatedWidth !== -1 ? context.mode.allocatedWidth : 800;
        const height = context.mode.allocatedHeight !== -1 ? context.mode.allocatedHeight : 600;

        return React.createElement(GanttSOGEApp, {
            jsonString: this.currentJson,
            allocatedWidth: width,
            allocatedHeight: height,
            onJsonChange: (newJson: string) => {
                if (this.currentJson !== newJson) {
                    this.currentJson = newJson;
                    this.notifyOutputChanged();
                }
            },
            onTaskSelect: (taskId: string) => {
                if (this.currentSelectedTask !== taskId) {
                    this.currentSelectedTask = taskId;
                    this.notifyOutputChanged();
                }
            }
        });
    }

    public getOutputs(): IOutputs {
        return {
            selectedTaskId: this.currentSelectedTask
        };
    }

    public destroy(): void {
        return;
    }
}