import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { Plus, Eye, Edit, Trash2, Filter } from 'lucide-react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import Avatar from '@mui/material/Avatar';
import './TaskTablePage.css';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
}

interface Task {
  id: number;
  title: string;
  status: 'TODO' | 'DOING' | 'DONE';
  created_at: string;
  updated_at: string;
  owner: User;
  participants: User[];
}

const TaskTablePage = () => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [editingStatusId, setEditingStatusId] = useState<number | null>(null);
  const queryClient = useQueryClient();

  const {
    data: tasks,
    isLoading: tasksLoading,
    isError: tasksError,
    error: tasksErrorObj
  } = useQuery<Task[]>({
    queryKey: ['tasks', filterStatus],
    queryFn: async () => {
      const params = filterStatus ? { status: filterStatus } : {};
      const response = await api.get('/tasks/', { params });
      return response.data;
    },
    enabled: isAuthenticated && !authLoading,
    retry: false,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      await api.put(`/tasks/${id}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', filterStatus] });
      toast.success('Task status updated');
    },
    onError: () => {
      toast.error('Failed to update status');
    },
    onSettled: () => {
      setEditingStatusId(null);
    }
  });

  const abandonMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.put(`/tasks/${id}/deactivate`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Task moved to trash');
    },
    onError: () => {
      toast.error('Failed to abandon task');
    }
  });

  const handleDelete = (id: number) => {
    setDeleteId(id);
    setConfirmOpen(true);
  };

  const handleConfirmAbandon = () => {
    if (deleteId !== null) {
      abandonMutation.mutate(deleteId);
    }
    setConfirmOpen(false);
    setDeleteId(null);
  };

  const handleCancelDelete = () => {
    setConfirmOpen(false);
    setDeleteId(null);
  };

  const handleStatusChange = (id: number, newStatus: string) => {
    updateStatusMutation.mutate({ id, status: newStatus });
  };

  if (authLoading || tasksLoading) return <div>Loading...</div>;
  if (tasksError) return <div className="error-message">{(tasksErrorObj as any)?.response?.data?.detail || 'Failed to load tasks.'}</div>;

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
              <th>Participants</th>
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
                  <div className="custom-avatar-group" style={{ justifyContent: 'flex-start', paddingLeft: '8px' }}>
                     <Avatar
                        className="avatar-owner"
                        title={task.owner.first_name + ' (Owner)'}
                        sx={{ width: 30, height: 30, fontSize: 14, backgroundColor: '#fefeffff', color: '#FFC107' }}
                      >
                        {task.owner.first_name.charAt(0)}
                      </Avatar>
                      {task.participants.map(p => (
                        <Avatar 
                          key={p.id} 
                          title={p.first_name}
                          sx={{ width: 30, height: 30, fontSize: 14 }}
                        >
                          {p.first_name.charAt(0)}
                        </Avatar>
                      ))}
                  </div>
                </td>

                <td>
                  {editingStatusId === task.id ? (
                    <select
                      value={task.status}
                      onChange={(e) => handleStatusChange(task.id, e.target.value)}
                      onBlur={() => setEditingStatusId(null)}
                      autoFocus
                      className="status-select"
                    >
                      <option value="TODO">To Do</option>
                      <option value="DOING">Doing</option>
                      <option value="DONE">Done</option>
                    </select>
                  ) : (
                    <span 
                      className={`status-badge ${task.status.toLowerCase()}`}
                      onClick={() => setEditingStatusId(task.id)}
                      title="Click to switch status"
                    >
                      {task.status}
                    </span>
                  )}
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
                    title="Abandon"
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

      <Dialog open={confirmOpen} onClose={handleCancelDelete}>
        <DialogTitle>Abandon Task</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to abandon this task?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
            <button onClick={handleCancelDelete} className="dialog-btn cancel">
            Cancel
            </button>
            <button onClick={handleConfirmAbandon} className="dialog-btn delete">
            Abandon
            </button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default TaskTablePage;
