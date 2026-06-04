import * as React from 'react';
import { Database } from 'lucide-react';
import { Gantt, Task } from "gantt-task-react";
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

//TIPO PARA TURNOS
interface Turno {
  cr7c5_id_documento: string;
  cr7c5_turno_estado: string;
  cr7c5_notas: string;
  createdon: string;
}

// ================== COMPONENTE ==================
const App: React.FC<ERDAppProps> = ({ jsonString, allocatedWidth, allocatedHeight }) => {

  //modo vista
  const [viewMode, setViewMode] = React.useState<"erd" | "gantt">("erd");

  //ESTADO REAL DE TASKS (IMPORTANTE PARA DRAG)
  const [tasksState, setTasksState] = React.useState<Task[]>([]);

  //GENERACIÓN DE TASKS DESDE JSON
  const ganttTasks: Task[] = React.useMemo(() => {
    try {
      const data = JSON.parse(jsonString) as Turno[];

      return data.map((row: Turno, index: number) => {
        const start = new Date(row.createdon);

        return {
          id: `${row.cr7c5_id_documento}-${index}`,
          name: `${row.cr7c5_id_documento} - ${row.cr7c5_turno_estado} (${row.cr7c5_notas})`,
          start: start,
          end: new Date(start.getTime() + 86400000), // +1 día
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

  // INCRONIZA TASKS
  React.useEffect(() => {
    setTasksState(ganttTasks);
  }, [ganttTasks]);

  return (
    <div
      style={{ width: allocatedWidth, height: allocatedHeight }}
      className="erd-wrapper"
    >

      {/* ===== NAVBAR ===== */}
      <div className="erd-navbar">
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Database size={16} style={{ marginRight: 8 }} />
          <span>GARA App</span>
        </div>

        <button onClick={() => setViewMode(v => v === "erd" ? "gantt" : "erd")}>
          Cambiar Vista
        </button>
      </div>

      {/* ===== CONTENIDO ===== */}
      <div className="erd-canvas-area">

        {viewMode === "erd" ? (
          <div style={{ padding: 20 }}>
            <h3>ERD activo</h3>
            <p>Vista base del componente ✅</p>
          </div>
        ) : (
          <div style={{ height: "100%" }}>
            <Gantt
              tasks={tasksState}

              //DRAG & DROP REAL
              onDateChange={(task) => {
                const updatedTasks = tasksState.map(t =>
                  t.id === task.id ? task : t
                );

                setTasksState(updatedTasks);

                console.log("Nueva fecha:", task);
              }}
            />
          </div>
        )}

      </div>
    </div>
  );
};

export default App;