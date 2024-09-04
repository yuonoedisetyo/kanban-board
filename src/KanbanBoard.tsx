import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import styled from 'styled-components';

type Task = {
  id: string;
  content: string;
};

type Column = {
  id: string;
  title: string;
  taskIds: string[];
};

type BoardData = {
  tasks: Record<string, Task>;
  columns: Record<string, Column>;
  columnOrder: string[];
};

const initialData: BoardData = {
  tasks: {
    'task-1': { id: 'task-1', content: 'Task 1' },
    'task-2': { id: 'task-2', content: 'Task 2' },
    'task-3': { id: 'task-3', content: 'Task 3' },
    'task-4': { id: 'task-4', content: 'Task 4' },
  },
  columns: {
    'column-1': {
      id: 'column-1',
      title: 'To Do',
      taskIds: ['task-1', 'task-2'],
    },
    'column-2': {
      id: 'column-2',
      title: 'In Progress',
      taskIds: ['task-3'],
    },
    'column-3': {
      id: 'column-3',
      title: 'Done',
      taskIds: ['task-4'],
    },
  },
  columnOrder: ['column-1', 'column-2', 'column-3'],
};

const KanbanBoard: React.FC = () => {
  const [boardData, setBoardData] = useState(initialData);

  const onDragEnd = (result: any) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const startColumn = boardData.columns[source.droppableId];
    const endColumn = boardData.columns[destination.droppableId];

    if (startColumn === endColumn) {
      const newTaskIds = Array.from(startColumn.taskIds);
      newTaskIds.splice(source.index, 1);
      newTaskIds.splice(destination.index, 0, draggableId);

      const newColumn = {
        ...startColumn,
        taskIds: newTaskIds,
      };

      setBoardData((prev) => ({
        ...prev,
        columns: {
          ...prev.columns,
          [newColumn.id]: newColumn,
        },
      }));
    } else {
      const startTaskIds = Array.from(startColumn.taskIds);
      startTaskIds.splice(source.index, 1);
      const newStart = {
        ...startColumn,
        taskIds: startTaskIds,
      };

      const endTaskIds = Array.from(endColumn.taskIds);
      endTaskIds.splice(destination.index, 0, draggableId);
      const newEnd = {
        ...endColumn,
        taskIds: endTaskIds,
      };

      setBoardData((prev) => ({
        ...prev,
        columns: {
          ...prev.columns,
          [newStart.id]: newStart,
          [newEnd.id]: newEnd,
        },
      }));
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Container>
        {boardData.columnOrder.map((columnId) => {
          const column = boardData.columns[columnId];
          const tasks = column.taskIds.map((taskId) => boardData.tasks[taskId]);

          return <Column key={column.id} column={column} tasks={tasks} />;
        })}
      </Container>
    </DragDropContext>
  );
};

const Container = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 20px;
`;

const ColumnContainer = styled.div`
  background-color: #f4f5f7;
  border-radius: 5px;
  width: 300px;
  padding: 10px;
  margin: 0 10px;
`;

const TaskContainer = styled.div`
  background-color: white;
  border-radius: 5px;
  padding: 10px;
  margin-bottom: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const ColumnTitle = styled.h3`
  padding: 10px;
  font-size: 16px;
  font-weight: bold;
`;

const Column: React.FC<{ column: Column; tasks: Task[] }> = ({ column, tasks }) => {
  return (
    <Droppable droppableId={column.id}>
      {(provided) => (
        <ColumnContainer {...provided.droppableProps} ref={provided.innerRef}>
          <ColumnTitle>{column.title}</ColumnTitle>
          {tasks.length > 0 && tasks.map((task, index) => (
            <Draggable key={task.id} draggableId={task.id} index={index}>
              {(provided) => (
                <TaskContainer
                  ref={provided.innerRef}
                  {...provided.draggableProps}
                  {...provided.dragHandleProps}
                >
                  {task.content}
                </TaskContainer>
              )}
            </Draggable>
          ))}
          {provided.placeholder}
        </ColumnContainer>
      )}
    </Droppable>
  );
};

export default KanbanBoard;
