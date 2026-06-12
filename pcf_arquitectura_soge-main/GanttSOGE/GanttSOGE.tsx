import * as React from "react";
import { Gantt, Task, ViewMode } from "gantt-task-react";
import "gantt-task-react/dist/index.css";
import "./styles.css";

export interface GanttSOGEProps {
  jsonEjecucion: string;
  jsonCatalogo: string;
  onTaskSelect: (taskId: string) => void;
}

const colors = {
  naranja: "#EB9606",
  azulOscuro: "#001D7F",
  azulClaro: "#0060BB"
};

//  INTERFACE EJECUCIÓN
interface RegistroEjecucion {
  cr7c5_st: string;
  cr7c5_fecha_inicio_proyectada: string;
  cr7c5_fecha_fin_proyectada: string;
  cr7c5_ordenitem: number;
}

//  INTERFACE CATÁLOGO
interface WorkActivity {
  cr7c5_cod_servicio: string;
  cr7c5_actividad: string;
  cr7c5_nom_fase: string;
}

const GanttSOGE: React.FC<GanttSOGEProps> = ({
  jsonEjecucion,
  jsonCatalogo,
  onTaskSelect
}) => {
  const [view, setView] = React.useState<ViewMode>(ViewMode.Day);
  const [tasksState, setTasksState] = React.useState<Task[]>([]);

  //  GANTT DATA
  const tareas: Task[] = React.useMemo(() => {
    try {
      console.log("JSON EJECUCION:", jsonEjecucion);

      const data = JSON.parse(jsonEjecucion) as RegistroEjecucion[];

      return data
        .sort((a, b) => a.cr7c5_ordenitem - b.cr7c5_ordenitem)
        .map((row, index) => {
          const startRaw = row.cr7c5_fecha_inicio_proyectada?.replace("Z", "");
          const endRaw = row.cr7c5_fecha_fin_proyectada?.replace("Z", "");

          const start = new Date(startRaw);
          const end = new Date(endRaw);

          if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            console.warn("Fecha inválida:", row);

            const safeStart = new Date();
            const safeEnd = new Date(safeStart.getTime() + 3600000);

            return {
              id: `${row.cr7c5_st}-${index}`,
              name: `${row.cr7c5_st} - Orden ${row.cr7c5_ordenitem}`,
              start: safeStart,
              end: safeEnd,
              type: "task",
              progress: 100,
              styles: {
                backgroundColor: colors.azulClaro,
                backgroundSelectedColor: colors.azulOscuro
              }
            } as Task;
          }

          return {
            id: `${row.cr7c5_st}-${index}`,
            name: `${row.cr7c5_st} - Orden ${row.cr7c5_ordenitem}`,
            start,
            end,
            type: "task",
            progress: 100,
            styles: {
              backgroundColor: colors.azulClaro,
              backgroundSelectedColor: colors.azulOscuro
            }
          } as Task;
        })
        .filter((t): t is Task => t !== null && t !== undefined);

    } catch (error) {
      console.error("Error parseando JSON ejecución:", error);
      return [];
    }
  }, [jsonEjecucion]);

  //  sincroniza con estado para drag
  React.useEffect(() => {
    setTasksState(tareas);
  }, [tareas]);

  //  CATÁLOGO
  const catalogo: WorkActivity[] = React.useMemo(() => {
    try {
      return JSON.parse(jsonCatalogo) as WorkActivity[];
    } catch {
      return [];
    }
  }, [jsonCatalogo]);

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column" }}>

      {/* HEADER */}
      <div style={{
        padding: 10,
        background: colors.azulOscuro,
        color: "white",
        textAlign: "center",
        fontWeight: "bold"
      }}>
        Vista Gantt SOGE
      </div>

      <div style={{ display: "flex", flex: 1 }}>

        {/*  IZQUIERDA GANTT */}
        <div style={{ width: "70%", padding: 10 }}>

          <div style={{ marginBottom: 10 }}>
            <button onClick={() => setView(ViewMode.Day)}>Día</button>
            <button onClick={() => setView(ViewMode.Week)}>Semana</button>
            <button onClick={() => setView(ViewMode.Month)}>Mes</button>
          </div>

          {tasksState.length > 0 ? (
 <Gantt
  tasks={tasksState}
  viewMode={view}
  onSelect={(task) => onTaskSelect(task.id)}

  onDateChange={(task) => {
    const updated = tasksState.map((t) =>
      t.id === task.id ? { ...task } : t
    );
    setTasksState(updated);

    console.log("Tarea movida:", task);
  }}
/>

          ) : (
            <div style={{ padding: 20 }}>
              No hay datos de ejecución
            </div>
          )}
        </div>

        {/*  DERECHA CATÁLOGO */}
        <div style={{
          width: "30%",
          borderLeft: `3px solid ${colors.naranja}`,
          padding: 10,
          background: "#fff",
          overflowY: "auto"
        }}>
          <h4>Catálogo Actividades</h4>

          {catalogo.map((a, i) => (
            <div key={i} style={{ marginBottom: 8 }}>
              <strong>{a.cr7c5_nom_fase}</strong>
              <div>{a.cr7c5_actividad}</div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default GanttSOGE;