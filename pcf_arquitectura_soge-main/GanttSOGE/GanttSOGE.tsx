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

interface RegistroEjecucion {
  cr7c5_st: string;
  cr7c5_fecha_inicio_proyectada: string;
  cr7c5_fecha_fin_proyectada: string;
  cr7c5_ordenitem: number;
}

interface WorkActivity {
  cr7c5_cod_servicio: string;
  cr7c5_actividad: string;
  cr7c5_nom_fase: string;
}

const formatearFecha = (fecha: Date): string => {
  return fecha
    .toLocaleString("es-CO", {
      day: "numeric",
      month: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true
    })
    .replace(",", "");
};

const EncabezadoTabla: React.FC = () => {
  return (
    <div style={{ display: "flex", height: 50, fontWeight: "bold" }}>
      <div style={{ width: 160, padding: 10 }}>Nombre</div>
      <div style={{ width: 160, padding: 10 }}>Inicio</div>
      <div style={{ width: 160, padding: 10 }}>Fin</div>
    </div>
  );
};

interface TablaTareasProps {
  tasks: Task[];
  rowHeight: number;
}

const TablaTareas: React.FC<TablaTareasProps> = ({ tasks, rowHeight }) => {
  return (
    <div>
      {tasks.map((task) => (
        <div
          key={task.id}
          style={{
            display: "flex",
            height: rowHeight,
            alignItems: "center"
          }}
        >
          <div style={{ width: 160, padding: "0 10px" }}>{task.name}</div>

          <div style={{ width: 160, padding: "0 10px" }}>
            {formatearFecha(task.start)}
          </div>

          <div style={{ width: 160, padding: "0 10px" }}>
            {formatearFecha(task.end)}
          </div>
        </div>
      ))}
    </div>
  );
};

const GanttSOGE: React.FC<GanttSOGEProps> = ({
  jsonEjecucion,
  jsonCatalogo,
  onTaskSelect
}) => {
  const [view, setView] = React.useState<ViewMode>(ViewMode.Day);
  const [tasksState, setTasksState] = React.useState<Task[]>([]);

  const tareas: Task[] = React.useMemo(() => {
    try {
      if (!jsonEjecucion) return [];

      const data = JSON.parse(jsonEjecucion) as RegistroEjecucion[];

      return data
        .sort((a, b) => a.cr7c5_ordenitem - b.cr7c5_ordenitem)
        .map((row, index) => {
          const start = new Date(row.cr7c5_fecha_inicio_proyectada);
          let end = new Date(row.cr7c5_fecha_fin_proyectada);

          if (isNaN(start.getTime()) || isNaN(end.getTime())) {
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

          if (end < start) {
            end = new Date(start.getTime() + 3600000);
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
        });
    } catch (error) {
      console.error("Error parseando JSON ejecución:", error);
      return [];
    }
  }, [jsonEjecucion]);

  React.useEffect(() => {
    setTasksState(tareas);
  }, [tareas]);

  const catalogo: WorkActivity[] = React.useMemo(() => {
    try {
      if (!jsonCatalogo) return [];
      return JSON.parse(jsonCatalogo) as WorkActivity[];
    } catch {
      return [];
    }
  }, [jsonCatalogo]);

  return (
    <div style={{ width: "100%", height: "100%", overflow: "hidden" }}>
      <div
        style={{
          padding: 10,
          background: colors.azulOscuro,
          color: "white",
          textAlign: "center",
          fontWeight: "bold"
        }}
      >
        Vista Gantt SOGE
      </div>

      <div style={{ display: "flex", height: 520, overflow: "hidden" }}>
        <div
          style={{
            width: "70%",
            padding: 10,
            overflowY: "auto",
            overflowX: "auto",
            boxSizing: "border-box"
          }}
        >
          <div style={{ marginBottom: 10, textAlign: "center" }}>
            <button onClick={() => setView(ViewMode.Day)}>Día</button>
            <button onClick={() => setView(ViewMode.Week)}>Semana</button>
            <button onClick={() => setView(ViewMode.Month)}>Mes</button>
          </div>

          {tasksState.length > 0 ? (
            <Gantt
              tasks={tasksState}
              viewMode={view}
              locale="es-CO"
              TaskListHeader={EncabezadoTabla}
              TaskListTable={TablaTareas}
              onSelect={(task) => onTaskSelect(task.id)}
              onDateChange={(task) => {
                setTasksState((prev) =>
                  prev.map((t) => (t.id === task.id ? task : t))
                );

                return true;
              }}
            />
          ) : (
            <div style={{ padding: 20 }}>No hay datos de ejecución</div>
          )}
        </div>

        <div
          style={{
            width: "30%",
            borderLeft: `3px solid ${colors.naranja}`,
            padding: 10,
            background: "#fff",
            overflowY: "auto",
            overflowX: "hidden",
            boxSizing: "border-box"
          }}
        >
          <h4>Catálogo Actividades</h4>

          {catalogo.map((a, i) => (
            <div key={i} style={{ marginBottom: 8, textAlign: "center" }}>
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