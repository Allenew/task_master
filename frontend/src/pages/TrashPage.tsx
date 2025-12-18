import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';
import { Trash2, RefreshCw } from 'lucide-react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import './TaskTablePage.css';

interface Task {
  id: number;
  title: string;
  status: 'TODO' | 'DOING' | 'DONE';
  created_at: string;
  updated_at: string;
}

const TrashPage = () => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const queryClient = useQueryClient();

  const {
    data: tasks,
    isLoading: tasksLoading,
    isError: tasksError,
    error: tasksErrorObj
  } = useQuery<Task[]>({
    queryKey: ['trash-tasks'],
    queryFn: async () => {
      const response = await api.get('/tasks/all', { params: { is_active: false } });
      return response.data;
    },
    enabled: isAuthenticated && !authLoading,
    retry: false,
  });

  const restoreMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.put(`/tasks/${id}/activate`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trash-tasks'] });
      toast.success('Task restored successfully');
    },
    onError: () => {
      toast.error('Failed to restore task');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/tasks/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trash-tasks'] });
      toast.success('Task deleted forever');
    },
    onError: () => {
      toast.error('Failed to delete task');
    }
  });

  const handleDelete = (id: number) => {
    setDeleteId(id);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (deleteId !== null) {
      deleteMutation.mutate(deleteId);
    }
    setConfirmOpen(false);
    setDeleteId(null);
  };

  const handleCancelDelete = () => {
    setConfirmOpen(false);
    setDeleteId(null);
  };

  const handleRestore = (id: number) => {
      restoreMutation.mutate(id);
  }

  if (authLoading || tasksLoading) return <div>Loading...</div>;
  if (tasksError) return <div className="error-message">{(tasksErrorObj as any)?.response?.data?.detail || 'Failed to load trash.'}</div>;

  return (
    <div className="task-table-container">
      <div className="page-header">
        <h1>Trash</h1>
      </div>

      <div className="table-container">
        <table className="task-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Status</th>
              <th>Created At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tasks?.length === 0 ? (
              <tr>
                <td colSpan={4} className="empty-state">No tasks in trash</td>
              </tr>
            ) : (
              tasks?.map((task) => (
                <tr key={task.id}>
                  <td>{task.title}</td>
                  <td>
                    <span className={`status-badge ${task.status.toLowerCase()}`}>
                      {task.status}
                    </span>
                  </td>
                  <td>{new Date(task.created_at).toLocaleDateString()}</td>
                  <td>
                    <div className="actions-cell">
                      <button 
                        onClick={() => handleRestore(task.id)}
                        className="action-btn edit"
                        title="Restore"
                      >
                        <RefreshCw size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(task.id)}
                        className="action-btn delete"
                        title="Delete Forever"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Dialog
        open={confirmOpen}
        onClose={handleCancelDelete}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Delete Task Forever?"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete this task forever? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <button onClick={handleCancelDelete} className="dialog-btn cancel">
            Cancel
          </button>
          <button onClick={handleConfirmDelete} className="dialog-btn delete">
            Delete
          </button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default TrashPage;
