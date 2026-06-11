import * as React from "react";
import { Gantt, Task, ViewMode } from "gantt-task-react";
import "gantt-task-react/dist/index.css";
import "./styles.css";

export interface GanttSOGEProps {
  jsonString: string;
  allocatedWidth: number;
  allocatedHeight: number;
  onJsonChange: (newJson: string) => void;
  onTaskSelect: (taskId: string) => void;
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

const GanttSOGE: React.FC<GanttSOGEProps> = ({ jsonString, onTaskSelect }) => {
  const [view, setView] = React.useState<ViewMode>(ViewMode.Day);
  const [tasksState, setTasksState] = React.useState<Task[]>([]);

  const ganttTasks: Task[] = React.useMemo(() => {
    try {
      const cleanJson = jsonString.replace(/\u00A0/g, " ").trim();

      if (!cleanJson) return [];

      const data = JSON.parse(cleanJson) as Turno[];

      if (!Array.isArray(data)) return [];

      return data
        .map((row, index) => {
          const start = new Date(row.createdon);

          if (isNaN(start.getTime())) return null;

          const end = new Date(start.getTime() + 86400000);

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
          } as Task;
        })
        .filter((task): task is Task => task !== null);
    } catch (error) {
      console.error("JSON inválido recibido en GanttSOGE:", error);
      console.log("Valor recibido:", jsonString);
      return [];
    }
  }, [jsonString]);

  React.useEffect(() => {
    setTasksState(ganttTasks);
  }, [ganttTasks]);

  return (
    <div
      className="gantt-soge-wrapper"
      style={{
        width: "100%",
        height: "100%",
        overflow: "hidden",
        background: "#f5f6fa"
      }}
    >
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column"
        }}
      >
        <div
          style={{
            padding: 10,
            background: colors.azulOscuro,
            color: "white",
            fontWeight: "bold",
            textAlign: "center"
          }}
        >
          Vista Gantt SOGE
        </div>

        <div
          style={{
            display: "flex",
            flex: 1,
            minWidth: 0,
            width: "100%",
            overflow: "hidden"
          }}
        >
          <div
            style={{
              flex: "1 1 auto",
              width: "70%",
              maxWidth: "70%",
              minWidth: 0,
              display: "flex",
              flexDirection: "column",
              padding: 10,
              overflow: "hidden"
            }}
          >
            <div style={{ marginBottom: 10 }}>
              <button
                style={{ background: colors.azulClaro, color: "white", marginRight: 5 }}
                onClick={() => setView(ViewMode.Day)}
              >
                Día
              </button>

              <button
                style={{ background: colors.azulClaro, color: "white", marginRight: 5 }}
                onClick={() => setView(ViewMode.Week)}
              >
                Semana
              </button>

              <button
                style={{ background: colors.azulClaro, color: "white" }}
                onClick={() => setView(ViewMode.Month)}
              >
                Mes
              </button>
            </div>

            <div
              style={{
                flex: 1,
                minHeight: 0,
                width: "100%",
                maxWidth: "100%",
                overflowX: "auto",
                overflowY: "auto"
              }}
            >
              <div style={{ width: "max-content", minWidth: "100%" }}>
                {tasksState.length > 0 ? (
                  <Gantt
                    tasks={tasksState}
                    viewMode={view}
                    columnWidth={
                      view === ViewMode.Month
                        ? 80
                        : view === ViewMode.Week
                        ? 60
                        : 30
                    }
                    listCellWidth="180px"
                    onSelect={(task) => {
                      onTaskSelect(task.id);
                    }}
                    onDateChange={(task) => {
                      const newStart = new Date(task.start);
                      const newEnd = new Date(task.end);

                      const updated = tasksState.map((t) =>
                        t.id === task.id
                          ? { ...task, start: newStart, end: newEnd }
                          : t
                      );

                      setTasksState(updated);
                    }}
                  />
                ) : (
                  <div style={{ padding: 20, color: colors.azulOscuro }}>
                    No hay actividades para mostrar en el Gantt.
                  </div>
                )}
              </div>
            </div>
          </div>

          <div
            style={{
              flex: "0 0 30%",
              width: "30%",
              maxWidth: "30%",
              minWidth: 280,
              flexShrink: 0,
              borderLeft: `3px solid ${colors.naranja}`,
              padding: 10,
              background: "#ffffff",
              overflowY: "auto"
            }}
          >
            <h4 style={{ color: colors.azulOscuro }}>Documentos</h4>
            <ul>
              {[...new Set(tasksState.map((t) => t.name.split(" - ")[0]))].map((documento, i) => (
                <li key={i}>{documento}</li>
              ))}
            </ul>

            <h4 style={{ color: colors.azulOscuro }}>Estados</h4>
            <ul>
              {[...new Set(tasksState.map((t) => t.name.split(" - ")[1]?.split(" ")[0]))].map((estado, i) => (
                <li key={i}>{estado}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GanttSOGE;