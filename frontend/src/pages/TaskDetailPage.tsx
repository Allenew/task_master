import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';
import { ArrowLeft, Edit2, Plus, X, Check, Save } from 'lucide-react';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import toast from 'react-hot-toast';
import Chip from '@mui/material/Chip';
import Avatar from '@mui/material/Avatar';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Slider from '@mui/material/Slider';
import { useAuth } from '../context/AuthContext'; // Add this import

import './TaskDetail.css';
import './TaskForm.css'; // Reuse form styles

interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
}

interface Label {
  id: number;
  name: string;
  color: string;
}

interface Task {
  id: number;
  title: string;
  description: string;
  status: string;
  progress: number;
  due_date: string | null;
  created_at: string;
  updated_at: string;
  labels: Label[];
  owner: User;
  participants: User[];
}

interface TaskDetailPageProps {
  isEditingByDefault?: boolean;
}

const TaskDetailPage = ({ isEditingByDefault = false }: TaskDetailPageProps) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(isEditingByDefault);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('TODO');
  const [progress, setProgress] = useState(0);
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [showLabelInput, setShowLabelInput] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [showParticipantInput, setShowParticipantInput] = useState(false);
  const [participantEmail, setParticipantEmail] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [participantToRemove, setParticipantToRemove] = useState<User | null>(null);
  // use user from AuthContext
  const { user } = useAuth();


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
      setProgress(task.progress || 0);
      setDueDate(task.due_date ? new Date(task.due_date) : null);
    }
  }, [task]);

  useEffect(() => {
    if (progress <= 0) setStatus('TODO');
    else if (progress > 0 && progress < 100) setStatus('DOING');
    else if (progress === 100) setStatus('DONE');
  }, [progress]);

  const updateMutation = useMutation({
    mutationFn: async (updatedTask: { title: string; description: string; status: string; progress: number; due_date: Date | null }) => {
      await api.put(`/tasks/${id}`, updatedTask);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['task', id] });
      setIsEditing(false);
      toast.success('Task updated successfully');
    }
  });

  const addLabelMutation = useMutation({
    mutationFn: async (labelName: string) => {
      await api.post(`/tasks/${id}/add_label`, { label_name: labelName });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task', id] });
      setNewLabel('');
      setShowLabelInput(false);
      toast.success('Label added');
    },
    onError: () => {
      toast.error('Failed to add label');
    }
  });

  const removeLabelMutation = useMutation({
    mutationFn: async (labelId: number) => {
      await api.delete(`/tasks/${id}/labels/${labelId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task', id] });
      toast.success('Label removed');
    },
    onError: () => {
      toast.error('Failed to remove label');
    }
  });

  const addParticipantMutation = useMutation({
    mutationFn: async (email: string) => {
      await api.post(`/tasks/${id}/participants`, { email });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task', id] });
      setParticipantEmail('');
      setShowParticipantInput(false);
      toast.success('Participant added');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to add participant');
    }
  });

  const removeParticipantMutation = useMutation({
    mutationFn: async (participantId: number) => {
      await api.delete(`/tasks/${id}/participants/${participantId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task', id] });
      toast.success('Participant removed');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to remove participant');
    }
  });

  // const deleteMutation = useMutation({
  //   mutationFn: async () => {
  //     await api.put(`/tasks/${id}/deactivate`);
  //   },
  //   onSuccess: () => {
  //     queryClient.invalidateQueries({ queryKey: ['tasks'] });
  //     navigate('/tasks');
  //   }
  // });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate({ title, description, status, progress, due_date: dueDate });
  };

  const handleAddLabel = () => {
    if (newLabel.trim()) {
      addLabelMutation.mutate(newLabel.trim());
    }
  };

  const handleAddParticipant = () => {
    if (participantEmail.trim()) {
      addParticipantMutation.mutate(participantEmail.trim());
    }
  };

  const handleRemoveParticipant = (participant: User) => {
    setParticipantToRemove(participant);
    setOpenDialog(true);
  };

  const confirmRemoveParticipant = () => {
    if (participantToRemove) {
      removeParticipantMutation.mutate(participantToRemove.id);
      setOpenDialog(false);
      setParticipantToRemove(null);
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setParticipantToRemove(null);
  };

  const handleRemoveLabel = (labelId: number) => {
    removeLabelMutation.mutate(labelId);
  };

  // const handleDelete = () => {
  //   if (window.confirm('Are you sure you want to move this task to trash?')) {
  //     deleteMutation.mutate();
  //   }
  // };

  if (isLoading) return <div>Loading...</div>;
  if (!task) return <div>Task not found</div>;

  // Check if current user is the owner
  const isOwner = task && user && task.owner.id === user.id;

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
              {/* <button onClick={handleDelete} className="save-btn" style={{ background: '#E74C3C' }}>
                <Trash2 size={18} /> Delete
              </button> */}
            </>
          )}
        </div>
      </div>

      <div className="form-card">
        {isEditing ? (
          // Edit Mode
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

            {/* <div className="form-group">
              <label>Status</label>
              <select 
                value={status} 
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="TODO">To Do</option>
                <option value="DOING">Doing</option>
                <option value="DONE">Done</option>
              </select>
            </div> */}

            <div className="form-group">
              <label>Progress: {progress}%</label>
              <Slider
                value={progress}
                onChange={(_e, newValue) => setProgress(newValue as number)}
                aria-labelledby="discrete-slider"
                valueLabelDisplay="auto"
                step={1}
                min={0}
                max={100}
                sx={{
                  color: progress === 100 ? '#05cd99' : progress > 0 ? '#4318ff' : '#ffb547'
                }}
              />
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

            <div className="form-group">
              <label>Participants</label>
              <div className="custom-avatar-group">
                <Avatar
                  className="avatar-owner"
                  title={task.owner.first_name + ' (Owner)'}
                >
                  {task.owner.first_name.charAt(0)}
                </Avatar>
                {task.participants.map((p, index) => (
                  <div key={p.id} className="participant-avatar-wrapper">
                    <Avatar title={p.first_name} sx={{ zIndex: 19 - index }}>
                      {p.first_name.charAt(0)}
                    </Avatar>
                    {isOwner && (
                      <button 
                        type="button" 
                        className="remove-participant-btn-small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveParticipant(p);
                        }}
                        title="Remove participant"
                      >
                        <X size={10} />
                      </button>
                    )}
                  </div>
                ))}
                {isOwner && (
                  <button 
                    type="button"
                    onClick={() => setShowParticipantInput(!showParticipantInput)} 
                    className="add-participant-btn" 
                    title="Add Participant"
                  >
                    {showParticipantInput ? <X size={16} /> : <Plus size={16} />}
                  </button>
                )}
              </div>
              {showParticipantInput && (
                <div className="add-participant-input-group" style={{ marginTop: '10px' }}>
                  <input
                    type="email"
                    value={participantEmail}
                    onChange={(e) => setParticipantEmail(e.target.value)}
                    placeholder="Invite by email..."
                    className="add-label-input"
                  />
                  <button type="button" onClick={handleAddParticipant} className="confirm-add-label-btn">
                    Invite
                  </button>
                </div>
              )}
            </div>

            <div className="form-group">
              <label>Labels</label>
              <div className="labels-container">
                {task.labels.map(label => (
                  <Chip
                    key={label.id}
                    label={'#' + label.name}
                    onDelete={() => handleRemoveLabel(label.id)}
                    style={{ backgroundColor: label.color || '#ccc', color: 'black', marginRight: '5px', marginBottom: '5px' }}
                  />
                ))}
                {showLabelInput ? (
                  <div className="add-label-input-group">
                    <input
                      type="text"
                      value={newLabel}
                      onChange={(e) => setNewLabel(e.target.value)}
                      placeholder="New label..."
                      className="add-label-input"
                      autoFocus
                    />
                    <button type="button" onClick={handleAddLabel} className="confirm-add-label-btn">
                      <Check size={18} />
                    </button>
                    <button type="button" onClick={() => { setShowLabelInput(false); setNewLabel(''); }} className="cancel-add-label-btn">
                      <X size={18} />
                    </button>
                  </div>
                ) : (
                  <button onClick={() => setShowLabelInput(true)} className="add-label-btn">
                    <Plus size={16} />
                  </button>
                )}
              </div>
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
          // View Mode
          <div className="task-view">
            <div className="view-header">
              <span className={`status-badge ${task.status.toLowerCase()}`} style={{ fontSize: '14px', padding: '8px 16px' }}>
                {task.status}
              </span>
              <span className="date-info">Created: {new Date(task.created_at).toLocaleDateString()}</span>
            </div>

            <h1 className="view-title">{task.title}</h1>
            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: '40px', marginBottom: '20px' }}>
              <div className="view-progress">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontWeight: 600, color: '#2b3674' }}>Progress:</span>
                  <Slider
                    value={task.progress}
                    valueLabelDisplay="auto"
                    sx={{
                      color: task.progress === 100 ? '#05cd99' : task.progress > 0 ? '#4318ff' : '#ffb547',
                      width: '200px',
                      '& .MuiSlider-thumb': {
                         display: 'none',
                      }
                    }}
                  />
                  <span style={{ color: '#2b3674' }}>{task.progress}%</span>
                </div>
              </div>
              {task.due_date && (
                <div className="view-due-date" style={{ marginBottom: 0 }}>
                  <strong>Due Date:</strong> {new Date(task.due_date).toLocaleString()}
                </div>
              )}
            </div>
            <div className="view-description">
              <h3>Description</h3>
              <p>{task.description || 'No description provided.'}</p>
            </div>

            <div className="view-participants">
              <h3>Participants</h3>
              <div className="custom-avatar-group" style={{ paddingLeft: '8px' }}>
                <Avatar
                  className="avatar-owner"
                  title={task.owner.first_name + ' (Owner)'}
                >
                  {task.owner.first_name.charAt(0)}
                </Avatar>
                {task.participants.map((p, index) => (
                  <Avatar 
                    key={p.id} 
                    title={p.first_name}
                    sx={{ zIndex: 19 - index }}
                  >
                    {p.first_name.charAt(0)}
                  </Avatar>
                ))}
              </div>
            </div>

            <div className="view-labels">
              <div className="labels-list">
                {task.labels.map(label => (
                  <Chip
                    key={label.id}
                    label={'#' + label.name}
                    style={{ fontSize: 14, backgroundColor: label.color || '#ccc', color: 'black', marginRight: '5px', marginBottom: '5px', padding: '8px 10px' }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Remove Participant?"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to remove participant {participantToRemove?.first_name} {participantToRemove?.last_name} ({participantToRemove?.email})?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <button onClick={handleCloseDialog} className="dialog-btn cancel">
            Cancel
          </button>
          <button onClick={confirmRemoveParticipant} className="dialog-btn delete">
            Remove
          </button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default TaskDetailPage;
