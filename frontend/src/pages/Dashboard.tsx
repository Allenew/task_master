import { useQuery } from '@tanstack/react-query';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import api from '../api/axios';
import { CheckCircle2, Clock, ListTodo } from 'lucide-react';
import './Dashboard.css';

interface Task {
  id: number;
  title: string;
  status: 'TODO' | 'DOING' | 'DONE';
}

const Dashboard = () => {
  const { data: tasks, isLoading } = useQuery<Task[]>({
    queryKey: ['tasks'],
    queryFn: async () => {
      const response = await api.get('/tasks/');
      return response.data;
    }
  });

  if (isLoading) return <div>Loading...</div>;

  const statusCounts = tasks?.reduce((acc, task) => {
    acc[task.status] = (acc[task.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const data = [
    { name: 'To Do', value: statusCounts?.TODO || 0, color: '#FFB547' },
    { name: 'Doing', value: statusCounts?.DOING || 0, color: '#4318FF' },
    { name: 'Done', value: statusCounts?.DONE || 0, color: '#05CD99' },
  ];

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
            {tasks?.slice(0, 5).map(task => (
              <li key={task.id} className="recent-task-item">
                <span className={`status-dot ${task.status.toLowerCase()}`}></span>
                {task.title}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
