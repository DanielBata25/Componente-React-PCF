import * as React from 'react';
import { Gantt, Task, ViewMode } from "gantt-task-react";
import "gantt-task-react/dist/index.css";
import "./styles.css";

// ================== TIPOS ==================
export interface ERDAppProps {
  jsonString: string;
  allocatedWidth: number;
  allocatedHeight: number;
  onJsonChange: (newJson: string) => void;
  onTableSelect: (tableId: string) => void;
}

// ✅ TIPO PARA TURNOS
interface Turno {
  cr7c5_id_documento: string;
  cr7c5_turno_estado: string;
  cr7c5_notas: string;
  createdon: string;
}

// ================== COMPONENTE ==================
const App: React.FC<ERDAppProps> = ({ jsonString, allocatedWidth, allocatedHeight }) => {

  // modo vista
  const [viewMode, setViewMode] = React.useState<"erd" | "gantt">("erd");

  // ✅ NUEVO: estado de ZOOM
  const [view, setView] = React.useState<ViewMode>(ViewMode.Day);

  // estado de tareas (para drag)
  const [tasksState, setTasksState] = React.useState<Task[]>([]);

  // generación de tareas
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

    } catch (e) {
      console.error("Error JSON", e);
      return [];
    }
  }, [jsonString]);

  // sincroniza tasks
  React.useEffect(() => {
    setTasksState(ganttTasks);
  }, [ganttTasks]);

  return (
    <div
      style={{ width: allocatedWidth || 800, height: allocatedHeight || 500 }}
      className="erd-wrapper"
    >

      {/* CONTENIDO */}
      <div className="erd-canvas-area" style={{ height: "100%" }}>

        {viewMode === "erd" ? (
          <div style={{ padding: 20 }}>
            <h3>ERD activo</h3>
            <p>Vista base del componente</p>

            <button onClick={() => setViewMode("gantt")}>
              Ir a Gantt
            </button>

          </div>
        ) : (
          <div style={{ height: "100%" }}>

            {/* ✅ ZOOM */}
            <div style={{ marginBottom: 10 }}>
              <button onClick={() => setView(ViewMode.Day)}>Día</button>
              <button onClick={() => setView(ViewMode.Week)}>Semana</button>
              <button onClick={() => setView(ViewMode.Month)}>Mes</button>
            </div>

            <Gantt
              tasks={tasksState}
              viewMode={view}

              onDateChange={(task) => {
                const updatedTasks = tasksState.map(t =>
                  t.id === task.id ? task : t
                );

                setTasksState(updatedTasks);
              }}
            />
          </div>
        )}

      </div>
    </div>
  );
};

export default App;
