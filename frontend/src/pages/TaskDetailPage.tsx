import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';
import { ArrowLeft, Save, Edit2, Trash2 } from 'lucide-react';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import './TaskDetail.css';
import './TaskForm.css'; // Reuse form styles

interface Task {
  id: number;
  title: string;
  description: string;
  status: string;
  due_date: string | null;
  created_at: string;
  updated_at: string;
}

const TaskDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('TODO');
  const [dueDate, setDueDate] = useState<Date | null>(null);


  const { data: task, isLoading } = useQuery<Task>({
    queryKey: ['task', id],
    queryFn: async () => {
      const response = await api.get(`/tasks/${id}`);
      return response.data;
    },
    enabled: !!id,
    retry: false,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setStatus(task.status);
      setDueDate(task.due_date ? new Date(task.due_date) : null);
    }
  }, [task]);

  const updateMutation = useMutation({
    mutationFn: async (updatedTask: { title: string; description: string; status: string; due_date: Date | null }) => {
      await api.put(`/tasks/${id}`, updatedTask);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['task', id] });
      setIsEditing(false);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await api.put(`/tasks/${id}/deactivate`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      navigate('/tasks');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate({ title, description, status, due_date: dueDate });
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to move this task to trash?')) {
      deleteMutation.mutate();
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (!task) return <div>Task not found</div>;

  return (
    <div className="task-form-container">
      <div className="page-header">
        <button onClick={() => navigate(-1)} className="back-btn">
          <ArrowLeft size={20} /> Back
        </button>
        <div style={{ display: 'flex', gap: '10px' }}>
          {!isEditing && (
            <>
              <button onClick={() => setIsEditing(true)} className="save-btn" style={{ background: '#FFB547' }}>
                <Edit2 size={18} /> Edit
              </button>
              <button onClick={handleDelete} className="save-btn" style={{ background: '#E74C3C' }}>
                <Trash2 size={18} /> Delete
              </button>
            </>
          )}
        </div>
      </div>

      <div className="form-card">
        {isEditing ? (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Task Title</label>
              <input 
                type="text" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                required 
              />
            </div>

            <div className="form-group">
              <label>Status</label>
              <select 
                value={status} 
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="TODO">To Do</option>
                <option value="DOING">Doing</option>
                <option value="DONE">Done</option>
              </select>
            </div>

            <div className="form-group">
              <label>Due Date</label>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DateTimePicker
                  value={dueDate}
                  onChange={(newValue) => setDueDate(newValue)}
                  slotProps={{
                    textField: { fullWidth: true }
                  }}
                />
              </LocalizationProvider>
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                rows={6}
              />
            </div>

            <div className="form-actions">
              <button type="button" onClick={() => setIsEditing(false)} className="cancel-btn">
                Cancel
              </button>
              <button type="submit" className="save-btn" disabled={updateMutation.isPending}>
                <Save size={18} /> {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        ) : (
          <div className="task-view">
            <div className="view-header">
              <span className={`status-badge ${task.status.toLowerCase()}`} style={{ fontSize: '14px', padding: '8px 16px' }}>
                {task.status}
              </span>
              <span className="date-info">Created: {new Date(task.created_at).toLocaleDateString()}</span>
            </div>
            <h1 className="view-title">{task.title}</h1>
            {task.due_date && (
              <div className="view-due-date">
                <strong>Due Date:</strong> {new Date(task.due_date).toLocaleString()}
              </div>
            )}
            <div className="view-description">
              <h3>Description</h3>
              <p>{task.description || 'No description provided.'}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskDetailPage;
