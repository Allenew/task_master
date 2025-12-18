import { useQuery } from '@tanstack/react-query';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { TagCloud } from 'react-tagcloud';
import api from '../api/axios';
import { CheckCircle2, Clock, ListTodo } from 'lucide-react';
import './Dashboard.css';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

interface Task {
  id: number;
  title: string;
  status: 'TODO' | 'DOING' | 'DONE';
  created_at: string;
}

interface Label {
  id: number;
  name: string;
  color: string;
  count: number;
}

const Dashboard = () => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const {
    data: tasks,
    isLoading: tasksLoading  
  } = useQuery<Task[]>({
    queryKey: ['tasks-all'],
    queryFn: async () => {
      const response = await api.get('/tasks/all');
      return response.data;
    },
    enabled: isAuthenticated && !authLoading,
    retry: false,
  });

  const { data: labels, isLoading: labelsLoading } = useQuery<Label[]>({
    queryKey: ['labelsWithCount'],
    queryFn: async () => {
      const response = await api.get('/labels/with_count');
      return response.data;
    },
    enabled: isAuthenticated && !authLoading,
  });

  if (authLoading || tasksLoading || labelsLoading) return <div>Loading...</div>;

  const statusCounts = tasks?.reduce((acc, task) => {
    acc[task.status] = (acc[task.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const data = [
    { name: 'To Do', value: statusCounts?.TODO || 0, color: '#FFB547' },
    { name: 'Doing', value: statusCounts?.DOING || 0, color: '#4318FF' },
    { name: 'Done', value: statusCounts?.DONE || 0, color: '#05CD99' },
  ];

  const tagCloudData = labels?.map(label => ({
    value: label.name,
    count: label.count,
    color: label.color,
  }));

  const customRenderer = (tag: any, size: number) => (
    <span
      key={tag.value}
      style={{
        fontSize: `${size}px`,
        color: tag.color,
        margin: '3px',
        padding: '3px',
        display: 'inline-block',
        cursor: 'pointer',
      }}
      title={`Count: ${tag.count}`}
    >
      {tag.value}
    </span>
  );

  const sortedTasks = tasks?.slice().sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return (
    <div className="dashboard-container">
      <h1>Dashboard</h1>
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon todo-icon"><ListTodo /></div>
          <div className="stat-info">
            <p>To Do</p>
            <h3>{statusCounts?.TODO || 0}</h3>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon doing-icon"><Clock /></div>
          <div className="stat-info">
            <p>In Progress</p>
            <h3>{statusCounts?.DOING || 0}</h3>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon done-icon"><CheckCircle2 /></div>
          <div className="stat-info">
            <p>Completed</p>
            <h3>{statusCounts?.DONE || 0}</h3>
          </div>
        </div>
      </div>

      <div className="charts-section">
        <div className="chart-card">
          <h3>Task Status Distribution</h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="recent-tasks-card">
          <h3>Recent Tasks</h3>
          <ul className="recent-task-list">
            {sortedTasks?.slice(0, 5).map(task => (
              <li key={task.id} className="recent-task-item">
                <span className={`status-dot ${task.status.toLowerCase()}`}></span>
                <Link to={`/tasks/${task.id}`} className="task-title-link">
                  {task.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="chart-card">
          <h3>Label Cloud</h3>
          <div className="chart-container">
            {tagCloudData && tagCloudData.length > 0 ? (
              <div style={{ width: '100%', textAlign: 'center' }}>
                <TagCloud
                  minSize={12}
                  maxSize={35}
                  tags={tagCloudData}
                  renderer={customRenderer}
                  className="tag-cloud"
                />
              </div>
            ) : (
              <p>No labels found.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
