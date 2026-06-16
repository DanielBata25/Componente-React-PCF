import { IInputs, IOutputs } from "./generated/ManifestTypes";
import * as React from "react";
import * as ReactDOM from "react-dom";
import GanttSOGEApp from "./GanttSOGE";

export class GanttSOGE implements ComponentFramework.StandardControl<IInputs, IOutputs> {
    private notifyOutputChanged!: () => void;
    private container!: HTMLDivElement;

    private currentSelectedTask = "";
    private jsonEjecucion = "[]";
    private jsonCatalogo = "[]";

    public init(
        context: ComponentFramework.Context<IInputs>,
        notifyOutputChanged: () => void,
        state: ComponentFramework.Dictionary,
        container: HTMLDivElement
    ): void {
        void state;

        this.notifyOutputChanged = notifyOutputChanged;
        this.container = container;

        this.container.style.width = "100%";
        this.container.style.height = "100%";
        this.container.style.overflow = "hidden";

        context.mode.trackContainerResize(true);
    }

    public updateView(context: ComponentFramework.Context<IInputs>): void {
        const parameters = context.parameters as unknown as {
            jsonEjecucion?: { raw?: string | null };
            jsonCatalogo?: { raw?: string | null };
        };

        this.jsonEjecucion = parameters.jsonEjecucion?.raw ?? "[]";
        this.jsonCatalogo = parameters.jsonCatalogo?.raw ?? "[]";

        ReactDOM.render(
            React.createElement(GanttSOGEApp, {
                jsonEjecucion: this.jsonEjecucion,
                jsonCatalogo: this.jsonCatalogo,
                onTaskSelect: (taskId: string) => {
                    if (this.currentSelectedTask !== taskId) {
                        this.currentSelectedTask = taskId;
                        this.notifyOutputChanged();
                    }
                }
            }),
            this.container
        );
    }

    public getOutputs(): IOutputs {
        return {
            selectedTaskId: this.currentSelectedTask
        };
    }

    public destroy(): void {
        ReactDOM.unmountComponentAtNode(this.container);
    }
}