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

const colors = {
  naranja: "#EB9606",
  azulOscuro: "#001D7F",
  azulClaro: "#0060BB",
  amarillo: "#FAE200",
  rojo: "#BF0035"
};

interface Turno {
  cr7c5_id_documento: string;
  cr7c5_turno_estado: string;
  cr7c5_notas: string;
  createdon: string;
}

const App: React.FC<ERDAppProps> = ({ jsonString }) => {

  const [viewMode] = React.useState<"erd" | "gantt">("gantt");
  const [view, setView] = React.useState<ViewMode>(ViewMode.Day);
  const [tasksState, setTasksState] = React.useState<Task[]>([]);

  const inicioMes = new Date(2026, 3, 1);
  const finMes = new Date(2026, 3, 30);

  const ganttTasks: Task[] = React.useMemo(() => {
    try {
      const data = JSON.parse(jsonString) as Turno[];

      return data
        .map((row, index) => {
          let start = new Date(row.createdon);
          if (isNaN(start.getTime())) return null;

          let end = new Date(start.getTime() + 86400000);

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
            isDisabled: false,

            styles: {
              progressColor: colors.azulClaro,
              progressSelectedColor: colors.azulOscuro,
              backgroundColor: colors.azulClaro,
              backgroundSelectedColor: colors.azulOscuro
            }
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
        overflow: "hidden",
        background: "#f5f6fa"
      }}
      className="erd-wrapper"
    >

      <div style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column"
      }}>

        <div style={{
          padding: 10,
          background: colors.azulOscuro,
          color: "white",
          fontWeight: "bold"
        }}>
          Vista Gantt SOGE
        </div>

        <div style={{
          display: "flex",
          flex: 1,
          minWidth: 0,
          width: "100%"
        }}>

          {/* ✅ GANTT */}
          <div style={{
            flex: "0 0 60%",
            maxWidth: "60%",
            display: "flex",
            flexDirection: "column",
            minWidth: 0
          }}>

            <div style={{ marginBottom: 10 }}>
              <button style={{ background: colors.azulClaro, color: "white", marginRight: 5 }} onClick={() => setView(ViewMode.Day)}>Día</button>
              <button style={{ background: colors.azulClaro, color: "white", marginRight: 5 }} onClick={() => setView(ViewMode.Week)}>Semana</button>
              <button style={{ background: colors.azulClaro, color: "white" }} onClick={() => setView(ViewMode.Month)}>Mes</button>
            </div>

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

                    // ✅ 🔥 FIX REAL (DRAG FUNCIONA)
                    onDateChange={(task) => {
                      let newStart = new Date(task.start);
                      let newEnd = new Date(task.end);

                      if (newStart < inicioMes) newStart = inicioMes;
                      if (newEnd > finMes) newEnd = finMes;

                      const updated = tasksState.map(t =>
                        t.id === task.id
                          ? { ...task, start: newStart, end: newEnd }
                          : t
                      );

                      setTasksState(updated);
                    }}
                  />
                ) : null}
              </div>

            </div>

          </div>

          {/* ✅ PANEL */}
          <div style={{
            flex: "0 0 40%",
            maxWidth: "40%",
            minWidth: 0,
            borderLeft: `3px solid ${colors.naranja}`,
            padding: 10,
            background: "#ffffff",
            overflowY: "auto"
          }}>
            <h4 style={{ color: colors.azulOscuro }}>Personas</h4>
            <ul>
              {[...new Set(tasksState.map(t => t.name.split(" - ")[0]))].map((p, i) => (
                <li key={i}>{p}</li>
              ))}
            </ul>

            <h4 style={{ color: colors.azulOscuro }}>Actividades</h4>
            <ul>
              {[...new Set(tasksState.map(t => t.name.split(" - ")[1]?.split(" ")[0]))].map((a, i) => (
                <li key={i}>{a}</li>
              ))}
            </ul>
          </div>

        </div>

      </div>
    </div>
  );
};

export default App;