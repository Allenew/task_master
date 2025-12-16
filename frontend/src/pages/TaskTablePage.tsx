import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { Plus, Eye, Edit, Trash2, Filter } from 'lucide-react';
import './TaskTablePage.css';

interface Task {
  id: number;
  title: string;
  status: 'TODO' | 'DOING' | 'DONE';
  created_at: string;
  updated_at: string;
}

const TaskTablePage = () => {
  const [filterStatus, setFilterStatus] = useState<string>('');
  const queryClient = useQueryClient();

  const { data: tasks, isLoading } = useQuery<Task[]>({
    queryKey: ['tasks', filterStatus],
    queryFn: async () => {
      const params = filterStatus ? { status: filterStatus } : {};
      const response = await api.get('/tasks/', { params });
      return response.data;
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/tasks/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    }
  });

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="task-table-container">
      <div className="page-header">
        <h1>All Tasks</h1>
        <Link to="/tasks/new" className="add-btn">
          <Plus size={18} /> Add Task
        </Link>
      </div>

      <div className="filters-bar">
        <div className="filter-group">
          <Filter size={16} />
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            className="status-filter"
          >
            <option value="">All Statuses</option>
            <option value="TODO">To Do</option>
            <option value="DOING">Doing</option>
            <option value="DONE">Done</option>
          </select>
        </div>
      </div>

      <div className="table-card">
        <table className="task-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Task Name</th>
              <th>Status</th>
              <th>Created At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tasks?.map((task) => (
              <tr key={task.id}>
                <td>#{task.id}</td>
                <td className="task-title">{task.title}</td>
                <td>
                  <span className={`status-badge ${task.status.toLowerCase()}`}>
                    {task.status}
                  </span>
                </td>
                <td>{new Date(task.created_at).toLocaleDateString()}</td>
                <td className="actions-cell">
                  <Link to={`/tasks/${task.id}`} className="action-btn view" title="View">
                    <Eye size={16} />
                  </Link>
                  <Link to={`/tasks/${task.id}/edit`} className="action-btn edit" title="Edit">
                    <Edit size={16} />
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleDelete(task.id)}
                    className="action-btn delete"
                    title="Delete"
                  >
                    <Trash2 size={16} color="#e74c3c" />
                  </button>
                </td>
              </tr>
            ))}
            {tasks?.length === 0 && (
              <tr>
                <td colSpan={5} className="empty-state">No tasks found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TaskTablePage;
