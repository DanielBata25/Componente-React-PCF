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
  azulClaro: "#0060BB",
  amarillo: "#FAE200",
  rojo: "#BF0035"
};

interface RegistroEjecucion {
  cr7c5_st: string;
  cr7c5_fecha_inicio_proyectada: string | null;
  cr7c5_fecha_fin_proyectada: string | null;
  cr7c5_ordenitem: number;
}

interface WorkActivity {
  cr7c5_cod_servicio: string;
  cr7c5_actividad: string;
  cr7c5_nom_fase: string;
}

type TaskSOGE = Task & {
  sinFecha?: boolean;
};

const formatearFecha = (fecha: Date, sinFecha?: boolean): string => {
  if (sinFecha) return "Sin fecha";

  return fecha.toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });
};

const obtenerFechaValida = (valor: string | null): Date | null => {
  if (!valor) return null;

  const fecha = new Date(valor.replace("Z", ""));

  if (isNaN(fecha.getTime())) return null;
  if (fecha.getFullYear() < 2000) return null;

  return fecha;
};

const obtenerPrimeraFechaValida = (data: RegistroEjecucion[]): Date => {
  const fechas = data
    .map((row) => obtenerFechaValida(row.cr7c5_fecha_inicio_proyectada))
    .filter((fecha): fecha is Date => fecha !== null)
    .map((fecha) => fecha.getTime());

  if (fechas.length === 0) {
    const hoy = new Date();
    hoy.setHours(8, 0, 0, 0);
    return hoy;
  }

  const primera = new Date(Math.min(...fechas));
  primera.setHours(8, 0, 0, 0);
  return primera;
};

const crearFechaSegura = (
  fechaInicio: string | null,
  fechaFin: string | null,
  primeraFechaCalendario: Date
): { start: Date; end: Date; sinFecha: boolean } => {
  const start = obtenerFechaValida(fechaInicio);
  const end = obtenerFechaValida(fechaFin);

  const fechaInvalida = !start || !end;

  if (fechaInvalida) {
    const safeStart = new Date(primeraFechaCalendario);
    const safeEnd = new Date(safeStart.getTime() + 3600000);

    return {
      start: safeStart,
      end: safeEnd,
      sinFecha: true
    };
  }

  if (end < start) {
    return {
      start,
      end: new Date(start.getTime() + 3600000),
      sinFecha: false
    };
  }

  return {
    start,
    end,
    sinFecha: false
  };
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
  tasks: TaskSOGE[];
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
            {formatearFecha(task.start, task.sinFecha)}
          </div>
          <div style={{ width: 160, padding: "0 10px" }}>
            {formatearFecha(task.end, task.sinFecha)}
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
  const [tasksState, setTasksState] = React.useState<TaskSOGE[]>([]);

  const botonVista = (modo: ViewMode): React.CSSProperties => ({
    padding: "7px 16px",
    border: `1px solid ${colors.azulOscuro}`,
    background: view === modo ? colors.azulOscuro : "#ffffff",
    color: view === modo ? "#ffffff" : colors.azulOscuro,
    fontWeight: 700,
    cursor: "pointer",
    borderRadius: 6,
    marginRight: 6,
    boxShadow: view === modo ? "0 2px 6px rgba(0,0,0,0.25)" : "none"
  });

  const tareas: TaskSOGE[] = React.useMemo(() => {
    try {
      if (!jsonEjecucion) return [];

      const data = JSON.parse(jsonEjecucion) as RegistroEjecucion[];
      const primeraFechaCalendario = obtenerPrimeraFechaValida(data);

      return data
        .sort((a, b) => a.cr7c5_ordenitem - b.cr7c5_ordenitem)
        .map((row, index) => {
          const { start, end, sinFecha } = crearFechaSegura(
            row.cr7c5_fecha_inicio_proyectada,
            row.cr7c5_fecha_fin_proyectada,
            primeraFechaCalendario
          );

          return {
            id: `${row.cr7c5_st}-${index}`,
            name: sinFecha
              ? `${row.cr7c5_st} - Orden ${row.cr7c5_ordenitem} (Sin fecha)`
              : `${row.cr7c5_st} - Orden ${row.cr7c5_ordenitem}`,
            start,
            end,
            type: "task",
            progress: 100,
            sinFecha,
            styles: {
              backgroundColor: sinFecha ? colors.amarillo : colors.azulClaro,
              backgroundSelectedColor: sinFecha ? colors.naranja : colors.azulOscuro,
              progressColor: sinFecha ? colors.amarillo : colors.azulClaro,
              progressSelectedColor: sinFecha ? colors.naranja : colors.azulOscuro
            }
          } as TaskSOGE;
        })
        .filter((t): t is TaskSOGE => t !== null && t !== undefined);
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
        Vista Gantt SOGE - v8.0.0.0
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
          <div style={{ marginBottom: 12, textAlign: "center" }}>
            <button type="button" style={botonVista(ViewMode.Day)} onClick={() => setView(ViewMode.Day)}>
              Día
            </button>

            <button type="button" style={botonVista(ViewMode.Week)} onClick={() => setView(ViewMode.Week)}>
              Semana
            </button>

            <button type="button" style={botonVista(ViewMode.Month)} onClick={() => setView(ViewMode.Month)}>
              Mes
            </button>
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
                  prev.map((t) =>
                    t.id === task.id
                      ? {
                          ...task,
                          sinFecha: false,
                          name: task.name.replace(" (Sin fecha)", ""),
                          styles: {
                            backgroundColor: colors.azulClaro,
                            backgroundSelectedColor: colors.azulOscuro,
                            progressColor: colors.azulClaro,
                            progressSelectedColor: colors.azulOscuro
                          }
                        }
                      : t
                  )
                );

                console.log("Tarea movida:", task);
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