import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';
import { ArrowLeft, Save } from 'lucide-react';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import Chip from '@mui/material/Chip';
import Slider from '@mui/material/Slider';
import './TaskForm.css';

const TaskCreatePage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('TODO');
  const [progress, setProgress] = useState(0);
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [labels, setLabels] = useState<string[]>([]);
  const [labelInput, setLabelInput] = useState('');

  const createMutation = useMutation({
    mutationFn: async (newTask: { title: string; description: string; status: string; progress: number; due_date: Date | null; labels: string[] }) => {
      await api.post('/tasks/', newTask);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      navigate('/tasks');
    }
  });

  const handleAddLabel = () => {
    if (labelInput.trim() && !labels.includes(labelInput.trim())) {
      setLabels([...labels, labelInput.trim()]);
      setLabelInput('');
    }
  };

  const handleRemoveLabel = (labelToRemove: string) => {
    setLabels(labels.filter(label => label !== labelToRemove));
  };

  const handleProgressChange = (_event: Event, newValue: number | number[]) => {
    const val = newValue as number;
    setProgress(val);
    if (val === 0) setStatus('TODO');
    else if (val === 100) setStatus('DONE');
    else setStatus('DOING');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({ title, description, status, progress, due_date: dueDate, labels });
  };

  return (
    <div className="task-form-container">
      <div className="page-header">
        <button onClick={() => navigate(-1)} className="back-btn">
          <ArrowLeft size={20} /> Back
        </button>
        <h1>Create New Task</h1>
      </div>

      <div className="form-card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Task Title</label>
            <input 
              type="text" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              required 
              placeholder="Enter task title"
            />
          </div>

          <div className="form-group">
            <label>Progress: {progress}%</label>
            <Slider
              value={progress}
              onChange={handleProgressChange}
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
              placeholder="Enter task description..."
            />
          </div>

          <div className="form-group">
            <label>Labels</label>
            <div className="labels-container">
              {labels.map(label => (
                <Chip
                  key={label}
                  label={label}
                  onDelete={() => handleRemoveLabel(label)}
                  style={{ marginRight: '5px', marginBottom: '5px' }}
                />
              ))}
            </div>
            <div className="add-label-input-group" style={{ marginTop: '10px' }}>
              <input
                type="text"
                value={labelInput}
                onChange={(e) => setLabelInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddLabel(); } }}
                placeholder="Add a label and press Enter"
                className="add-label-input"
              />
              <button type="button" onClick={handleAddLabel} className="confirm-add-label-btn">
                Add
              </button>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" onClick={() => navigate('/tasks')} className="cancel-btn">
              Cancel
            </button>
            <button type="submit" className="save-btn" disabled={createMutation.isPending}>
              <Save size={18} /> {createMutation.isPending ? 'Saving...' : 'Save Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskCreatePage;
