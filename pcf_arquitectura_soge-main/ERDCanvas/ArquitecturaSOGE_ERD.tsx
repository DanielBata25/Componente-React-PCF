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

const App: React.FC<ERDAppProps> = ({ jsonString }) => {

  const [viewMode, setViewMode] = React.useState<"erd" | "gantt">("gantt");
  const [view, setView] = React.useState<ViewMode>(ViewMode.Day);
  const [tasksState, setTasksState] = React.useState<Task[]>([]);

  // 🔥 DEFINES EL MES AQUÍ
  const inicioMes = new Date(2026, 3, 1);  // 1 Abril
  const finMes = new Date(2026, 3, 30);    // 30 Abril

  // ✅ construir tareas con CLIP
  const ganttTasks: Task[] = React.useMemo(() => {
    try {
      const data = JSON.parse(jsonString) as Turno[];

      return data
        .map((row, index) => {
          let start = new Date(row.createdon);

          if (isNaN(start.getTime())) return null;

          let end = new Date(start.getTime() + 86400000);

          // 🔥 CLIP REAL
          if (end < inicioMes || start > finMes) return null;

          if (start < inicioMes) start = inicioMes;
          if (end > finMes) end = finMes;

          return {
            id: `${row.cr7c5_id_documento}-${index}`,
            name: `${row.cr7c5_id_documento} - ${row.cr7c5_turno_estado} (${row.cr7c5_notas})`,
            start,
            end,
            type: "task",
            progress: 100,
            isDisabled: false
          };
        })
        .filter(Boolean) as Task[];

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
        width: "100%",
        height: "100%",
        overflow: "hidden"
      }}
      className="erd-wrapper"
    >

      <div style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column"
      }}>

        {viewMode === "erd" ? (
          <div style={{ padding: 20 }}>
            <h3>ERD activo</h3>
            <button onClick={() => setViewMode("gantt")}>
              Ir a Gantt
            </button>
          </div>

        ) : (

          <div style={{
            display: "flex",
            flex: 1,
            minWidth: 0,
            width: "100%"
          }}>

            {/* ✅ GANTT BLOQUEADO */}
            <div style={{
              flex: "0 0 60%",
              maxWidth: "60%",
              display: "flex",
              flexDirection: "column",
              minWidth: 0
            }}>

              {/* ZOOM */}
              <div style={{ marginBottom: 10 }}>
                <button onClick={() => setView(ViewMode.Day)}>Día</button>
                <button onClick={() => setView(ViewMode.Week)}>Semana</button>
                <button onClick={() => setView(ViewMode.Month)}>Mes</button>
              </div>

              {/* ✅ SCROLL */}
              <div style={{
                flex: 1,
                minHeight: 0,
                overflowX: "auto",
                overflowY: "hidden",
                width: "100%"
              }}>

                <div style={{ width: "max-content" }}>
                  {tasksState.length > 0 ? (
                    <Gantt
                      tasks={tasksState}
                      viewMode={view}
                      columnWidth={
                        view === ViewMode.Month ? 80 :
                        view === ViewMode.Week ? 60 :
                        30
                      }
                      listCellWidth="180px"

                      onDateChange={(task) => {
                        const updated = tasksState.map(t =>
                          t.id === task.id ? task : t
                        );
                        setTasksState(updated);
                      }}
                    />
                  ) : null}
                </div>

              </div>

            </div>

            {/* ✅ PANEL FIJO */}
            <div style={{
              flex: "0 0 40%",
              maxWidth: "40%",
              minWidth: 0,
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
