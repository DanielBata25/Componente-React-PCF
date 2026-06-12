import { IInputs, IOutputs } from "./generated/ManifestTypes";
import * as React from "react";
import GanttSOGEApp from "./GanttSOGE";

export class GanttSOGE implements ComponentFramework.ReactControl<IInputs, IOutputs> {
    private notifyOutputChanged!: () => void;

    private currentSelectedTask = "";
    private jsonEjecucion = "[]";
    private jsonCatalogo = "[]";

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
            jsonEjecucion?: { raw?: string | null };
            jsonCatalogo?: { raw?: string | null };
        };

        this.jsonEjecucion = parameters.jsonEjecucion?.raw ?? "[]";
        this.jsonCatalogo = parameters.jsonCatalogo?.raw ?? "[]";

        return React.createElement(GanttSOGEApp, {
            jsonEjecucion: this.jsonEjecucion,
            jsonCatalogo: this.jsonCatalogo,

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