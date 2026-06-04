import { IInputs, IOutputs } from "./generated/ManifestTypes";
import * as React from "react";
import App from "./ArquitecturaSOGE_ERD";

export class ERDCanvas implements ComponentFramework.ReactControl<IInputs, IOutputs> {
    private notifyOutputChanged: () => void;
    // eslint-disable-next-line @typescript-eslint/no-inferrable-types
    private currentJson: string = "";
    // eslint-disable-next-line @typescript-eslint/no-inferrable-types
    private currentSelectedTable: string = "";

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    constructor() {}

    public init(
        context: ComponentFramework.Context<IInputs>,
        notifyOutputChanged: () => void,
        state: ComponentFramework.Dictionary
    ): void {
        this.notifyOutputChanged = notifyOutputChanged;
        context.mode.trackContainerResize(true);
    }

    public updateView(context: ComponentFramework.Context<IInputs>): React.ReactElement {
        this.currentJson = context.parameters.jsonSchemaData.raw ?? "";

        const width = context.mode.allocatedWidth !== -1 ? context.mode.allocatedWidth : 800;
        const height = context.mode.allocatedHeight !== -1 ? context.mode.allocatedHeight : 600;

        return React.createElement(App, { 
            jsonString: this.currentJson,
            allocatedWidth: width,
            allocatedHeight: height,
            onJsonChange: (newJson: string) => {
                if (this.currentJson !== newJson) {
                    this.currentJson = newJson;
                    this.notifyOutputChanged();
                }
            },
            onTableSelect: (tableId: string) => {
                if (this.currentSelectedTable !== tableId) {
                    this.currentSelectedTable = tableId;
                    this.notifyOutputChanged();
                }
            }
        });
    }

    public getOutputs(): IOutputs {
        return {
            jsonSchemaData: this.currentJson,
            selectedTableId: this.currentSelectedTable
        };
    }

    public destroy(): void {
        // Limpieza
    }
}