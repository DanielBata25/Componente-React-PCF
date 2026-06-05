import * as React from 'react';
import { Gantt, Task, ViewMode } from "gantt-task-react";
import "gantt-task-react/dist/index.css";
import "./styles.css";

export interface ERDAppProps {
  jsonString: string;
  allocatedWidth: number;
  allocatedHeight: number;
  onJsonChange: (newJson: string) => void;
  onTableSelect: (tableId: string) => void;
}

interface Turno {
  cr7c5_id_documento: string;
  cr7c5_turno_estado: string;
  cr7c5_notas: string;
  createdon: string;
}

const App: React.FC<ERDAppProps> = ({ jsonString, allocatedWidth, allocatedHeight }) => {

  const [viewMode, setViewMode] = React.useState<"erd" | "gantt">("erd");
  const [view, setView] = React.useState<ViewMode>(ViewMode.Day);
  const [tasksState, setTasksState] = React.useState<Task[]>([]);

  const ganttTasks: Task[] = React.useMemo(() => {
    try {
      const data = JSON.parse(jsonString) as Turno[];

      return data.map((row: Turno, index: number) => {
        const start = new Date(row.createdon);

        return {
          id: `${row.cr7c5_id_documento}-${index}`,
          name: `${row.cr7c5_id_documento} - ${row.cr7c5_turno_estado} (${row.cr7c5_notas})`,
          start: start,
          end: new Date(start.getTime() + 86400000),
          type: "task",
          progress: 100,
          isDisabled: false
        };
      });

    } catch {
      return [];
    }
  }, [jsonString]);

  React.useEffect(() => {
    setTasksState(ganttTasks);
  }, [ganttTasks]);

  return (
    <div
      style={{
        width: allocatedWidth || 1000,
        height: allocatedHeight || 600,
        overflow: "hidden"
      }}
      className="erd-wrapper"
    >

      <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>

        {viewMode === "erd" ? (
          <div style={{ padding: 20 }}>
            <h3>ERD activo</h3>
            <button onClick={() => setViewMode("gantt")}>
              Ir a Gantt
            </button>
          </div>

        ) : (

          <div style={{ display: "flex", flex: 1, minWidth: 0 }}>

            {/* GANTT */}
            <div style={{
              flex: 3,
              display: "flex",
              flexDirection: "column",
              paddingRight: 10,
              minWidth: 0,
              overflow: "hidden"   //CLAVE
            }}>

              {/* ZOOM */}
              <div style={{ marginBottom: 10 }}>
                <button onClick={() => setView(ViewMode.Day)}>Día</button>
                <button onClick={() => setView(ViewMode.Week)}>Semana</button>
                <button onClick={() => setView(ViewMode.Month)}>Mes</button>
              </div>

              {/* CONTENEDOR CONTROLADO */}
              <div style={{
                height: 350,
                overflowX: "auto",
                overflowY: "hidden",
                maxWidth: "100%"   //evita expansión
              }}>
                <div style={{
                  minWidth: view === ViewMode.Month
                    ? 1600
                    : view === ViewMode.Week
                    ? 1200
                    : 800
                }}>
                  <Gantt
                    tasks={tasksState}
                    viewMode={view}
                   //EL CONTROL REAL

                    columnWidth={
                      view === ViewMode.Month ? 80 :
                      view === ViewMode.Week ? 60 :
                      50
                    }

                    listCellWidth="150px"

                    onDateChange={(task) => {
                      const updated = tasksState.map(t =>
                        t.id === task.id ? task : t
                      );
                      setTasksState(updated);
                    }}
                  />
                </div>
              </div>

            </div>

            {/* PANEL */}
            <div style={{
              flex: 2,
              borderLeft: "1px solid #ccc",
              padding: 10,
              background: "#f7f7f7",
              overflowY: "auto"
            }}>
              <h4>Personas</h4>
              <ul>
                {[...new Set(tasksState.map(t => t.name.split(" - ")[0]))].map((p, i) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>

              <h4>Actividades</h4>
              <ul>
                {[...new Set(tasksState.map(t => t.name.split(" - ")[1]?.split(" ")[0]))].map((a, i) => (
                  <li key={i}>{a}</li>
                ))}
              </ul>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};

export default App;
